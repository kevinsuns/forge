/////////////////////////////////////////////////////////////////
// SceneManager Extension
// By Philippe Leefsma, April 2016
/////////////////////////////////////////////////////////////////
import SceneManagerPanel from './Viewing.Extension.SceneManager.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'
import Lockr from 'lockr'

class SceneManagerExtension extends ExtensionBase {

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

    return 'Viewing.Extension.SceneManager';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._control = ViewerToolkit.createButton(
      'scene-manager-control',
      'glyphicon glyphicon-picture',
      'Manage Scenes', ()=>{

        this._panel.toggleVisibility();
      });

    this.onAddSceneHandler =
      (e) => this.onAddScene(e);

    this.onRestoreSceneHandler =
      (e) => this.onRestoreScene(e);

    this.onRemoveSceneHandler =
      (e) => this.onRemoveScene(e);

    this.onSaveSequenceHandler =
      (e) => this.onSaveSequence(e);

    this._panel = new SceneManagerPanel(
      this._viewer.container,
      this._control.container);

    this._panel.on('scene.add', (state) => {

      return this.onAddSceneHandler(state);
    })

    this._panel.on('scene.restore', (state)=>{

      return this.onRestoreSceneHandler(state);
    });

    this._panel.on('scene.remove', (state)=>{

      return this.onRemoveSceneHandler(state);
    });

    this._panel.on('sequence.update', (sequence)=>{

      return this.onSaveSequenceHandler(sequence);
    });

    this.parentControl = this._options.parentControl;

    if(!this.parentControl){

      var viewerToolbar = this._viewer.getToolbar(true);

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'scene-manager');

      viewerToolbar.addControl(this.parentControl);
    }

    this.parentControl.addControl(
      this._control)

    console.log('Viewing.Extension.SceneManager loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this.parentControl.removeControl(
      this._control);

    this._panel.setVisible(false);

    console.log('Viewing.Extension.SceneManager unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onAddScene (data) {

    var scene = this._viewer.getState();

    scene.name = (data.name.length ?
      data.name : new Date().toString('d/M/yyyy H:mm:ss'));

    return scene;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onRestoreScene (scene) {

    this._viewer.restoreState(scene, null, false);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onRemoveScene (state) {

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onSaveSequence (sequence) {

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  addModel (model) {

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  removeModel (model) {

  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  SceneManagerExtension.ExtensionId,
  SceneManagerExtension);
