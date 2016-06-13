
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // POST /job
  // Post a derivative job - generic
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
          output = derivativeSvc.jobOutputBuilder.obj({
            guid: payload.guid,
            objectIds: payload.objectIds
          })
          break

        case 'svf':
          output = derivativeSvc.jobOutputBuilder.svf()
          break

        default:
          output = derivativeSvc.jobOutputBuilder.defaultOutput({
            outputType: payload.outputType
          })
          break
      }


      var input = {
        urn: payload.urn
      }

      if(payload.fileExtType === 'versions:autodesk.a360:CompositeDesign') {
          input.rootFilename = payload.rootFilename
          input.compressedUrn = true
      }

      var response = await derivativeSvc.postJob(
        token, input, output)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /metadata/{urn}
  // Get design metadata
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

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /hierarchy/{urn}/{guid}
  // Get hierarchy for design
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

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /manifest/{urn}
  // Get design manifest
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

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /manifest/{urn}
  // Delete design manifest
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

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /download
  // Get download uri for derivative resource
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/download', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.query.urn

      var filename = req.query.filename

      var derivativeUrn = req.query.derivativeUrn

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.download(
        token, urn, derivativeUrn)

      res.set('Content-Type', 'application/obj');

      res.set('Content-Disposition',
        `attachment; filename="${filename}"`);

      res.end(response);
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /thumbnail/{urn}
  // Get design thumbnail
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', async (req, res) => {

    try {

      var token = req.session.token || config.hardcodedToken

      var urn = req.params.urn

      var options = {
        width: req.query.width || 100,
        height: req.query.height || 100
      }

      var derivativeSvc = ServiceManager.getService(
        'DerivativeSvc');

      var response = await derivativeSvc.getThumbnail(
        token, urn, options)

      res.end(response);
    }
    catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router;
}