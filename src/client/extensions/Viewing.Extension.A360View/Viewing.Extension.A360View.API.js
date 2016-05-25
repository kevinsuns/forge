
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

        let res = await fetch(
          `${this.apiUrl}/hubs`)

        let hubs = await res.json()

        if(res.status!== 200){

          return reject(json)
        }

        return resolve(hubs)
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

        let res = await fetch(
          `${this.apiUrl}/hubs/${hubId}/projects`)

        let json = await res.json()

        if(res.status!== 200){

          return reject(json)
        }

        return resolve(json)
      }
      catch(ex) {

        reject(ex)
      }
    });
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId/root
  //
  ///////////////////////////////////////////////////////////////////
  getRootFolder(hubId, projectId) {

    return new Promise(async(resolve, reject) => {

      try {

        let res = await fetch(
          `${this.apiUrl}/hubs/${hubId}/projects/${projectId}/root`)

        let json = await res.json()

        if(res.status!== 200){

          return reject(json)
        }

        return resolve(json)
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

        let res = await fetch(
          `${this.apiUrl}/projects/${projectId}/folders/${folderId}`)

        let json = await res.json()

        if(res.status!== 200){

          return reject(json)
        }

        return resolve(json)
      }
      catch(ex) {

        return reject(ex)
      }
    });
  }
}

