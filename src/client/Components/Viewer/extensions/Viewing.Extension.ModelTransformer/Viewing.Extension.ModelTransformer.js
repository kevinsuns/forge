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

    this.modelCollection = {}

    this.onAggregateSelectionChangedHandler = (e) =>{

      this.onAggregateSelectionChanged(e)
    }
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

    this._viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {

        this._options.parentControl.addControl(
          this.control)
      })

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

      if(data.fitToView) {

        this.fitModelToView(data.model)
      }
    })

    this._viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChangedHandler)

    console.log('Viewing.Extension.ModelTransformer loaded');

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChangedHandler)

    this._options.parentControl.removeControl(
      this.control)

    console.log('Viewing.Extension.ModelTransfomer unloaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Fix model structure when selecting model
  //
  /////////////////////////////////////////////////////////////////
  onAggregateSelectionChanged(event) {

    if (event.selections && event.selections.length) {

      var selection = event.selections[0]

      this.setStructure(selection.model)
    }
  }

  /////////////////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /////////////////////////////////////////////////////////////////
  transformModel(model, transform) {

    var viewer = this._viewer

    var euler = new THREE.Euler(
      (model.offset.rotation.x + transform.rotation.x) * Math.PI/180,
      (model.offset.rotation.y + transform.rotation.y) * Math.PI/180,
      (model.offset.rotation.z + transform.rotation.z) * Math.PI/180,
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

    this.modelCollection[model.id] = model

    if(!this.firstModelLoaded) {

      this.firstModelLoaded = model.name
    }

    if(!model.transform) {

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
    }

    model.offset = this.buildModelOffset(
      model.name)

    this.transformModel(
      model, model.transform)

    this.panel.dropdown.addItem(
      model, true)
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  buildModelOffset (modelName) {

    // those file type have different orientation
    // than other, so need to correct it
    // upon insertion
    const zOriented = ['rvt', 'nwc']

    var rotation = { x:0.0, y:0.0, z:0.0 }

    var firstExt = this.firstModelLoaded.split(".").pop(-1)

    var modelExt = modelName.split(".").pop(-1)

    if(zOriented.indexOf(firstExt) > -1) {

      if(zOriented.indexOf(modelExt) < 0) {

        rotation = { x:90.0, y:0.0, z:0.0 }
      }
    }
    else {

      if(zOriented.indexOf(modelExt) > -1) {

        rotation = { x:-90.0, y:0.0, z:0.0 }
      }
    }

    var offset = {
      rotation
    }

    return offset
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteModel (model) {

    delete this.modelCollection[model.id]

    if(Object.keys(this.modelCollection).length === 0){

      this.firstModelLoaded = null
    }

    this.emit('model.delete', model)

    this._viewer.impl.unloadModel(model)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension)
