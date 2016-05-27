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
      'model-transformer-control',
      'adsk-button-icon model-transformer-icon',
      'Transform Models', ()=>{

        this.panel.toggleVisibility();
      });

    this._options.parentControl.addControl(
      this.control);

    this.panel = new Panel(
      this._viewer,
      this.control.container);

    this.panel.on('model.transform', (data)=>{

      this.transformModel(
        data.model,
        data.transform)

      this._viewer.impl.sceneUpdated(true);
    })

    this.panel.on('model.delete', (data)=>{

      this.deleteModel(
        data.model)

      this._viewer.impl.sceneUpdated(true);
    })

    this.panel.on('model.selected', (model)=>{

      this.fitModelToView(model)
    })

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

  /////////////////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /////////////////////////////////////////////////////////////////
  transformModel(model, transform) {

    var viewer = this._viewer

    function _transformFragProxy(fragId){

      var fragProxy = viewer.impl.getFragmentProxy(
        model,
        fragId);

      fragProxy.getAnimTransform();

      fragProxy.position = transform.translation;

      fragProxy.scale = transform.scale;

      //Not a standard three.js quaternion
      fragProxy.quaternion._x = transform.quaternion.x;
      fragProxy.quaternion._y = transform.quaternion.y;
      fragProxy.quaternion._z = transform.quaternion.z;
      fragProxy.quaternion._w = transform.quaternion.w;

      fragProxy.updateAnimTransform();
    }

    var fragCount = model.getFragmentList().
      fragments.fragId2dbId.length;

    //fragIds range from 0 to fragCount-1
    for(var fragId=0; fragId<fragCount; ++fragId){

      _transformFragProxy(fragId);
    }

    model.transform = transform
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  fitModelToView (model) {

    var instanceTree = model.getData().instanceTree;

    if(instanceTree){

      var rootId = instanceTree.getRootId();

      this._viewer.fitToView([rootId]);
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  addModel (model) {

    model.transform = {
      scale: {
        x:1.0, y:1.0, z:1.0
      },
      translation: {
        x:0.0, y:0.0, z:0.0
      },
      rotation: {
        x:0.0, y:0.0, z:0.0
      }
    }

    this.panel.dropdown.addItem(model, true)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteModel (model) {

    this._viewer.impl.unloadModel(model);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension);
