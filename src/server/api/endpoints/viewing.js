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
import { serverConfig as config } from 'c0nfig'
import request from 'request'
import express from 'express'
import util from 'util'

module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////////////
  //
  ///////////////////////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', function (req, res) {

    var token = req.session.token || config.hardcodedToken

    console.log(token)

    var urn = req.params.urn

    var url = util.format(
      config.endPoints.thumbnail,
      urn)

    console.log(url)

    request.get({
        url: url,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        encoding: null
      },
      function (error, response, body) {

        if (error || response.statusCode != 200) {

          error = error || { error: response.statusMessage }

          error.statusCode = res.statusCode

          res.status(error.statusCode)
          res.send(error)
        }
        else {

          var thumbnail = arrayToBase64(body);

          res.send(thumbnail);
        }
      })
  })

  return router
}

///////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////
function arrayToBase64(arraybuffer) {

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = arraybuffer, i, len = bytes.length, base64 = "";

  for (i = 0; i < len; i+=3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64;
}

