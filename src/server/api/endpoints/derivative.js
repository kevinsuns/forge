
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/job', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var payload = JSON.parse(req.body.payload)

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc')

      var output = null

      switch(payload.outputType) {

        case 'obj':
          output = derivativeSvc.jobBuilder.obj({
            guid: payload.guid,
            objectIds: payload.objectIds
          })
          break

        case 'svf':
        default:
          output = derivativeSvc.jobBuilder.svf()
          break
      }

      var response = await derivativeSvc.postJob(
        token, payload.urn, output)

      res.json(response)
    }
    catch (ex) {

      res.status(500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/metadata/:urn', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.params.urn

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.getMetadata(
        token, urn)

      res.json(response)
    }
    catch (ex) {

      res.status(500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hierarchy/:urn/:guid', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.params.urn

      var guid = req.params.guid

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.getHierarchy(
        token, urn, guid)

      res.json(response)
    }
    catch (ex) {

      res.status(500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/manifest/:urn', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.params.urn

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.getManifest(
        token, urn)

      res.json(response)
    }
    catch (ex) {

      res.status(500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/manifest/:urn', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.params.urn

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.deleteManifest(
        token, urn)

      res.json(response)
    }
    catch (ex) {

      res.status(500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/download', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.query.urn

      var filename = req.query.filename

      var derivativeURN = req.query.derivativeURN

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.download(
        token, urn, derivativeURN)

      res.set('Content-Type', 'application/obj');

      res.set('Content-Disposition',
        `attachment; filename="${filename}"`);

      res.end(response);
    }
    catch (ex) {

      res.status(500)
      res.json(ex)
    }
  })

  return router;
}