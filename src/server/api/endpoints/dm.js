
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import findRemoveSync from 'find-remove'
import express from 'express'
import multer from 'multer'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////
  // start cleanup task to remove uploaded temp files
  //
  ///////////////////////////////////////////////////////////////////
  setInterval( ()=>{

    findRemoveSync('TMP', {
      age: { seconds: 3600 }
    }), 60 * 60 * 1000
  })

  //////////////////////////////////////////////////////////////////////////////
  // Initialization upload
  //
  ///////////////////////////////////////////////////////////////////////////////
  var storage = multer.diskStorage({

    destination: 'TMP/',
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, raw.toString('hex') + path.extname(file.originalname))
      })
    }
  })

  var upload = multer({ storage: storage })

  /////////////////////////////////////////////////////////////////////////////
  // GET /user
  // Get current user
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/user', async (req, res) => {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)
      
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

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)
      
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

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)

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

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)

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

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)

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

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getVersions(
        token.access_token, projectId, itemId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // POST /upload/{projectId}/{folderId}
  // Upload file
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/upload/:projectId/:folderId', upload.any(), async (req, res) => {

    try {

      var file = req.files[0]

      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req.sessionID)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.uploadFile(
        token.access_token,
        projectId,
        folderId,
        file)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })
  
  return router
}