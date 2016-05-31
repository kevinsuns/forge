import EventsEmitter from 'EventsEmitter'

export default class TransformTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer){

    super();

    this._viewer = viewer;
  
    this._hitPoint = null;
  
    this._isDragging = false;
  
    this._transformMesh = null;

    this._transformControlTx = null;

    this._selectedFragProxyMap = {};

    this.onTxChange =
      this.onTxChange.bind(this);

    this.onAggregateSelectionChanged =
      this.onAggregateSelectionChanged.bind(this);

    this.onCameraChanged =
      this.onCameraChanged.bind(this);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getNames() {

    return ["Viewing.Transform.Tool"];
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getName() {

    return "Viewing.Transform.Tool";
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates a dummy mesh to attach control to
  //
  ///////////////////////////////////////////////////////////////////////////
  createTransformMesh() {

    var material = new THREE.MeshPhongMaterial(
      { color: 0xff0000 });

    this._viewer.impl.matman().addMaterial(
      'transform-tool-material',
      material,
      true);

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.0001, 5),
      material);

    sphere.position.set(0, 0, 0);

    return sphere;
  }

  ///////////////////////////////////////////////////////////////////////////
  // on translation change
  //
  ///////////////////////////////////////////////////////////////////////////
  onTxChange() {

    if(this._isDragging && this._transformControlTx.visible) {

      this._model.transform.translation = new THREE.Vector3(
        this._transformMesh.position.x - this._model.offset.x,
        this._transformMesh.position.y - this._model.offset.y,
        this._transformMesh.position.z - this._model.offset.z);

      for(var fragId in this._selectedFragProxyMap) {

        var fragProxy = this._selectedFragProxyMap[fragId];

        var position = new THREE.Vector3(
          this._transformMesh.position.x - fragProxy.offset.x,
          this._transformMesh.position.y - fragProxy.offset.y,
          this._transformMesh.position.z - fragProxy.offset.z);

        fragProxy.position = position;

        fragProxy.updateAnimTransform();
      }

      this.emit('transform.TxChange', {
        model: this._model
      });
    }

    this._viewer.impl.sceneUpdated(true);
  }

  ///////////////////////////////////////////////////////////////////////////
  // on camera changed
  //
  ///////////////////////////////////////////////////////////////////////////
  onCameraChanged() {

    if(this._transformControlTx) {

      this._transformControlTx.update();
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // item selected callback
  //
  ///////////////////////////////////////////////////////////////////////////
  onAggregateSelectionChanged(event) {

    console.log(event)

    if(event.selections && event.selections.length) {

      var selection = event.selections[event.selections.length - 1]

      this._model = selection.model

      console.log('Model: ' + this._model.name)

      var rootId = this._model.getData().instanceTree.getRootId()
      
      var fragIdsArray = []

      var fragCount = this._model.getFragmentList().
        fragments.fragId2dbId.length;

      //fragIds range from 0 to fragCount-1
      for(var fragId=0; fragId<fragCount; ++fragId){

        fragIdsArray.push(fragId);
      }

      this.initializeSelection(
        this._hitPoint, fragIdsArray)
    }
    else if(this._model) {

      this.clearSelection()
    }
  }

  initializeSelection (hitPoint, fragIdsArray) {

    this._model.offset = {
      x: hitPoint.x - this._model.transform.translation.x,
      y: hitPoint.y - this._model.transform.translation.y,
      z: hitPoint.z - this._model.transform.translation.z
    }

    this._transformControlTx.visible = true;

    this._transformControlTx.setPosition(
      hitPoint);

    this._transformControlTx.addEventListener(
      'change', this.onTxChange);

    this._viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged);

    fragIdsArray.forEach((fragId)=> {

      var fragProxy = this._viewer.impl.getFragmentProxy(
        this._viewer.model,
        fragId);

      fragProxy.getAnimTransform();

      fragProxy.offset = {

        x: hitPoint.x - fragProxy.position.x,
        y: hitPoint.y - fragProxy.position.y,
        z: hitPoint.z - fragProxy.position.z
      };

      this._selectedFragProxyMap[ fragId ] = fragProxy;
    })
  }

  clearSelection () {

    this._model = null;

    this._selectedFragProxyMap = {};

    this._transformControlTx.visible = false;

    this._transformControlTx.removeEventListener(
      'change', this.onTxChange);

    this._viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged);
  }

  ///////////////////////////////////////////////////////////////////////////
  // normalize screen coordinates
  //
  ///////////////////////////////////////////////////////////////////////////
  normalize(screenPoint) {

    var viewport = this._viewer.navigation.getScreenViewport();

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    };

    return n;
  }

  ///////////////////////////////////////////////////////////////////////////
  // get 3d hit point on mesh
  //
  ///////////////////////////////////////////////////////////////////////////
  getHitPoint(event) {

    var screenPoint = {
      x: event.clientX,
      y: event.clientY
    };

    var n = this.normalize(screenPoint);

    var hitPoint = this._viewer.utilities.getHitPoint(n.x, n.y);

    return hitPoint;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activate() {

    this._viewer.select([]);

    var bbox = this._viewer.model.getBoundingBox();

    this._viewer.impl.createOverlayScene(
      'TransformToolOverlay');

    this._transformControlTx = new THREE.TransformControls(
      this._viewer.impl.camera,
      this._viewer.impl.canvas,
      "translate");

    this._transformControlTx.setSize(
      bbox.getBoundingSphere().radius * 5);

    this._transformControlTx.visible = false;

    this._viewer.impl.addOverlay(
      'TransformToolOverlay',
      this._transformControlTx);

    this._transformMesh = this.createTransformMesh();

    this._transformControlTx.attach(
      this._transformMesh);

    this._viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChanged);
  }

  ///////////////////////////////////////////////////////////////////////////
  // deactivate tool
  //
  ///////////////////////////////////////////////////////////////////////////
  deactivate() {

    this._viewer.impl.removeOverlay(
      'TransformToolOverlay',
      this._transformControlTx);

    this._transformControlTx.removeEventListener(
      'change',
      this.onTxChange);

    this._transformControlTx = null;

    this._viewer.impl.removeOverlayScene(
      'TransformToolOverlay');

    this._viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged);

    this._viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChanged);
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonDown(event, button) {

    this._hitPoint = this.getHitPoint(event);

    this._isDragging = true;

    if (this._transformControlTx.onPointerDown(event))
      return true;

    //return _transRotControl.onPointerDown(event);
    return false;
  };

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonUp(event, button) {

    this._isDragging = false;

    if (this._transformControlTx.onPointerUp(event))
      return true;

    //return _transRotControl.onPointerUp(event);
    return false;
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleMouseMove(event) {

    if (this._isDragging) {

      if (this._transformControlTx.onPointerMove(event) ) {

        return true;
      }

      return false;
    }

    if (this._transformControlTx.onPointerHover(event))
      return true;

    //return _transRotControl.onPointerHover(event);
    return false;
  }
}
