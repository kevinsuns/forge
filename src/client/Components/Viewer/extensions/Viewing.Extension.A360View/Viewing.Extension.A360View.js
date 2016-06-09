/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360ViewExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import A360Panel from './Viewing.Extension.A360View.Panel'
import A360API from './Viewing.Extension.A360View.API'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class A360ViewExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this.api = new A360API({
      apiUrl: '/api/dm'
    })
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.A360View';
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

    console.log('Viewing.Extension.A360View loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._options.parentControl.removeControl(
      this.control);

    console.log('Viewing.Extension.A360View unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  A360ViewExtension.ExtensionId,
  A360ViewExtension);
