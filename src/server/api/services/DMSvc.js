
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

    console.log(this._config.endPoints.user)

    return get(this._config.endPoints.user, token);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getHubs (token) {

    return get(this._config.endPoints.hubs, token);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getProjects (token, hubId) {

    var url = util.format(
      this._config.endPoints.projects,
      hubId);

    return get(url, token);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getProject (token, hubId, projectId) {

    var url = util.format(
      this._config.endPoints.project,
      hubId, projectId);

    return get(url, token);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getFolderContent (token, projectId, folderId) {

    var url = util.format(
      this._config.endPoints.folderContent,
      projectId, folderId);

    return get(url, token);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getItemVersions (token, projectId, itemId) {

    var url = util.format(
      this._config.endPoints.itemVersions,
      projectId, itemId);

    return get(url, token);
  }
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function get(url, token) {

  return new Promise( function(resolve, reject) {

    request({
      url: url,
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, function (err, response, body) {

      try {

        if (err) {

          console.log('error: ' + url)
          console.log(err)

          return reject(err);
        }

        body = JSON.parse(trim(body));

        if (body.errors) {

          console.log('body error: ' + url)
          console.log(body.errors)

          return reject(body.errors);
        }

        return resolve(body.data || body);
      }
      catch(ex){

        console.log(body)
        console.log(url)

        return reject(ex);
      }
    })
  })
}