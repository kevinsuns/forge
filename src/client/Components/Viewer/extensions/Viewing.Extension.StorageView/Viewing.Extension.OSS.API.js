
export default class OSSAPI {

  constructor(opts) {

    this.apiUrl = opts.apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getBuckets () {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets`

        $.get(url, (res)=> {

          return resolve(res)
        })

      } catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getObjects (bucketKey) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets/${bucketKey}/objects`

        $.get(url, (res)=> {

          return resolve(res)
        })

      } catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getBucketDetails (bucketKey) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets/`+
          `${bucketKey}/details`

        $.get(url, (res)=> {

          return resolve(res)
        })

      } catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getObjectDetails (bucketKey, objectKey) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets/`+
          `${bucketKey}/objects/` +
          `${objectKey}/details`

        $.get(url, (res)=> {

          return resolve(res)
        })

      } catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createBucket (bucketData) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets`

        var response = await post(url, bucketData)

        return resolve(response)

      } catch(ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Download util
  //
  /////////////////////////////////////////////////////////////////
  download(bucketKey, objectKey) {

    var uri = `${this.apiUrl}/buckets/` +
      `${bucketKey}/objects/${objectKey}`

    var link = document.createElement("a")
    link.download = objectKey
    link.href = uri
    link.click()
  }
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

