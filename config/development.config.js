
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
var FORGE_BASE_URL = 'https://developer.api.autodesk.com'
var FORGE_DERIVATIVE_VERSION = 'v2'
var FORGE_OAUTH_VERSION = 'v1'
var FORGE_OSS_VERSION = 'v2'
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

                refreshTokenUri: '/authentication/' + FORGE_OAUTH_VERSION + '/refreshtoken',
                authenticationUri: '/authentication/' + FORGE_OAUTH_VERSION + '/authorize',
                accessTokenUri:  '/authentication/' + FORGE_OAUTH_VERSION + '/gettoken',
                redirectUri: 'http://local.dev.com:3000/api/forge/oauth/callback',
                clientSecret: process.env.FORGE_DEV_CLIENTSECRET,
                clientId: process.env.FORGE_DEV_CLIENTID,
                baseUri: FORGE_BASE_URL,
                
                scope: [
                    'data:read',
                    'data:create',
                    'data:write',
                    'bucket:read',
                    'bucket:create'
                ]
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
                storage:         FORGE_BASE_URL + '/data/'           + FORGE_DM_VERSION + '/projects/%s/storage',
                folderContent:   FORGE_BASE_URL + '/data/'           + FORGE_DM_VERSION + '/projects/%s/folders/%s/contents',
                versions:        FORGE_BASE_URL + '/data/'           + FORGE_DM_VERSION + '/projects/%s/items/%s/versions',
                items:           FORGE_BASE_URL + '/data/'           + FORGE_DM_VERSION + '/projects/%s/items',

                job:             FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/job',
                formats:         FORGE_BASE_URL + '/modelderivative/' + FORGE_DERIVATIVE_VERSION + '/designdata/formats',
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
