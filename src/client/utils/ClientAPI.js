
export default class ClientAPI {

  /////////////////////////////////////////////////////////////
  // constructor
  //
  /////////////////////////////////////////////////////////////
  constructor(apiUrl) {

    this.apiUrl = apiUrl
  }

  /////////////////////////////////////////////////////////////
  // fetch wrapper
  //
  /////////////////////////////////////////////////////////////
  fetch(url, params) {

    return fetch(url, params).then(response => {

      return response.json().then(json => {

        return response.ok ? json : Promise.reject(json);
      })
    })
  }

  /////////////////////////////////////////////////////////////
  // $.ajax wrapper
  //
  /////////////////////////////////////////////////////////////
  ajax(url, type = 'GET', data = null) {

    return new Promise((resolve, reject) => {

      $.ajax({ url, type, data,

        success: (response)=> {

          resolve(response)
        },
        error: function (error) {

          reject(error)
        }
      })
    })
  }
}