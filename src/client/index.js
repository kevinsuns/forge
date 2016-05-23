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
var config = require('c0nfig').clientConfig

class App {

  getToken () {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/api/token/2legged', false);
    xhr.send(null);

    var response = JSON.parse(xhr.responseText);

    return response.access_token;
  }

  authenticate() {

    $.ajax({
      url: '/api/auth',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      success: (url) => {
        // iframes are not allowed
        this.PopupCenter(url, "Autodesk Login", 800, 400);
      },
      error: () => {

      }
    });
  }

  // http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
  PopupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
      newWindow.focus();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // on html document loaded
  //
  //////////////////////////////////////////////////////////////////////////
  initialize () {

    var urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWRuLWdhbGxlcnktdHJ4LXN0Zy81NDgyLWI1MDctOTUyOS05MzdlLWUyZjMuZHdm';

    var options = {
      env: config.env,
      getAccessToken: this.getToken,
      refreshToken: this.getToken,
      urn: Autodesk.Viewing.Private.getParameterByName('urn') || urn
    };

    $('#authBtn').click(() => {

      this.authenticate();
    })

    Autodesk.Viewing.Initializer(options, () => {

      this.initializeViewer('viewer', 'urn:' + options.urn);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  // Initialize viewer and load model
  //
  //////////////////////////////////////////////////////////////////////////
  initializeViewer (containerId, urn) {

    Autodesk.Viewing.Document.load(urn, (model) => {

      var rootItem = model.getRootItem();

      // Grab all 3D items
      var geometryItems3d = Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem,
        { 'type': 'geometry', 'role': '3d' },
        true);

      // Grab all 2D items
      var geometryItems2d = Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem,
        { 'type': 'geometry', 'role': '2d' },
        true);

      var domContainer = document.getElementById(containerId);

      //UI-less Version: viewer without any Autodesk buttons and commands
      //viewer = new Autodesk.Viewing.Viewer3D(domContainer);

      //GUI Version: viewer with controls
      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer);

      this.viewer.initialize();

      this.viewer.setLightPreset(8);

      var options = {
        globalOffset: {
          x: 0, y: 0, z: 0
        }
      }

      // Pick the first 3D item ortherwise first 2D item
      var viewablePath = (geometryItems3d.length ?
        geometryItems3d[ 0 ] :
        geometryItems2d[ 0 ]);

      this.viewer.loadModel(
        model.getViewablePath(viewablePath),
        options);

    }, (err) => {

      this.logError(err);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  // Log viewer errors with more explicit message
  //
  //////////////////////////////////////////////////////////////////////////
  logError (err) {

    switch (err) {

      case 1: //Autodesk.Viewing.ErrorCode.UNKNOWN_FAILURE
        console.log('An unknown failure has occurred.');
        break;

      case 2: //Autodesk.Viewing.ErrorCode.BAD_DATA
        console.log('Bad data (corrupted or malformed) was encountered.');
        break;

      case 3: //Autodesk.Viewing.ErrorCode.NETWORK_FAILURE
        console.log('A network failure was encountered.');
        break;

      case 4: //Autodesk.Viewing.ErrorCode.NETWORK_ACCESS_DENIED
        console.log('Access was denied to a network resource (HTTP 403).');
        break;

      case 5: //Autodesk.Viewing.ErrorCode.NETWORK_FILE_NOT_FOUND
        console.log('A network resource could not be found (HTTP 404).');
        break;

      case 6: //Autodesk.Viewing.ErrorCode.NETWORK_SERVER_ERROR
        console.log('A server error was returned when accessing a network resource (HTTP 5xx).');
        break;

      case 7: //Autodesk.Viewing.ErrorCode.NETWORK_UNHANDLED_RESPONSE_CODE
        console.log('An unhandled response code was returned when accessing a network resource (HTTP everything else).');
        break;

      case 8: //Autodesk.Viewing.ErrorCode.BROWSER_WEBGL_NOT_SUPPORTED
        console.log('Browser error: WebGL is not supported by the current browser.');
        break;

      case 9: //Autodesk.Viewing.ErrorCode.BAD_DATA_NO_VIEWABLE_CONTENT
        console.log('There is nothing viewable in the fetched document.');
        break;

      case 10: //Autodesk.Viewing.ErrorCode.BROWSER_WEBGL_DISABLED
        console.log('Browser error: WebGL is supported, but not enabled.');
        break;

      case 11: //Autodesk.Viewing.ErrorCode.RTC_ERROR
        console.log('Collaboration server error');
        break;
    }
  }
}

(function bootstrapApp(){

  var app = new App()

  app.initialize()

})()
