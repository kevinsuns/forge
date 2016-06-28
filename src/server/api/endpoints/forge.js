
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import { OAuth2 } from 'oauth'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  var oauth2 = new OAuth2(
    config.forge.oauth.clientId,
    config.forge.oauth.clientSecret,
    config.forge.oauth.baseUri,
    config.forge.oauth.authenticationUri,
    config.forge.oauth.accessTokenUri,
    null)

  /////////////////////////////////////////////////////////////////////////////
  // login endpoint
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/login', function (req, res) {

    var authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.forge.oauth.redirectUri,
      scope: config.forge.oauth.scope
    })

    res.json(authURL + '&response_type=code')
  })

  /////////////////////////////////////////////////////////////////////////////
  // Reply looks as follow:
  //
  //  access_token: "fk7dd21P4FAhJWl6MptumGkXIuei",
  //  refresh_token: "TSJpg3xSXxUEAtevo3lIPEmjQUxXbcqNT9AZHRKYM3",
  //  results: {
  //    token_type: "Bearer",
  //    expires_in: 86399,
  //    access_token: "fk7dd21P4FAhJWl6MptumGkXIuei"
  //  }
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/oauth/callback', function (req, res) {

    if(!req.query || !req.query.code) {

      res.json('invalid request')
      return
    }

    oauth2.getOAuthAccessToken(
      req.query.code, {
        'grant_type': 'authorization_code',
        'redirect_uri': config.forge.oauth.redirectUri
      },
      function (err, access_token, refresh_token, results) {

        try {

          var forgeSvc = ServiceManager.getService(
            'ForgeSvc')

          forgeSvc.setToken(req.session, {
            expires_in: results.expires_in,
            refresh_token: refresh_token,
            access_token: access_token
          })

          var socketSvc = ServiceManager.getService(
            'SocketSvc')

          if(req.session.socketId) {

            socketSvc.broadcast(
              'callback', 'done',
              req.session.socketId)
          }

          res.end('done')
        }
        catch(ex){

          res.status(500)
          res.end(ex)
        }
      }
    )
  })

  /////////////////////////////////////////////////////////////////////////////
  // logout route
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/logout', function (req, res) {

    req.session.forge = null

    res.json('logged out')
  })

  /////////////////////////////////////////////////////////////////////////////
  // refresh token
  //
  /////////////////////////////////////////////////////////////////////////////
  function refreshToken() {

    oauth2.getOAuthAccessToken(
      req.session.refreshToken, {
        'grant_type': 'refresh_token'
      },
      function (err, access_token, refresh_token, results) {

        req.session.token = access_token
      });
  }

  ///////////////////////////////////////////////////////////////////////////
  // 3-legged token
  //
  ///////////////////////////////////////////////////////////////////////////
  router.get('/3legged', async (req, res) => {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.getToken(req)

      res.json(token)
    }
    catch (error) {

      res.status(error.statusCode || 404);
      res.json(error);
    }
  })

  return router
}
