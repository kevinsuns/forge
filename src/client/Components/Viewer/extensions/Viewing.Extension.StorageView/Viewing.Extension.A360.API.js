
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

        var url = `${this.apiUrl}/hubs`

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)
      }
      catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getProjects(hubId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/hubs/${hubId}/projects`

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)
      }
      catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId
  //
  ///////////////////////////////////////////////////////////////////
  getProject(hubId, projectId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/hubs/${hubId}/projects/${projectId}`

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)
      }
      catch(ex) {

        reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  ///////////////////////////////////////////////////////////////////
  getFolderContent(projectId, folderId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/projects/${projectId}/folders/${folderId}`

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/versions
  //
  ///////////////////////////////////////////////////////////////////
  getVersions(projectId, itemId) {

    return new Promise(async(resolve, reject) => {

      try {

        var url = `${this.apiUrl}/projects/${projectId}/items/${itemId}/versions`

        var res = await fetch(url)

        var json = await res.json()

        resolve(json)
      }
      catch(ex) {

        return reject(ex)
      }
    })
  }
}

