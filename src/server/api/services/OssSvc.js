
import BaseSvc from './BaseSvc'
import jsonfile from 'jsonfile'
import request from 'request'
import util from 'util'
import fs from 'fs'

export default class OssSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(opts) {

    super(opts)

    this.loadData()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'OssSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  loadData () {

    jsonfile.readFile(this._config.storageFile,
      (err, oss) => {

        if(err) {

          this.data = {}

        } else {

          this.data = oss
        }

        if(!this.data[this._config.oauth.clientId]) {
          this.data[this._config.oauth.clientId] = {}
        }
      })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  saveBucket (response) {

    this.data[this._config.oauth.clientId]
      [response.bucketKey] = []

    jsonfile.writeFile(
      this._config.storageFile,
      this.data, function (err) {
      })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  saveObject (response) {

    this.data[this._config.oauth.clientId]
      [response.bucketKey].push(
        response.objectKey)

    jsonfile.writeFile(
      this._config.storageFile,
      this.data, function (err) {
      })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getData () {

    return this.data[this._config.oauth.clientId]
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  parseObjectId (objectId) {

    var parts = objectId.split('/')

    var bucketKey = parts[0].split(':').pop()

    var objectKey = parts[1]

    return {
      bucketKey,
      objectKey
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createBucket (token, bucketCreationData) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = this._config.endPoints.buckets

        bucketCreationData.bucketKey = validateBucketKey(
          bucketCreationData.bucketKey)

        var response = await requestAsync({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: bucketCreationData,
          method: 'POST',
          json: true,
          url: url
        })

        this.saveBucket(response)

        resolve(response)

      } catch(ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  upload (token, bucketKey, objectKey, file) {

    return new Promise((resolve, reject) => {

      try {

        fs.readFile(file.path, async(err, data) => {

          if (err) {

            return reject(err)
          }

          var url = util.format(
            this._config.endPoints.upload,
            bucketKey, objectKey)

          var response = await requestAsync({
            method: 'PUT',
            headers: {
              'Content-Type': getMimeType(file),
              'Authorization': 'Bearer ' + token
            },
            body: data,
            json: true,
            url: url
          })

          this.saveObject(response)

          resolve(response)
        })
      }
      catch (ex) {

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
      }
      catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}

/////////////////////////////////////////////////////////////////
// Get mime type
//
/////////////////////////////////////////////////////////////////
function getMimeType (file) {

  var extension = file.originalname.split('.').pop()

  var types = {

    png: 'application/image',
    jpg: 'application/image',
    txt: 'application/txt',
    ipt: 'application/vnd.autodesk.inventor.part',
    iam: 'application/vnd.autodesk.inventor.assembly',
    dwf: 'application/vnd.autodesk.autocad.dwf',
    dwg: 'application/vnd.autodesk.autocad.dwg',
    f3d: 'application/vnd.autodesk.fusion360',
    f2d: 'application/vnd.autodesk.fusiondoc',
    rvt: 'application/vnd.autodesk.revit'
  }

  return types[extension] || file.mimetype
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function validateBucketKey (bucketKey) {

  var result = bucketKey.replace(
    /[&\/\\#,+()$~%. '":*?<>{}]/g,'-')

  return result.toLowerCase()
}

