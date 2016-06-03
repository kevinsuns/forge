
export default class DerivativeAPI {

  constructor(opts) {

    this.apiUrl = opts.apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  postSVFJob(urn) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/job`

        var payload = {
          urn: urn,
          type: 'svf'
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
  postObjJob(urn, opts) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/job`

        var payload = {
          urn: urn,
          type: 'obj',
          guid: opts.guid,
          objectIds: opts.objectIds
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
  getObjDerivativeURN (urn, guid, objectIds) {

    return new Promise(async(resolve, reject) => {

      try {

        var job = await this.postObjJob(urn, {
          objectIds: Array.isArray(objectIds) ? objectIds : [objectIds],
          guid: guid
        })

        console.log('Job:')
        console.log(job)

        if(!(job.result === 'success' ||
             job.Result === 'created')) {

          return reject(job)
        }

        var manifest = null

        while(true) {

          manifest = await this.getManifest(urn)

          if(manifest.status === 'inprogress'){

            var progress = manifest.progress.split(' ')[0]
            console.log('Progress: ' + progress)
          }

          if(manifest.status === 'error'){

            return reject(manifest)
          }

          if(manifest.progress === 'complete'){

            break
          }

          await sleep(1000)
        }

        manifest.derivatives.forEach((derivative) => {

          if (derivative.outputType === 'obj') {

            derivative.children.forEach((childDerivative) => {

              //console.log(childDerivative)

              var derivativeURN = 'urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2lwLmRtLnN0Zy9iYzZiNjVkMi1hYmRhLTQzOTgtODQ0Yi00NmIzODY5OGJiZDQuZHdm/output/geometry/ce0265a9-f04c-420d-b66a-6764924313cb.obj'

              return resolve(derivativeURN)
            })
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
