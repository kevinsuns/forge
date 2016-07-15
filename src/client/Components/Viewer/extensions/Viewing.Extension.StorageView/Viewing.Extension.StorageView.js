/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360ViewExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import A360Panel from './Viewing.Extension.A360View.Panel'
import A360API from './Viewing.Extension.A360.API'
import OSSAPI from './Viewing.Extension.OSS.API'
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

    return 'Viewing.Extension.StorageView';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this.control = ViewerToolkit.createButton(
      'toolbar-a360-view',
      'adsk-button-icon a360-icon',
      'A360 View', ()=>{

        this.panel.toggleVisibility()
      })

    this._options.parentControl.addControl(
      this.control)

    this.panel = new A360Panel(
      this,
      this._viewer.container,
      this.control.container)

    this.panel.setVisible(
      this._options.showPanel)

    console.log('Viewing.Extension.StorageView loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._options.parentControl.removeControl(
      this.control);

    console.log('Viewing.Extension.StorageView unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  StorageViewExtension.ExtensionId,
  StorageViewExtension);
