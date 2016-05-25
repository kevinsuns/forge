/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ModelTransfomerExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import Panel from './Viewing.Extension.ModelTransformer.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class ModelTransformerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ModelTransformer';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this.control = ViewerToolkit.createButton(
      'state-manager-control',
      'glyphicon glyphicon-retweet',
      'Manage States', ()=>{

        this.panel.toggleVisibility();
      });

    this._options.parentControl.addControl(
      this.control);

    this.panel = new Panel(
      this._viewer.container, this.control.container);

    console.log('Viewing.Extension.ModelTransformer loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._options.parentControl.removeControl(
      this.control);

    console.log('Viewing.Extension.ModelTransfomer unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension);
