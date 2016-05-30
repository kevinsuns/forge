
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import { OAuth2 } from 'oauth'
import express from 'express'

module.exports = function() {

  var router = express.Router();

  var oauth2 = new OAuth2(
    config.credentials.ConsumerKey,
    config.credentials.ConsumerSecret,
    config.baseUrl,
    config.authenticationUrl,
    config.accessTokenUrl,
    null);

  /////////////////////////////////////////////////////////////////////////////
  // Register socketId from client
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/register', function (req, res) {

    req.session.socketId = req.body.socketId

    res.json('success');
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/login', function (req, res) {

    var authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.redirectUrl,
      scope: config.scope
    });

    res.json(authURL + '&response_type=code');
  });

  /////////////////////////////////////////////////////////////////////////////
  //
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

          req.session.token = access_token;

          if(results) {
            req.session.cookie.maxAge =
              parseInt(results.expires_in) * 60;
          }
          var socketSvc = ServiceManager.getService(
            'SocketSvc');

          if(req.session.socketId){

            socketSvc.broadcast(
              'callback', 'done',
              req.session.socketId)
          }
          
          res.end('<script>window.opener.location.reload(false);window.close();</script>');
        }
        catch(ex){

          res.status(500)
          res.end(ex)
        }
      }
    );
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/logout', function (req, res) {

    req.session.destroy();
    res.end('logged out');
  });

  return router;
}


function guid(format = 'xxxxxxxxxx') {

  var d = new Date().getTime();

  var guid = format.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

  return guid;
}