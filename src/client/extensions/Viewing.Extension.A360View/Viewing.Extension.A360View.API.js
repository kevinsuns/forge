
export default class A360API {

  constructor(opts) {

    this.apiUrl = opts.apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getHubs() {

    return new Promise(async(resolve, reject) => {

      try {

        //let res = await fetch(
        //  `${this.apiUrl}/hubs`)
        //
        //let hubs = await res.json()
        //
        //if(res.status!== 200){
        //
        //  return reject(json)
        //}
        //
        //return resolve(hubs)

        var url = `${this.apiUrl}/hubs`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        reject(ex)
      }
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getProjects(hubId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/hubs/${hubId}/projects`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        reject(ex)
      }
    });
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId
  //
  ///////////////////////////////////////////////////////////////////
  getProject(hubId, projectId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/hubs/${hubId}/projects/${projectId}`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        reject(ex)
      }
    });
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  ///////////////////////////////////////////////////////////////////
  getFolderContent(projectId, folderId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/projects/${projectId}/folders/${folderId}`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        return reject(ex)
      }
    });
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/versions
  //
  ///////////////////////////////////////////////////////////////////
  getItemVersions(projectId, itemId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/projects/${projectId}/items/${itemId}/versions`

        $.get(url, (res)=> {

          return resolve(res)
        })
      }
      catch(ex) {

        return reject(ex)
      }
    });
  }
}

