
export default class DerivativeAPI {

  constructor(opts) {

    this.apiUrl = opts.apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  postJob(params) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/job`

        var payload = {
          outputType: params.outputType,
          objectIds: params.objectIds,
          guid: params.guid,
          urn: params.urn
        }

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

      try {

        var url = `${this.apiUrl}/manifest/${urn}`

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

          if(manifest.status === 'error') {

            return reject(manifest)
          }

          if(manifest.status === 'success' &&
             manifest.progress === 'complete') {

            return resolve(manifest)
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

          console.log(derivativeResult)

          if(derivativeResult.target &&
             derivativeResult.target.status === 'success') {

            onProgress ? onProgress('complete') : ''

            return resolve({
              status: 'success',
              derivativeURN: derivativeResult.target.urn
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
  buildDownloadUrl(urn, derivativeURN, filename) {

    return `${this.apiUrl}/download?` +
      `urn=${urn}&` +
      `derivativeURN=${encodeURIComponent(derivativeURN)}&` +
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

              //TODO match objectId when API is fixed

              return resolve({
                parent: parentDerivative,
                target: childDerivative
              })
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
