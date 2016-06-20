/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import Lmv from 'view-and-data'
import express from 'express'


module.exports = function() {

    var lmv = new Lmv(config)

    lmv.initialize()

    var router = express.Router()

    ///////////////////////////////////////////////////////////////////////////
    // 2-legged token
    //
    ///////////////////////////////////////////////////////////////////////////
    router.get('/2legged', async (req, res) => {

      try {

        var response = await lmv.getToken()

        return json(response)
      }
      catch (error) {

        res.status(error.statusCode || 404);
        res.json(error);
      }
    })

    ///////////////////////////////////////////////////////////////////////////
    // 3-legged token
    //
    ///////////////////////////////////////////////////////////////////////////
    router.get('/3legged', async (req, res) => {

      try {

        var authSvc = ServiceManager.getService(
          'AuthSvc');

        var token = await authSvc.getToken(req)

        res.json(token)
      }
      catch (error) {

        res.status(error.statusCode || 404);
        res.json(error);
      }
    })

    return router;
}

