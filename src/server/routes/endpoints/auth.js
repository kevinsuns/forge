
var config = require('c0nfig').serverConfig;
var OAuth2 = require('oauth').OAuth2;
var express = require('express');

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
  /////////////////////////////////////////////////////////////////////////////
  router.post('/', function (req, res) {

    var authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.redirectUrl,
      scope: config.scope
    });

    res.send(authURL + '&response_type=code');
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/callback', function (req, res) {

    oauth2.getOAuthAccessToken(
      req.query.code, {
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectUrl
      },
      function (e, access_token, refresh_token, results) {

        console.log(results);

        req.session.token = access_token;
        req.session.cookie.maxAge = parseInt(results.expires_in) * 60; // same as access_token

        res.end('<script>window.opener.location.reload(false);window.close();</script>');
      }
    );
  });

  return router;
}