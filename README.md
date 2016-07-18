
# Forge APIs Sample

## Description
Forge APIs Sample

## Configuration

This sample is relying on environment variables to avoid hard-coding your credentials in plain text. It is using two configuration files (config/development.config.js and config/production.config.js) that you need to edit based on your settings.
The recommended way is to create the following environment variables (respectively for DEV and PROD):
         FORGE_DEV_CLIENTID
         FORGE_DEV_CLIENTSECRET

         FORGE_CLIENTID
         FORGE_CLIENTSECRET


## Deployment

Assuming you have node.js and webpack installed on the machine (otherwise install them from the web)

    npm install (the post-install step will build the sample for production, you may want to run "npm run build-dev" if you plan to test locally)
    node bin/run.js
    http://localhost:3000 (assuming you didn't modify the default port in config, otherwise adapt to your settings)

## License

[MIT License](http://opensource.org/licenses/MIT).

## Written by 

Written by [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html)
Autodesk Developer Network.

