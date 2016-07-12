
import BaseSvc from './BaseSvc'
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