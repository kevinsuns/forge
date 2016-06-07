/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////
import {serverConfig as config} from 'c0nfig'

//Server stuff
import cookieParser from 'cookie-parser'
import Session from 'express-session'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import express from 'express'

//Webpack hot reloading stuff
import webpackConfig from '../../webpack/webpack.config.development';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';

//Endpoints
import DerivativeAPI from './api/endpoints/derivative'
import ViewingAPI from './api/endpoints/viewing'
import TokenAPI from './api/endpoints/token'
import AuthAPI from './api/endpoints/auth'
import DMAPI from './api/endpoints/dm'

//Services
import DerivativeSvc from './api/services/DerivativeSvc';
import SocketSvc from './api/services/SocketSvc';
import DMSvc from './api/services/DMSvc';

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
function setWebpackHotReloading(app) {

    var compiler = webpack(webpackConfig);

    app.use(webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
    }));

    app.use(webpackHotMiddleware(compiler));
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
var app = express()

if(process.env.WEBPACK == 'hot')
    setWebpackHotReloading(app);

app.use('/', express.static(__dirname + '/../../dist/'))
app.use(favicon(__dirname + '/../../dist/img/forge.png'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

var store = new Session.MemoryStore;

var session = Session({
    secret: 'peperonipizza',
    saveUninitialized: true,
    resave: true,
    store: store
})

app.use(session)

/////////////////////////////////////////////////////////////////////
// Routes
//
/////////////////////////////////////////////////////////////////////
app.use('/api/derivative', DerivativeAPI())
app.use('/api/viewing', ViewingAPI())
app.use('/api/token', TokenAPI())
app.use('/api/auth', AuthAPI())
app.use('/api/dm', DMAPI())

/////////////////////////////////////////////////////////////////////
// server
//
/////////////////////////////////////////////////////////////////////
app.set('port', process.env.PORT || 3000)

var server = app.listen(app.get('port'), function() {

    var socketSvc = new SocketSvc({
        config: {
            server,
            session
        }
    });

    var dmSvc = new DMSvc({
        config: config
    })

    var derivativeSvc = new DerivativeSvc({
        config: config
    })

    console.log('Server listening on: ')
    console.log(server.address())
})
