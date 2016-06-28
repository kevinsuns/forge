
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
var FORGE_BASE_URL = 'https://developer.api.autodesk.com'
var FORGE_DERIVATIVE_VERSION = 'v2'
var FORGE_OAUTH_VERSION = 'v1'
var FORGE_OSS_VERSION = 'v1'
var FORGE_DM_VERSION = 'v1'

module.exports = {

    clientConfig: {

        forge: {
            token3LeggedUrl: '/api/forge/3legged',
            token2LeggedUrl: '/api/forge/2legged',
            viewerEnv: 'AutodeskProduction'
        },

        env: 'development',
        host: 'local.dev.com',
        port: 3000
    },

    serverConfig: {

        port: 3000,
        
        forge: {

            oauth: {

                clientId: process.env.FORGE_DEV_CLIENTID,
                clientSecret: process.env.FORGE_DEV_CLIENTSECRET,

                baseUri: FORGE_BASE_URL,
                authenticationUri: '/authentication/' + FORGE_OAUTH_VERSION + '/authorize',
                accessTokenUri:  '/authentication/' + FORGE_OAUTH_VERSION + '/gettoken',
                redirectUri: 'http://local.dev.com:3000/api/forge/oauth/callback',
                
                scope: [
                    'data:read',
                    'data:create',
                    'data:write',
                    'bucket:read',
                    'bucket:create'
                ].join(' ')
            },

            endPoints: {

                authenticate:     FORGE_BASE_URL + '/authentication/' + FORGE_OAUTH_VERSION + '/authenticate',

                getBucket:        FORGE_BASE_URL + '/oss/' + FORGE_OSS_VERSION + '/buckets/%s/details',
                createBucket:     FORGE_BASE_URL + '/oss/' + FORGE_OSS_VERSION + '/buckets',
                upload:           FORGE_BASE_URL + '/oss/' + FORGE_OSS_VERSION + '/buckets/%s/objects/%s',
                resumableUpload:  FORGE_BASE_URL + '/oss/' + FORGE_OSS_VERSION + '/buckets/%s/objects/%s/resumable',

                supported:        FORGE_BASE_URL + '/viewingservice/' + FORGE_OSS_VERSION + '/supported',
                register:         FORGE_BASE_URL + '/viewingservice/' + FORGE_OSS_VERSION + '/register',
                viewable:         FORGE_BASE_URL + '/viewingservice/' + FORGE_OSS_VERSION + '/%s',
                items:            FORGE_BASE_URL + '/viewingservice/' + FORGE_OSS_VERSION + '/items/%s',

                user:            FORGE_BASE_URL + '/userprofile/'    + FORGE_DM_VERSION + '/users/@me',

                hubs:            FORGE_BASE_URL + '/project/'        + FORGE_DM_VERSION + '/hubs',
                projects:        FORGE_BASE_URL + '/project/'        + FORGE_DM_VERSION + '/hubs/%s/projects',
                project:         FORGE_BASE_URL + '/project/'        + FORGE_DM_VERSION + '/hubs/%s/projects/%s',
                folderContent:   FORGE_BASE_URL + '/data/'           + FORGE_DM_VERSION + '/projects/%s/folders/%s/contents',
                itemVersions:    FORGE_BASE_URL + '/data/'           + FORGE_DM_VERSION + '/projects/%s/items/%s/versions',

                job:             FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/job',
                manifest:        FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/%s/manifest',
                download:        FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/%s/manifest/%s',
                metadata:        FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/%s/metadata',
                hierarchy:       FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/%s/metadata/%s',
                properties:      FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/%s/metadata/%s/properties',
                thumbnail:       FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/%s/thumbnail?width=%s&height=%s'
            }
        }
    }
}
