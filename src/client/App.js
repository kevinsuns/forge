//////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////
import 'babel-polyfill'
import Background from 'AnimatedBackground/AnimatedBackground'
import {clientConfig as config} from 'c0nfig'
import ioClient from 'socket.io-client'
import ViewerManager from 'Viewer/ViewerManager'
import 'bootstrap-webpack'
import './styles/app.css'

export default class App {

  //////////////////////////////////////////////////////////////////////////
  // register app with socket service
  //
  //////////////////////////////////////////////////////////////////////////
  register () {

    return new Promise((resolve, reject) => {

      $.ajax({
        url: '/api/app/register',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          socketId: this.socket.id
        }),
        success: (response) => {

          return resolve(response)
        },
        error: (err) => {

          console.log(err)
          return reject(err)
        }
      })
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // perform login
  //
  //////////////////////////////////////////////////////////////////////////
  async login() {

    await this.register()

    $.ajax({
      url: '/api/forge/login',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: null,
      success: (url) => {

        // iframes are not allowed

        this.popup = this.PopupCenter(
          url, "Autodesk Login", 800, 400)

        if(this.popup){

          this.popup.focus()
        }
      },
      error: (err) => {

        console.log(err)
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // perform logout
  //
  //////////////////////////////////////////////////////////////////////////
  logout() {

    this.viewerManager.destroy()

    this.background.start()

    $('#loginText').text('Sign In')
    $('#loginItem').removeClass('active')

    $.ajax({
      url: '/api/forge/logout',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: null,
      success: (res) => {

        this.loggedIn = false
      },
      error: (err) => {

        console.log(err)
      }
    })
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

    var element = document.documentElement

    var width = window.innerWidth ? window.innerWidth :
      (element.clientWidth ? element.clientWidth : screen.width)

    var height = window.innerHeight ? window.innerHeight :
      (element.clientHeight ? element.clientHeight : screen.height)

    var left = ((width / 2) - (w / 2)) + dualScreenLeft
    var top = ((height / 2) - (h / 2)) + dualScreenTop

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
      'left=' + left)
  }

  //////////////////////////////////////////////////////////////////////////
  // Initialize client App
  //
  //////////////////////////////////////////////////////////////////////////
  initialize () {

    this.background = new Background(
      document.getElementById('viewer'),
      document.getElementById('background'))

    this.background.start()

    this.loggedIn = false

    $('#loginBtn').click((e) => {

      this.loggedIn ? this.logout() : this.login()
    })

    this.socket = ioClient.connect(
      `${config.host}:${config.port}`, {
        reconnect: true
      })

    this.socket.on('connect', ()=> {

      console.log('client socket connected')
    })

    this.socket.on('connection.data', (data)=> {

      this.socket.id = data.socketId
    })

    this.socket.on('callback', (msg)=> {

      if(this.popup) {

        this.loggedIn = true
        this.popup.close()
        this.popup = null
      }

      $.get('/api/user', (user) => {

        var username = user.firstName + ' ' + user.lastName

        $('#loginText').text(username)
        $('#loginItem').addClass('active')
      })

      var viewerContainer =
        document.getElementById('viewer')

      this.viewerManager = new ViewerManager(
        viewerContainer, config.forge)

      this.background.stop()

      this.viewerManager.initialize().then((viewer) => {

        this.background.hide()
      })
    })
  }
}
