
var config = require('c0nfig').serverConfig
var OAuth2 = require('oauth').OAuth2
var express = require('express')

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

    res.end('<script>window.opener.location.reload(false);window.close();</script>');

    oauth2.getOAuthAccessToken(
      req.query.code, {
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectUrl
      },
      function (err, access_token, refresh_token, results) {

        try {

          if(results){

            req.session.token = access_token;
            req.session.cookie.maxAge = parseInt(results.expires_in) * 60; // same as access_token
          }
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