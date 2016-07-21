
import ClientAPI from 'ClientAPI'

export default class DerivativeAPI extends ClientAPI {

  constructor (opts) {

    super(opts.apiUrl)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  postJob (payload) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/job`

        var response = await post(url, payload)

        return resolve(response)
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getFormats () {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/formats`

        $.get(url, (response)=> {

          return resolve(response.formats)
        })
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getMetadata (urn) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/metadata/${urn}`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getManifest (urn) {

    return new Promise(async(resolve, reject) => {

      var url = `${this.apiUrl}/manifest/${urn}`

      $.get(url).success((res)=> {

        return resolve(res)

      }).error((jqXHR, textStatus, error) => {

        return reject(error)
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getProperties (urn, guid) {

    return new Promise(async(resolve, reject) => {

      var url = `${this.apiUrl}/properties/${urn}/${guid}`

      $.get(url).success((res)=> {

        return resolve(res)

      }).error((jqXHR, textStatus, error) => {

        return reject(error)
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getHierarchy (urn, guid) {

    return new Promise(async(resolve, reject) => {

      var url = `${this.apiUrl}/hierarchy/${urn}/${guid}`

      $.get(url).success((res)=> {

        return resolve(res)

      }).error((jqXHR, textStatus, error) => {

        return reject(error)
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getThumbnail(urn, options = { width:100, height:100 }) {

    return new Promise(async(resolve, reject) => {

      try {

        var query = `width=${options.width}&height=${options.height}`

        var url = `${this.apiUrl}/thumbnails/${urn}?${query}`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  waitJob (urn, onProgress) {

    return new Promise(async(resolve, reject) => {

      try {

        while(true) {

          var manifest = await this.getManifest(urn)

          if(manifest.status === 'failed') {

            return reject(manifest)
          }

          if(manifest.status   === 'success' &&
             manifest.progress === 'complete') {

            return resolve(manifest)
          }

          var progress = manifest.progress.split(' ')[0]

          var loop = onProgress ? onProgress(progress) : true

          if(!loop) {

            return reject('cancelled')
          }

          await sleep(1000)
        }
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  deleteManifest (urn) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/manifest/${urn}`

        $.ajax({
          url: url,
          type: 'DELETE',
          success: (response) => {

            return resolve(response)
          },
          error: (err) => {

            return reject(err)
          }
        })
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  findDerivative (manifest, params) {

    var parentDerivative = null

    for(var i = 0; i < manifest.derivatives.length; ++i) {

      var derivative = manifest.derivatives[i]

      if (derivative.outputType === params.outputType) {

        parentDerivative = derivative

        if (derivative.children) {

          for(var j = 0; j < derivative.children.length; ++j) {

            var childDerivative = derivative.children[j]

            if(derivative.outputType !== 'obj'){

              return {
                parent: parentDerivative,
                target: childDerivative
              }
            }

            // match objectId
            else if(_.isEqual(
                childDerivative.objectIds,
                params.objectIds)) {

              return {
                parent: parentDerivative,
                target: childDerivative
              }
            }
          }
        }
      }
    }

    return {
      parent: parentDerivative
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getDerivativeURN (params, onProgress = null, skipNotFound = false) {

    return new Promise(async(resolve, reject) => {

      try {

        while(true) {

          var manifest = await this.getManifest(
            params.urn)

          //if(manifest.status === 'failed') {
          //  return reject(manifest)
          //}

          if(!manifest.derivatives) {

            return reject(manifest)
          }

          var derivativeResult = this.findDerivative(
            manifest, params)

          if(derivativeResult.target) {

            var progress = manifest.progress.split(' ')[0]

            progress = (progress === 'complete' ? '100%' : progress)

            onProgress ? onProgress(progress) : ''

            if (derivativeResult.target.status === 'success') {

              onProgress ? onProgress('100%') : ''

              return resolve({
                status: 'success',
                derivativeUrn: derivativeResult.target.urn
              })

            } else if (derivativeResult.target.status === 'failed') {

              onProgress ? onProgress('failed') : ''

              return reject({
                status: 'failed'
              })
            }
          }

          // if no parent -> no derivative of this type
          // OR
          // if parent complete and no target -> derivative not requested

          if(!derivativeResult.parent) {

            onProgress ? onProgress('0%') : ''

            if(!skipNotFound) {

              return resolve({
                status: 'not found'
              })
            }

          } else if(derivativeResult.parent.status === 'success') {

            if(!derivativeResult.target) {

              onProgress ? onProgress('0%') : ''

              if(!skipNotFound) {

                return resolve({
                  status: 'not found'
                })
              }
            }
          }

          await sleep(1000)
        }
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getDownloadURI(urn, derivativeUrn, filename) {

    return `${this.apiUrl}/download?` +
      `urn=${urn}&` +
      `derivativeUrn=${encodeURIComponent(derivativeUrn)}&` +
      `filename=${encodeURIComponent(filename)}`
  }

  /////////////////////////////////////////////////////////////////
  // Download util
  //
  /////////////////////////////////////////////////////////////////
  downloadURI(uri, name) {

    var link = document.createElement("a")
    link.download = name
    link.href = uri
    link.click()
  }
}

///////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////
async function sleep(ms) {

  return new Promise((resolve, reject)=> {

      setTimeout( ()=>{
        resolve()
      }, ms)
  })
}

///////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////
function post(url, payload = null) {

  return new Promise((resolve, reject)=> {

    $.ajax({
      url: url,
      type: 'POST',
      data: {
        payload: JSON.stringify(payload)
      },
      success: (response)=> {

        return resolve(response);
      },
      error: function (error) {

        return reject(error);
      }
    });
  });
}
