
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

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)

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

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)

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

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)

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

    return new Promise(async(resolve, reject) =>{

      try {

        var url = `${this.apiUrl}/buckets/` +
          `${bucketKey}/objects/` +
          `${objectKey}/details`

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  deleteObject (bucketKey, objectKey) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets/` +
          `${bucketKey}/objects/` +
          `${objectKey}`

        var res = await fetch(url, {
          method: 'DELETE'
        })

        var json = await res.json()

        resolve(json)

      } catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createBucket (bucketCreationData) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/buckets`

        var payload = {
          bucketCreationData
        }

        var res = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        var json = await res.json()

        resolve(json)

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

