
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // GET /user
  // Get current user
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/user', async (req, res) => {

    try {

      var authSvc = ServiceManager.getService(
        'AuthSvc');

      var token = await authSvc.getToken(req)
      
      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getUser(
        token.access_token)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /hubs
  // Get all hubs
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs', async (req, res) => {

    try {

      var authSvc = ServiceManager.getService(
        'AuthSvc');

      var token = await authSvc.getToken(req)
      
      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getHubs(
        token.access_token)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /hubs/{hubId}/projects
  // Get all hub projects
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects', async (req, res) => {

    try {
      
      var hubId = req.params.hubId

      var authSvc = ServiceManager.getService(
        'AuthSvc');

      var token = await authSvc.getToken(req)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getProjects(
        token.access_token, hubId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //  GET /hubds/{hubId}/projects/{projectId}
  //  Get project content
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects/:projectId', async (req, res) => {

    try {
      
      var hubId = req.params.hubId

      var projectId = req.params.projectId

      var authSvc = ServiceManager.getService(
        'AuthSvc');

      var token = await authSvc.getToken(req)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getProject(
        token.access_token, hubId, projectId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/folders/{folderId}
  // Get folder content
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId', async (req, res) => {

    try {
      
      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var authSvc = ServiceManager.getService(
        'AuthSvc');

      var token = await authSvc.getToken(req)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getFolderContent(
        token.access_token, projectId, folderId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /project/{projectId}/items/{itemId}/versions
  // Get all item versions
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/versions', async (req, res) => {

    try {
      
      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var authSvc = ServiceManager.getService(
        'AuthSvc');

      var token = await authSvc.getToken(req)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getItemVersions(
        token.access_token, projectId, itemId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })
  
  return router
}