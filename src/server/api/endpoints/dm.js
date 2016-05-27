import ServiceManager from '../services/SvcManager'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  var hardcodedToken = 'cxNIKhBXw1iCgdPBFfALiQDhfAaH';

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs', function (req, res) {

    var token = req.session.token || hardcodedToken

    var dmSvc = ServiceManager.getService(
      'DMSvc');

    console.log(token)

    dmSvc.getHubs(token).then(function(response){

      res.json(response)

    }, function(err){

      console.log(err)

      res.status(500)
      res.json(err)
    })
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects', function (req, res) {

    var token = req.session.token || hardcodedToken

    var hubId =  req.params.hubId

    var dmSvc = ServiceManager.getService(
      'DMSvc');

    dmSvc.getProjects(token, hubId).then(function(response){

      res.json(response)

    }, function(err){

      console.log(err)

      res.status(500)
      res.json(err)
    })
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects/:projectId', function (req, res) {

    var token = req.session.token || hardcodedToken

    var hubId = req.params.hubId

    var projectId = req.params.projectId

    var dmSvc = ServiceManager.getService(
      'DMSvc');

    dmSvc.getProject(token, hubId, projectId).then(function(response){

      res.json(response)

    }, function(err){

      console.log(err)

      res.status(500)
      res.json(err)
    })
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId', function (req, res) {

    var token = req.session.token || hardcodedToken

    var projectId = req.params.projectId

    var folderId = req.params.folderId

    var dmSvc = ServiceManager.getService(
      'DMSvc');

    dmSvc.getFolderContent(token, projectId, folderId).then(function(response){

      res.json(response)

    }, function(err){

      console.log(err)

      res.status(500)
      res.json(err)
    })
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/versions', function (req, res) {

    var token = req.session.token || hardcodedToken

    var projectId = req.params.projectId

    var itemId = req.params.itemId

    var dmSvc = ServiceManager.getService(
      'DMSvc');

    dmSvc.getItemVersions(token, projectId, itemId).then(function(response){

      res.json(response)

    }, function(err){

      console.log(err)

      res.status(500)
      res.json(err)
    })
  });

  return router;
}