
var OAUTH_VERSION = 'v1';
var DM_PROJECT_VERSION = 'v1';

module.exports = {

    clientConfig: {
        host: 'localhost',
        port: 3000
    },

    serverConfig: {
        port: 3000,
        baseUrl: 'https://developer-stg.api.autodesk.com',
        redirectUrl: 'https://forge.herokuapp.com/api/auth/callback',
        authenticationUrl: '/authentication/' + OAUTH_VERSION + '/authorize',
        accessTokenUrl: '/authentication/' + OAUTH_VERSION + '/gettoken',
        scope: [
            'data:create',
            'data:read',
            'data:write',
            'bucket:read',
            'bucket:create'
        ],
        credentials: {
            ConsumerKey: process.env.LMV_CONSUMERKEY,
            ConsumerSecret: process.env.LMV_CONSUMERSECRET
        }
    }
}
