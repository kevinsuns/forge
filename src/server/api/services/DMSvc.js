var Promise = require('es6-promise').Promise
var request = require('request')
var trim = require('trim')
var util = require('util')

module.exports = function(config) {

  var _self = this;

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

          return resolve(body.data);
        }
        catch(ex){

          console.log(body)
          console.log(url)
          return reject(ex);
        }
      })
    })
  }

  _self.getHubs = function (token) {

    return get(config.endPoints.hubs, token);
  }

  _self.getProjects = function (token, hubId) {

    var url = util.format(
      config.endPoints.projects,
      hubId);

    return get(url, token);
  }

  _self.getProject = function (token, hubId, projectId) {

    var url = util.format(
      config.endPoints.project,
      hubId, projectId);

    return get(url, token);
  }

  _self.getFolderContent = function (token, projectId, folderId) {

    var url = util.format(
      config.endPoints.folderContent,
      projectId, folderId);

    return get(url, token);
  }

  _self.getItemVersions = function (token, projectId, itemId) {

    var url = util.format(
      config.endPoints.itemVersions,
      projectId, itemId);

    return get(url, token);
  }

  //getThumbnail: function (thumbnailUrn, env, token, onsuccess){
  //
  //  console.log('Requesting ' + config.baseURL(env) + config.thumbail(thumbnailUrn));
  //
  //  request({
  //    url: config.baseURL(env) + config.thumbail(thumbnailUrn),
  //    method: "GET",
  //    headers: {
  //      'Authorization': 'Bearer ' + token,
  //      'x-ads-acm-namespace': 'WIPDMSecured',
  //      'x-ads-acm-check-groups': true
  //    },
  //    encoding: null
  //  }, function (error, response, body) {
  //    onsuccess(new Buffer(body, 'base64'));
  //  });
  //}
}