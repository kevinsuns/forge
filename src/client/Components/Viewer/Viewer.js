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
//////////////////////////////////////////////////////////////////////////
import 'Viewing.Extension.ModelTransformer/Viewing.Extension.ModelTransformer'
import 'Viewing.Extension.SceneManager/Viewing.Extension.SceneManager'
import 'Viewing.Extension.Derivative/Viewing.Extension.Derivative'
import 'Viewing.Extension.A360View/Viewing.Extension.A360View'
import ViewerToolkit from 'ViewerToolkit'

export default class Viewer {

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  constructor (container, config) {

    var options = {

      env: config.env,

      refreshToken: () => {
        return this.getToken(config.token3LeggedUrl)
      },

      getAccessToken: () => {
        return this.getToken(config.token3LeggedUrl)
      }
    }

    Autodesk.Viewing.Initializer(options, () => {

      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        container)

      this.viewer.initialize()

      this.initializeUI()

      this.loadExtensions()
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // Initialize viewer UI
  //
  //////////////////////////////////////////////////////////////////////////
  initializeUI () {

    // removes all the loaders when no model

    $('#loader, .spinner').remove()


    // Add custom control group for our toolbar controls

    var viewerToolbar = this.viewer.getToolbar(true)

    this.ctrlGroup = new Autodesk.Viewing.UI.ControlGroup('forge')

    viewerToolbar.addControl(this.ctrlGroup)
  }

  //////////////////////////////////////////////////////////////////////////
  // Load all extensions on hook up events
  //
  //////////////////////////////////////////////////////////////////////////
  loadExtensions () {

    // Derivative Extension

    this.viewer.loadExtension(
      'Viewing.Extension.Derivative')

    this.derivativeExtension = this.viewer.loadedExtensions[
      'Viewing.Extension.Derivative']

    // ModelTransformer Extension

    this.viewer.loadExtension(
      'Viewing.Extension.ModelTransformer', {
        parentControl: this.ctrlGroup
      })

    this.modelTransformerExtension =
      this.viewer.loadedExtensions[
        'Viewing.Extension.ModelTransformer']

    this.modelTransformerExtension.on('model.delete',
      (model) => {

        model.node.parent.classList.remove('derivated')

        delete model.version.manifest

        this.derivativeExtension.deleteManifest(
          model.storageUrn)

        this.sceneManagerExtension.removeModel(model)
    })

    // A360 View Extension

    this.viewer.loadExtension(
      'Viewing.Extension.A360View', {
        parentControl: this.ctrlGroup,
        showPanel: true
      })

    this.a360ViewExtension =
      this.viewer.loadedExtensions['Viewing.Extension.A360View']

    this.a360ViewExtension.on('node.dblClick', (node)=> {

      if(node.type === 'items') {

        this.importModelFromItem(node).then((model) => {

          this.sceneManagerExtension.addModel(model)
        })
      }
    })

    this.a360ViewExtension.on('node.added', (node)=> {

      if(node.type === 'items') {

        this.derivativeExtension.onItemNode(node)
      }
    })

    // SceneManager Extension

    this.viewer.loadExtension(
      'Viewing.Extension.SceneManager', {
        parentControl: this.ctrlGroup
      })

    this.sceneManagerExtension = this.viewer.loadedExtensions[
      'Viewing.Extension.SceneManager']

    this.sceneManagerExtension.on('scene.restore', (scene)=> {

    })
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  importModelFromItem (item, options = {}) {

    return new Promise(async(resolve, reject) => {

      try {

        console.log(item)

        if (!item.versions || !item.versions.length) {

          this.a360ViewExtension.panel.showError(
            'No version available (Please wait) ...')

          return reject('No item version available')
        }

        this.a360ViewExtension.panel.startLoad(
          'Loading ' + item.name + ' ...')

        //pick the last version by default
        var version = item.versions[ item.versions.length - 1 ]

        var storageUrn = window.btoa(
          version.relationships.storage.data.id)

        // !IMPORTANT: remove all padding '=' chars
        // not accepted by the adsk services

        storageUrn = storageUrn.replace(new RegExp('=', 'g'), '')

        var urn = version.relationships.derivatives.data.id

        console.log('A360 URN: ' + urn)
        console.log('Storage URN: ' + storageUrn)

        // check if item version has existing svf derivative
        // this has been pre-filled by derivativeExtension

        if (!(version.manifest &&
              version.manifest.status   === 'success' &&
              version.manifest.progress === 'complete')) {

          var manifest = await this.derivativeExtension.postJob(version)

          version.manifest = manifest

          item.parent.classList.add('derivated')
        }

        // SVF Loaded callback

        var onSVFLoaded = async (svf) => {

          var viewablePath = ViewerToolkit.getDefaultViewablePath(svf)

          if(!viewablePath) {

            return reject('No viewable content')
          }

          let model = await this.loadViewable(viewablePath, {
            acmSessionId: svf.acmSessionId
          })

          var metadata = await this.derivativeExtension.getMetadata(
            storageUrn)

          // assume first metadata, since we loaded first viewable

          if (metadata.metadata && metadata.metadata.length) {

            var guid = metadata.metadata[0].guid

            model.guid = guid
          }

          this.a360ViewExtension.panel.stopLoad()

          // store for later use by extensions

          model.node = item
          model.name = item.name
          model.version = version
          model.storageUrn = storageUrn
          model.id = ViewerToolkit.guid()
          model.transform = options.transform

          this.modelTransformerExtension.addModel(model)

          // fits model to view - need to wait for instance tree
          // but no event gets fired

          this.fitModelToView(model)

          return resolve(model)
        }

        Autodesk.Viewing.Document.load(
          'urn:' + storageUrn, (svf) => onSVFLoaded(svf), (errCode) => {

          var errMsg = this.logError(errCode)

          this.a360ViewExtension.panel.showError(errMsg)

          return reject({
            error: errCode,
            description: errMsg
          })
        })

      }
      catch(ex) {

        return reject(ex)
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // Load viewable path
  //
  //////////////////////////////////////////////////////////////////////////
  loadViewable(viewablePath, opts) {

    return new Promise(async(resolve, reject)=> {

      let _onGeometryLoaded = (event)=> {

        this.viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded)

        return resolve(event.model)
      }

      this.viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        _onGeometryLoaded)

      var _onSuccess = () => {}

      var _onError = (errorCode, errorMessage,
                      statusCode, statusText) => {

        this.viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded)

        return reject({
          errorCode: errorCode,
          errorMessage: errorMessage,
          statusCode: statusCode,
          statusText: statusText
        })
      }

      this.viewer.loadModel(
        viewablePath, opts, _onSuccess, _onError)
    })
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  fitModelToView (model) {

    var instanceTree = model.getData().instanceTree

    if(instanceTree) {

      var rootId = instanceTree.getRootId()

      this.viewer.fitToView([ rootId ])
    }
    else {

      setTimeout(() => {
        this.fitModelToView(model)
      }, 500)
    }
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

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  getToken (url) {

    var xhr = new XMLHttpRequest()
    xhr.open("GET", url, false)
    xhr.send(null)

    var response = JSON.parse(xhr.responseText)

    return response.access_token
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  destroy () {

    this.viewer.finish()

    $(this.viewer.container).remove()
  }
}