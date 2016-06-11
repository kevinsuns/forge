
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/user', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getUser(token)

      console.log('USER: ' + response)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getHubs(token)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var hubId = req.params.hubId

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getProjects(
        token, hubId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects/:projectId', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var hubId = req.params.hubId

      var projectId = req.params.projectId

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getProject(
        token, hubId, projectId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getFolderContent(
        token, projectId, folderId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/versions', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getItemVersions(
        token, projectId, itemId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })
  
  return router
}