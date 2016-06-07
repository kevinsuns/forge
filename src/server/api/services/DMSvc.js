
import BaseSvc from './BaseSvc'
import request from 'request'
import trim from 'trim'
import util from 'util'

export default class DMSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(opts) {

    super(opts);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'DMSvc';
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
      hubId);

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
      hubId, projectId);

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
      projectId, folderId);

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
  getItemVersions (token, projectId, itemId) {

    var url = util.format(
      this._config.endPoints.itemVersions,
      projectId, itemId);

    return requestAsync({
      token: token,
      json: true,
      url: url
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
      headers: {
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

        if (body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          return reject(body.errors)
        }

        return resolve(body.data || body)
      }
      catch(ex){

        console.log(params.url)
        console.log(body)

        return reject(ex)
      }
    })
  })
}