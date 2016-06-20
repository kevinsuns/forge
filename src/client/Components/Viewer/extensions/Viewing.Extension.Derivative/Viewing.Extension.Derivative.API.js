
export default class DerivativeAPI {

  constructor(opts) {

    this.apiUrl = opts.apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  postJob(payload) {

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
  getMetadata(urn) {

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
  getDerivativeURN (params, onProgress = null) {

    return new Promise(async(resolve, reject) => {

      try {

        while(true) {

          var manifest = await this.getManifest(
            params.urn)

          if(manifest.status === 'error') {

            return reject(manifest)
          }

          if(!manifest.derivatives) {

            return reject(manifest)
          }

          var derivativeResult = await findDerivative(
            manifest, params)

          //console.log(derivativeResult)

          if(derivativeResult.target &&
             derivativeResult.target.status === 'success') {

            onProgress ? onProgress('complete') : ''

            return resolve({
              status: 'success',
              derivativeUrn: derivativeResult.target.urn
            })
          }

          // if no parent -> no derivative of this type
          // OR
          // if parent complete and no target -> derivative not requested

          if(!derivativeResult.parent) {

            onProgress ? onProgress('0%') : ''

            return resolve({
              status: 'not found'
            })
          }

          if(derivativeResult.parent.status === 'success') {

            if(!derivativeResult.target) {

              onProgress ? onProgress('0%') : ''

              return resolve({
                status: 'not found'
              })
            }
          }

          var progress = manifest.progress.split(' ')[0]

          onProgress ? onProgress(progress) : ''

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
  buildDownloadUrl(urn, derivativeUrn, filename) {

    return `${this.apiUrl}/download?` +
      `urn=${urn}&` +
      `derivativeUrn=${encodeURIComponent(derivativeUrn)}&` +
      `filename=${encodeURIComponent(filename)}`
  }
}

///////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////
function findDerivative(manifest, params) {

  return new Promise(async(resolve, reject) => {

    try {

      var parentDerivative = null

      manifest.derivatives.forEach((derivative) => {

        if (derivative.outputType === params.outputType) {

          parentDerivative = derivative

          if (derivative.children) {

            derivative.children.forEach((childDerivative) => {

              // match objectId
              if(_.isEqual(
                  childDerivative.objectIds,
                  params.objectIds)) {

                resolve({
                  parent: parentDerivative,
                  target: childDerivative
                })
              }
            })
          }
        }
      })

      return resolve({
        parent: parentDerivative
      })
    }
    catch(ex){

      return reject(ex)
    }
  })
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
