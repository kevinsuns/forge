
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/data', async (req, res) =>{

    var ossSvc = ServiceManager.getService('OssSvc')

    res.json(ossSvc.getData())
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/buckets', async (req, res) => {

    try {

      var bucketCreationData = JSON.parse(req.body.payload)

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.getToken('2legged')

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.createBucket(
        token.access_token,
        bucketCreationData)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}