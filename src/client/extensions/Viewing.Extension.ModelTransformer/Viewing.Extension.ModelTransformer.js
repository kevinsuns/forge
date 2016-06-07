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

    this.firstModelLoaded = null
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ModelTransformer'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this.control = ViewerToolkit.createButton(
      'toolbar-model-transformer',
      'adsk-button-icon model-transformer-icon',
      'Transform Models', ()=>{

        this.panel.toggleVisibility()
      })

    this._options.parentControl.addControl(
      this.control)

    this.panel = new Panel(
      this._viewer,
      this.control.container)

    this.panel.on('model.transform', (data)=>{

      data.model.transform = data.transform

      this.transformModel(
        data.model,
        data.transform)

      this._viewer.impl.sceneUpdated(true)
    })

    this.panel.on('model.delete', (data)=>{

      this.deleteModel(
        data.model)

      this._viewer.impl.sceneUpdated(true)
    })

    this.panel.on('model.selected', (data)=>{

      if(data.fitToView){

        this.fitModelToView(data.model)
      }

      this.setStructure(data.model)
    })

    console.log('Viewing.Extension.ModelTransformer loaded');

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._options.parentControl.removeControl(
      this.control)

    console.log('Viewing.Extension.ModelTransfomer unloaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /////////////////////////////////////////////////////////////////
  transformModel(model, transform) {

    var viewer = this._viewer

    var euler = new THREE.Euler(
      transform.rotation.x * Math.PI/180,
      transform.rotation.y * Math.PI/180,
      transform.rotation.z * Math.PI/180,
      'XYZ')

    var quaternion = new THREE.Quaternion()

    quaternion.setFromEuler(euler)

    function _transformFragProxy(fragId){

      var fragProxy = viewer.impl.getFragmentProxy(
        model,
        fragId)

      fragProxy.getAnimTransform()

      fragProxy.position = transform.translation

      fragProxy.scale = transform.scale

      //Not a standard three.js quaternion
      fragProxy.quaternion._x = quaternion.x
      fragProxy.quaternion._y = quaternion.y
      fragProxy.quaternion._z = quaternion.z
      fragProxy.quaternion._w = quaternion.w

      fragProxy.updateAnimTransform()
    }

    var fragCount = model.getFragmentList().
      fragments.fragId2dbId.length

    //fragIds range from 0 to fragCount-1
    for(var fragId=0; fragId<fragCount; ++fragId){

      _transformFragProxy(fragId)
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  fitModelToView (model) {

    var instanceTree = model.getData().instanceTree

    if(instanceTree){

      var rootId = instanceTree.getRootId()

      this._viewer.fitToView([rootId])
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  setStructure (model) {

    var instanceTree = model.getData().instanceTree

    if(instanceTree){

      this._viewer.modelstructure.setModel(
        instanceTree)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  addModel (model) {

    model.id = ExtensionBase.guid()

    if(!this.firstModelLoaded) {

      this.firstModelLoaded = model.name
    }

    var transform = this.buildModelTransform(
      model.name)

    this.transformModel(
      model, transform)

    model.transform = transform

    this.panel.dropdown.addItem(
      model, true)
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  buildModelTransform (modelName) {

    var rotation = { x:0.0, y:0.0, z:0.0 }

    if(this.firstModelLoaded.endsWith('.rvt') ||
       this.firstModelLoaded.endsWith('.nwc')){

      if(!(modelName.endsWith('.rvt') ||
           modelName.endsWith('.nwc'))){

        rotation = { x:90.0, y:0.0, z:0.0 }
      }
    }
    else {

      if(modelName.endsWith('.rvt') ||
         modelName.endsWith('.nwc')){

        rotation = { x:-90.0, y:0.0, z:0.0 }
      }
    }

    var transform = {
      scale: {
        x:1.0, y:1.0, z:1.0
      },
      translation: {
        x:0.0, y:0.0, z:0.0
      },
      rotation: rotation
    }

    return transform
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteModel (model) {

    this.emit('model.delete', model)

    this._viewer.impl.unloadModel(model)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension)
