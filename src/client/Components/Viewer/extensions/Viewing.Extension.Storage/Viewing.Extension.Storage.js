/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360ViewExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import StoragePanel from './Viewing.Extension.Storage.Panel'
import A360API from './A360/Viewing.Extension.A360.API'
import OSSAPI from './OSS/Viewing.Extension.OSS.API'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class StorageViewExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this.a360API = new A360API({
      apiUrl: '/api/dm'
    })

    this.ossAPI = new OSSAPI({
      apiUrl: '/api/oss'
    })
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Storage'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this.control = ViewerToolkit.createButton(
      'toolbar-storage',
      'adsk-button-icon storage-icon',
      'Autodesk Storage', ()=>{

        this.panel.toggleVisibility()
      })

    this._options.parentControl.addControl(
      this.control)

    this.panel = new StoragePanel(
      this,
      this._viewer.container,
      this.control.container)

    this.panel.setVisible(
      this._options.showPanel)

    console.log('Viewing.Extension.Storage loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._options.parentControl.removeControl(
      this.control);

    console.log('Viewing.Extension.Storage unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  StorageViewExtension.ExtensionId,
  StorageViewExtension);
