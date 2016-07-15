
export default class OSSAPI {

  constructor(opts) {

    this.apiUrl = opts.apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getData () {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/data`

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

