#!/bin/sh

heroku config:set NODE_ENV=production
heroku config:set LMV_STG_CONSUMERKEY=$LMV_STG_CONSUMERKEY
heroku config:set LMV_STG_CONSUMERSECRET=$LMV_STG_CONSUMERSECRET
