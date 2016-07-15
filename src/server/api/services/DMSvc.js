
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import request from 'request'
import util from 'util'

export default class DMSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(opts) {

    super(opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'DMSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getUser (token) {

    var url = this._config.endPoints.user

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getHubs (token) {

    var url = this._config.endPoints.hubs

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getProjects (token, hubId) {

    var url = util.format(
      this._config.endPoints.projects,
      hubId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getProject (token, hubId, projectId) {

    var url = util.format(
      this._config.endPoints.project,
      hubId, projectId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getFolderContent (token, projectId, folderId) {

    var url = util.format(
      this._config.endPoints.folderContent,
      projectId, folderId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getVersions (token, projectId, itemId) {

    var url = util.format(
      this._config.endPoints.versions,
      projectId, itemId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createStorage (token, projectId, folderId, filename) {

    var url = util.format(
      this._config.endPoints.storage,
      projectId)

    return requestAsync({
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + token
      },
      body: createStorageSpec(folderId, filename),
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createVersion (
    token, projectId, folderId, objectId, versionId, filename) {

    var url = util.format(
      this._config.endPoints.items,
      projectId)

    return requestAsync({
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + token
      },
      body: createVersionSpec (
        folderId, objectId, versionId, filename),
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  uploadFile (token, projectId, folderId, file) {

    return new Promise(async(resolve, reject) => {

      try {

        var filename = file.originalname

        var storage = await this.createStorage(
          token, projectId, folderId, filename)

        var ossSvc = ServiceManager.getService('OssSvc')

        var objectId = ossSvc.parseObjectId(storage.id)

        var upload = await ossSvc.upload(
          token,
          objectId.bucketKey,
          objectId.objectKey,
          file)

        var versionId = '1'

        var item = await this.createVersion(
          token,
          projectId,
          folderId,
          storage.id,
          versionId,
          filename)

        var response = {
          storage,
          upload,
          item
        }

        resolve(response)

      } catch (ex) {

        reject(ex)
      }
    })
  }
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise( function(resolve, reject) {

    request({
      url: params.url,
      method: params.method || 'GET',
      headers: params.headers || {
        'Authorization': 'Bearer ' + params.token
      },
      json: params.json,
      body: params.body
    }, function (err, response, body) {

      try {

        if (err) {

          console.log('error: ' + params.url)
          console.log(err)

          return reject(err)
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          return reject(body.errors)
        }

        if (response && [200, 201, 202].indexOf(
            response.statusCode) < 0) {

          return reject(response.statusMessage)
        }

        return resolve(body.data || body)

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}

/////////////////////////////////////////////////////////////////
// Creates storage payload
//
/////////////////////////////////////////////////////////////////
function createStorageSpec (folderId, filename) {

  return {
    data: {
      type: 'object',
      attributes: {
        name: filename
      },
      relationships: {
        target: {
          data: {
            type: 'folders',
            id: folderId
          }
        }
      }
    }
  }
}

/////////////////////////////////////////////////////////////////
// Creates version payload
//
/////////////////////////////////////////////////////////////////
function createVersionSpec (
  folderId, objectId, versionId, filename) {
  
  return {
  
    jsonapi: {
      version: '1.0'
    },
    data: [
      {
        type: 'items',
        attributes: {
          name: filename,
          extension: {
            type: 'items:autodesk.core:File',
            version: '1.0'
          }
        },
        relationships: {
          tip: {
            data: {
              type: 'versions',
              id: versionId
            }
          },
          parent: {
            data: {
              type: 'folders',
              id: folderId
            }
          }
        }
      }
    ],
    included: [ {
        type: 'versions',
        id: versionId,
        attributes: {
          name: filename
        },
        relationships: {
          storage: {
            data: {
              type: 'objects',
              id: objectId
            }
          }
        }
      }
    ]
  }
}