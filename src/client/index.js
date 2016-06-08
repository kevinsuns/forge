//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
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
//////////////////////////////////////////////////////////////////////////
import 'babel-polyfill'
import 'Viewing.Extension.ModelTransformer/Viewing.Extension.ModelTransformer'
import 'Viewing.Extension.Derivative/Viewing.Extension.Derivative'
import 'Viewing.Extension.A360View/Viewing.Extension.A360View'
import {clientConfig as config} from 'c0nfig'
import ioClient from 'socket.io-client'
import 'bootstrap-webpack'
import './styles/app.css'

class App {

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  getToken (url) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);

    var response = JSON.parse(xhr.responseText);

    return response.access_token;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  replaceAll (str, search, replacement) {
    return str.replace(new RegExp(search, 'g'), replacement);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  register (socketId) {

    $.ajax({
      url: '/api/auth/register',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ socketId: socketId }),
      success: (url) => {

      },
      error: (err) => {

        console.log(err)
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  login() {

    //this.initializeViewer(); return

    $.ajax({
      url: '/api/auth/login',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: null,
      success: (url) => {

        // iframes are not allowed
        this.popup = this.PopupCenter(url, "Autodesk Login", 800, 400);

        if(this.popup){

          this.popup.focus()
        }
      },
      error: (err) => {

        console.log(err)
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  logout() {

    $.ajax({
      url: '/api/auth/logout',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: null,
      success: (res) => {

        $('#loginText').text('Sign In')
        $('#loginItem').removeClass('active')

        console.log(res)
      },
      error: (err) => {

        console.log(err)
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  // http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
  //
  //////////////////////////////////////////////////////////////////////////
  PopupCenter(url, title, w, h) {

    // Fixes dual-screen position
    var dualScreenLeft = (window.screenLeft !== undefined ?
      window.screenLeft : screen.left)

    var dualScreenTop = (window.screenTop !== undefined ?
      window.screenTop : screen.top)

    var element = document.documentElement;

    var width = window.innerWidth ? window.innerWidth :
      (element.clientWidth ? element.clientWidth : screen.width)

    var height = window.innerHeight ? window.innerHeight :
      (element.clientHeight ? element.clientHeight : screen.height)

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;

    return window.open(url, title,
      'scrollbars=no,' +
      'toolbar=no,' +
      'location=no,' +
      'titlebar=no,' +
      'directories=no,' +
      'status=no,' +
      'menubar=no,' +
      'width=' + w + ',' +
      'height=' + h + ',' +
      'top=' + top + ',' +
      'left=' + left);
  }

  //////////////////////////////////////////////////////////////////////////
  // on html document loaded
  //
  //////////////////////////////////////////////////////////////////////////
  initialize () {

    this.loggedIn = false

    $('#loginBtn').click((e) => {

      this.loggedIn ? this.logout() : this.login()
    })

    this.socket = ioClient.connect(
      `${config.host}:${config.port}`, {
        reconnect: true
      });

    this.socket.on('connect', ()=> {

      console.log('client socket connected');
    });

    this.socket.on('connection.data', (data)=> {

      this.register(data.socketId)
    });

    this.socket.on('callback', (msg)=> {

      if(this.popup) {

        this.loggedIn = true
        this.popup.close()
        this.popup = null
      }

      $.get('/api/dm/user', (user) => {

        var username = user.firstName + ' ' + user.lastName

        $('#loginText').text(username)
        $('#loginItem').addClass('active')
      })

      this.initializeViewer()
    })
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  initializeViewer () {

    var options = {

      env: config.env,

      refreshToken: () => {
        return this.getToken('/api/token/3legged')
      },

      getAccessToken: () => {
        return this.getToken('/api/token/3legged')
      }
    }

    Autodesk.Viewing.Initializer(options, () => {

      var viewerContainer = document.getElementById('viewer')

      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        viewerContainer)

      this.viewer.initialize()

      $('#loader').remove()
      $('.spinner').remove()

      var viewerToolbar = this.viewer.getToolbar(true);

      this.ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
        'forge');

      viewerToolbar.addControl(this.ctrlGroup);

      // A360 View Extension

      this.viewer.loadExtension(
        'Viewing.Extension.A360View', {
          parentControl: this.ctrlGroup,
          showPanel: true
        })

      this.a360View =
        this.viewer.loadedExtensions[ 'Viewing.Extension.A360View' ]

      this.a360View.on('item.dblClick', (item)=> {

        this.importModelFromItem(item)
      })

      // Derivative Extension

      this.viewer.loadExtension(
        'Viewing.Extension.Derivative')

      this.derivative = this.viewer.loadedExtensions[
        'Viewing.Extension.Derivative' ]
    })
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  importModelFromItem (item) {

    return new Promise(async(resolve, reject) => {

      console.log('Selected Item:')
      console.log(item)

      if (!item.versions || !item.versions.length) {

        this.a360View.panel.showError(
          'No version available (Please wait) ...')

        console.log('No item version available...')
        return
      }

      this.a360View.panel.startLoad(
        'Loading ' + item.name + ' ...')

      //pick the last version by default
      var version = item.versions[ item.versions.length - 1 ]

      var storageUrn = window.btoa(
        version.relationships.storage.data.id)

      // !IMPORTANT: remove padding '='
      storageUrn = this.replaceAll(storageUrn, '=', '')

      var urn = version.relationships.derivatives.data.id

      console.log('A360 URN: ' + urn)
      console.log('Storage URN: ' + storageUrn)
      //console.log('Token: ' + this.getToken('/api/token/3legged'))

      var job = await this.derivative.postJob(version)

      Autodesk.Viewing.Document.load(
        'urn:' + storageUrn, async(LMVDocument) => {

        var rootItem = LMVDocument.getRootItem();

        var geometryItems3d = Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { 'type': 'geometry', 'role': '3d' }, true);

        var geometryItems2d = Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { 'type': 'geometry', 'role': '2d' }, true);

        // Pick the first 3D item
        if (geometryItems3d.length || geometryItems2d.length) {

          if (!this.viewer) {

            var viewerContainer = document.getElementById('viewer')

            this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
              viewerContainer)

            this.viewer.initialize()
          }

          var viewable = geometryItems3d.length ?
            geometryItems3d[ 0 ] :
            geometryItems2d[ 0 ]

          var path = LMVDocument.getViewablePath(
            viewable)

          let model = await this.loadModel(path, {
            acmSessionId: LMVDocument.acmSessionId
          })

          var metadata = await this.derivative.getMetadata(
            storageUrn)

          // assume first metadata, since we loaded first viewable
          if(metadata.metadata && metadata.metadata.length) {

            var guid = metadata.metadata[0].guid

            console.log('Design GUID: ' + guid)

            model.guid = guid
          }
          
          this.a360View.panel.stopLoad()

          // store for easy use by extensions

          model.name = item.name
          model.storageUrn = storageUrn

          if (!this.viewer.loadedExtensions[ 'Viewing.Extension.Derivative' ]) {


          }

          if (!this.viewer.loadedExtensions[ 'Viewing.Extension.ModelTransformer' ]) {

            this.viewer.loadExtension(
              'Viewing.Extension.ModelTransformer', {
                parentControl: this.ctrlGroup
              })

            this.modelTransformer =
              this.viewer.loadedExtensions[
                'Viewing.Extension.ModelTransformer' ]

            this.modelTransformer.on('model.delete', (deletedModel) => {

              this.derivative.deleteManifest(
                deletedModel.storageUrn)
            })
          }

          this.modelTransformer.addModel(model)

          // fits model to view - need to wait for instance tree
          // but no event gets fired

          let fitToView = ()=> {

            var instanceTree = model.getData().instanceTree;

            if (instanceTree) {

              this.fitModelToView(model)
            }
            else {

              setTimeout(()=> {
                fitToView()
              }, 500)
            }
          }

          fitToView()

          return resolve(model)
        }
      }, (errCode) => {

        var errMsg = this.logError(errCode)

        this.a360View.panel.showError(errMsg)

        return reject({
          error: errCode,
          description:  errMsg
        })
      }
      /*,{

       'oauth2AccessToken': this.getToken('/api/token/3legged'),
       'x-ads-acm-namespace': 'WIPDMSTG',
       'x-ads-acm-check-groups': 'true'
       }*/
      )
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // Log viewer errors with more explicit message
  //
  //////////////////////////////////////////////////////////////////////////
  loadModel(path, opts) {

    return new Promise(async(resolve, reject)=> {

      let _onGeometryLoaded = (event)=> {

        this.viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded);

        return resolve(event.model);
      }

      this.viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        _onGeometryLoaded);

      var _onSuccess = () => {}

      var _onError = (errorCode, errorMessage,
                      statusCode, statusText) => {

        this.viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded);

        return reject({
          errorCode: errorCode,
          errorMessage: errorMessage,
          statusCode: statusCode,
          statusText: statusText
        });
      }

      this.viewer.loadModel(
        path, opts, _onSuccess, _onError)
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  fitModelToView (model) {

    var instanceTree = model.getData().instanceTree;

    var rootId = instanceTree.getRootId();

    this.viewer.fitToView([rootId]);
  }

  //////////////////////////////////////////////////////////////////////////
  // Log viewer errors with more explicit message
  //
  //////////////////////////////////////////////////////////////////////////
  logError (err) {

    switch (err) {

      case 1: //Autodesk.Viewing.ErrorCode.UNKNOWN_FAILURE
        return 'An unknown failure has occurred.'

      case 2: //Autodesk.Viewing.ErrorCode.BAD_DATA
        return 'Bad data (corrupted or malformed) was encountered.'

      case 3: //Autodesk.Viewing.ErrorCode.NETWORK_FAILURE
        return 'A network failure was encountered.'

      case 4: //Autodesk.Viewing.ErrorCode.NETWORK_ACCESS_DENIED
        return 'Access was denied to a network resource (HTTP 403).'

      case 5: //Autodesk.Viewing.ErrorCode.NETWORK_FILE_NOT_FOUND
        return 'A network resource could not be found (HTTP 404).'

      case 6: //Autodesk.Viewing.ErrorCode.NETWORK_SERVER_ERROR
        return 'A server error was returned when accessing ' +
          'a network resource (HTTP 5xx).'

      case 7: //Autodesk.Viewing.ErrorCode.NETWORK_UNHANDLED_RESPONSE_CODE
        return 'An unhandled response code was returned ' +
          'when accessing a network resource (HTTP everything else).'

      case 8: //Autodesk.Viewing.ErrorCode.BROWSER_WEBGL_NOT_SUPPORTED
        return 'Browser error: WebGL is not ' +
          'supported by the current browser.'

      case 9: //Autodesk.Viewing.ErrorCode.BAD_DATA_NO_VIEWABLE_CONTENT
        return 'There is nothing viewable in the fetched document.'

      case 10: //Autodesk.Viewing.ErrorCode.BROWSER_WEBGL_DISABLED
        return 'Browser error: WebGL is supported, but not enabled.'

      case 11: //Autodesk.Viewing.ErrorCode.RTC_ERROR
        return 'Collaboration server error'
    }
  }
}

//////////////////////////////////////////////////////////////////////////
// Bootstrapping
//
//////////////////////////////////////////////////////////////////////////
$(document).ready(() => {

  var app = new App()

  app.initialize()
})
