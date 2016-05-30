import ServiceManager from '../services/SvcManager'
import express from 'express'
import request from 'request'

module.exports = function() {

  var router = express.Router()

  var hardcodedToken = 'PfRBxF6rVEIlv0zYhbgPtygTnZPz'; //used for debug

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/user', async (req, res) => {

    try {

      var token = req.session.token || hardcodedToken

      var dmSvc = ServiceManager.getService('DMSvc');

      var response = await dmSvc.getUser(token)

      console.log('USER: ' + response)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(500)
      res.json(ex)
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs', async (req, res) => {

    try {

      var token = req.session.token || hardcodedToken

      var dmSvc = ServiceManager.getService('DMSvc');

      var response = await dmSvc.getHubs(token)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(500)
      res.json(ex)
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects', async (req, res) => {

    try {

      var token = req.session.token || hardcodedToken

      var hubId =  req.params.hubId

      var dmSvc = ServiceManager.getService('DMSvc');

      var response = await dmSvc.getProjects(
        token, hubId)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(500)
      res.json(ex)
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects/:projectId', async (req, res) => {

    try {

      var token = req.session.token || hardcodedToken

      var hubId =  req.params.hubId

      var projectId = req.params.projectId

      var dmSvc = ServiceManager.getService('DMSvc');

      var response = await dmSvc.getProject(
        token, hubId, projectId)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(500)
      res.json(ex)
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId', async (req, res) => {

    try {

      var token = req.session.token || hardcodedToken

      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var dmSvc = ServiceManager.getService('DMSvc');

      var response = await dmSvc.getFolderContent(
        token, projectId, folderId)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(500)
      res.json(ex)
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/versions', async (req, res) => {

    try {

      var token = req.session.token || hardcodedToken

      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var dmSvc = ServiceManager.getService('DMSvc');

      var response = await dmSvc.getItemVersions(
        token, projectId, itemId)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(500)
      res.json(ex)
    }
  });

  return router;
}