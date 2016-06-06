
/////////////////////////////////////////////////////////////////////
// STAGING configuration
//
/////////////////////////////////////////////////////////////////////
var BASE_URL = 'https://developer-stg.api.autodesk.com'
var DM_PROJECT_VERSION = 'v1'
var OAUTH_VERSION = 'v1'
var OSS_VERSION = 'v1'

module.exports = {

    clientConfig: {
        env: 'AutodeskStaging',
        host: 'localhost',
        port: 3000
    },

    serverConfig: {

        redirectUrl: 'https://autodesk-forge.herokuapp.com/api/auth/callback',
        authenticationUrl: '/authentication/' + OAUTH_VERSION + '/authorize',
        accessTokenUrl: '/authentication/' + OAUTH_VERSION + '/gettoken',
        baseUrl: BASE_URL,
        port: 3000,

        scope: [
            'data:read',
            'data:create',
            'data:write',
            'bucket:read',
            'bucket:create'
        ].join(' '),

        credentials: {
            ConsumerKey: process.env.LMV_STG_CONSUMERKEY,
            ConsumerSecret: process.env.LMV_STG_CONSUMERSECRET
        },

        endPoints: {

            authenticate:     BASE_URL + '/authentication/' + OAUTH_VERSION + '/authenticate',

            getBucket:        BASE_URL + '/oss/' + OSS_VERSION + '/buckets/%s/details',
            createBucket:     BASE_URL + '/oss/' + OSS_VERSION + '/buckets',
            upload:           BASE_URL + '/oss/' + OSS_VERSION + '/buckets/%s/objects/%s',
            resumableUpload:  BASE_URL + '/oss/' + OSS_VERSION + '/buckets/%s/objects/%s/resumable',

            supported:        BASE_URL + '/viewingservice/' + OSS_VERSION + '/supported',
            register:         BASE_URL + '/viewingservice/' + OSS_VERSION + '/register',
            thumbnail:        BASE_URL + '/viewingservice/' + OSS_VERSION + '/thumbnails/%s',
            viewable:         BASE_URL + '/viewingservice/' + OSS_VERSION + '/%s',
            items:            BASE_URL + '/viewingservice/' + OSS_VERSION + '/items/%s',

            hubs:            BASE_URL + '/project/'        + DM_VERSION + '/hubs',
            projects:        BASE_URL + '/project/'        + DM_VERSION + '/hubs/%s/projects',
            project:         BASE_URL + '/project/'        + DM_VERSION + '/hubs/%s/projects/%s',
            folderContent:   BASE_URL + '/data/'           + DM_VERSION + '/projects/%s/folders/%s/contents',
            itemVersions:    BASE_URL + '/data/'           + DM_VERSION + '/projects/%s/items/%s/versions',
            thumbnail:       BASE_URL + '/viewingservice/' + DM_VERSION + '/thumbnails/%s',
            user:            BASE_URL + '/userprofile/'    + DM_VERSION + '/users/@me',

            job:             BASE_URL + '/modelderivative/' + DERIVATIVE_VERSION + '/designdata/job',
            manifest:        BASE_URL + '/modelderivative/' + DERIVATIVE_VERSION + '/designdata/%s/manifest',
            download:        BASE_URL + '/modelderivative/' + DERIVATIVE_VERSION + '/designdata/%s/manifest/%s',
            metadata:        BASE_URL + '/modelderivative/' + DERIVATIVE_VERSION + '/designdata/%s/metadata',
            hierarchy:       BASE_URL + '/modelderivative/' + DERIVATIVE_VERSION + '/designdata/%s/metadata/%s'
        }
    }
}
