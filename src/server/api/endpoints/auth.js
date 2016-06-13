
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import { OAuth2 } from 'oauth'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  var oauth2 = new OAuth2(
    config.credentials.ConsumerKey,
    config.credentials.ConsumerSecret,
    config.baseUrl,
    config.authenticationUrl,
    config.accessTokenUrl,
    null)

  /////////////////////////////////////////////////////////////////////////////
  // Register socketId from client
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/register', function (req, res) {

    req.session.socketId = req.body.socketId

    res.json('success')
  })

  /////////////////////////////////////////////////////////////////////////////
  // login endpoint
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/login', function (req, res) {

    var authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.redirectUrl,
      scope: config.scope
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
  router.get('/callback', function (req, res) {

    oauth2.getOAuthAccessToken(
      req.query.code, {
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectUrl
      },
      function (err, access_token, refresh_token, results) {

        try {

          req.session.token = access_token
          req.session.cookie.expires = false

          var socketSvc = ServiceManager.getService(
            'SocketSvc')

          if(req.session.socketId){

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

    req.session.destroy()
    res.json('logged out')
  })

  return router
}
