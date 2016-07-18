///////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
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
///////////////////////////////////////////////////////////////////////
import BaseSvc from './BaseSvc'
import request from 'request'

export default class ForgeSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (opts) {

    super(opts)

    this.tokenStore = {}
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'ForgeSvc'
  }

  /////////////////////////////////////////////////////////////////
  // store master token, also need to set refresh_token
  // for client token, so we can refresh later
  //
  /////////////////////////////////////////////////////////////////
  setToken (sessionId, token) {

    if(!this.tokenStore[sessionId]) {

      this.tokenStore[sessionId] = {
        masterToken: {},
        clientToken: {}
      }
    }

    var entry = this.tokenStore[sessionId]

    entry.clientToken.refresh_token =
      token.refresh_token

    entry.masterToken = token
  }

  /////////////////////////////////////////////////////////////////
  // return master token (full privileges)
  //
  /////////////////////////////////////////////////////////////////
  getToken (sessionId) {

    return this.tokenStore[sessionId].masterToken
  }

  /////////////////////////////////////////////////////////////////
  // Store client token, also need to set refresh_token
  // for client token, so we can refresh later
  //
  /////////////////////////////////////////////////////////////////
  setClientToken (sessionId, token) {

    var entry = this.tokenStore[sessionId]

    entry.masterToken.refresh_token = token.refresh_token

    entry.clientToken = token
  }

  /////////////////////////////////////////////////////////////////
  // Returns client token
  //
  /////////////////////////////////////////////////////////////////
  getClientToken (sessionId) {

    return this.tokenStore[sessionId].clientToken
  }

  /////////////////////////////////////////////////////////////////
  // Request new 2-legged with specified scope
  //
  /////////////////////////////////////////////////////////////////
  requestToken (scope) {

    return new Promise((resolve, reject) => {

      var url = this._config.oauth.baseUri +
        this._config.oauth.authenticationUri

      request({
        url: url,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true,
        form: {
          client_secret: this._config.oauth.clientSecret,
          client_id: this._config.oauth.clientId,
          grant_type: 'client_credentials',
          scope: scope
        }

      }, (err, response, body) => {

        try {

          if (err) {

            console.log('error: ' + url)
            console.log(err)

            return reject(err)
          }

          if (body && body.errors) {

            console.log('body error: ' + url)
            console.log(body.errors)

            return reject(body.errors)
          }

          if([200, 201, 202].indexOf(
              response.statusCode) < 0){

            return reject(response)
          }

          return resolve(body.data || body)
        }
        catch(ex){

          return reject(response)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // Refresh 3-legged token with specified scope
  //
  /////////////////////////////////////////////////////////////////
  refreshToken (token, scope) {

    return new Promise((resolve, reject) => {

      var url = this._config.oauth.baseUri +
        this._config.oauth.refreshTokenUri

      request({
        url: url,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true,
        form: {
          client_secret: this._config.oauth.clientSecret,
          client_id: this._config.oauth.clientId,
          refresh_token: token.refresh_token,
          grant_type: 'refresh_token',
          scope: scope
        }

      }, (err, response, body) => {

        try {

          if (err) {

            console.log('error: ' + url)
            console.log(err)

            return reject(err)
          }

          if (body && body.errors) {

            console.log('body error: ' + url)
            console.log(body.errors)

            return reject(body.errors)
          }

          if([200, 201, 202].indexOf(
              response.statusCode) < 0){

            return reject(response)
          }

          return resolve(body.data || body)
        }
        catch(ex){

          return reject(response)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // Delete token entry
  //
  /////////////////////////////////////////////////////////////////
  deleteToken (sessionId) {

    if (this.tokenStore[sessionId]) {

      delete this.tokenStore[sessionId]
    }
  }
}
