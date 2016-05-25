var config = require('c0nfig').serverConfig
var DMSvc = require('../services/DMSvc')
var express = require('express')

module.exports = function() {

  var router = express.Router()

  var dmSvc = new DMSvc(config)

  var token = 'cc3Jl3FfyFUqLGRPFWVEXGJPAZBJ';

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs', function (req, res) {

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

    var hubId =  req.params.hubId;

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

    var hubId = req.params.hubId;

    var projectId = req.params.projectId;

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

    var projectId = req.params.projectId;

    var folderId = req.params.folderId;

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

    var projectId = req.params.projectId;

    var itemId = req.params.itemId;

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