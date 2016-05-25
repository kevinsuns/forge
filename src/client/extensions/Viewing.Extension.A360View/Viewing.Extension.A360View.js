/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360ViewExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import Panel from './Viewing.Extension.A360View.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class A360ViewExtension extends ExtensionBase {

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

    return 'Viewing.Extension.A360View';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    var rootNode = await ViewerToolkit.buildModelTree(
      this._viewer.model);

    this.panel = new Panel(
      this._viewer.container, null, rootNode);

    this.onNodeDblClikedHandler = (node) => {

      this.onNodeDblCliked(node)
    }

    this.panel.on('node.dblClick', (node) => {

      this.onNodeDblClikedHandler(node)
    })

    this.panel.setVisible(true)

    this.panel.loadData()

    console.log('Viewing.Extension.A360View loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.A360View unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onNodeDblCliked (node) {

    this.emit('load.model', node)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  A360ViewExtension.ExtensionId,
  A360ViewExtension);
