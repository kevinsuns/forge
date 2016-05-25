/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import A360API from './Viewing.Extension.A360View.API'
import './Viewing.Extension.A360View.css'
import ToolPanelBase from 'ToolPanelBase'
import TabManager from 'TabManager'

export default class CustomTreePanel extends ToolPanelBase {

  constructor(container, btnElement, rootNode) {

    super(container, 'A360 View', {
      buttonElement: btnElement,
      shadow: true
    });

    this.api = new A360API({
      apiUrl: '/api/dm'
    });

    $(this.container).addClass('a360');

    this.TabManager = new TabManager(
      '#' + this.tabsContainerId);
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    this.tabsContainerId = ToolPanelBase.guid()

    return `

      <div class="container">

        <div id="${this.tabsContainerId}" class="tabs-container">
        </div>

      </div>`;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadData() {

    const hubs = await this.api.getHubs()

    var active = true

    hubs.forEach((hub) => {

      var treeContainerId = ToolPanelBase.guid()

      this.TabManager.addTab({
        name: 'Hub: ' + hub.attributes.name,
        active: active,
        html: `<div id=${treeContainerId} class="tree-container"> </div>`
      });

      this.loadTree(treeContainerId, hub)

      active = false
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadTree(containerId, hub) {

    var treeContainer = $(`#${containerId}`)[0];

    var delegate = new CustomTreeDelegate(this.api);

    var rootNode = {
      name: hub.attributes.name,
      type: hub.type,
      group: true,
      id: hub.id
    }

    new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, treeContainer, {
        excludeRoot: false,
        localize: true
      });

    delegate.on('node.dblClick', (node) => {

      this.emit('node.dblClick', node)
    })
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class CustomTreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor(api) {

    super()

    this._events = {}

    this.api = api
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeId(node) {

    return node.id;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  isTreeNodeGroup (node) {

    return node.group;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeDoubleClick (tree, node, event) {

    if(node.type === 'items'){

      this.emit('node.dblClick', node)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, callback) {

    switch(node.type) {

      case 'hubs':

        this.api.getProjects(node.id).then((projects) => {

          projects.forEach( (project) => {

            var child = {
              name: project.attributes.name,
              type: project.type,
              hubId: node.id,
              id: project.id,
              group: true
            }

            callback(child)
          })
        })

        break

      case 'projects':

        this.api.getRootFolder(node.hubId, node.id).then((root) => {

          console.log(root)

          this.api.getFolderContent(node.id, root.id).then((folderItems) => {

            console.log(folderItems)

            folderItems.forEach((folderItem) => {

              var child = {
                name: folderItem.attributes.displayName,
                group: folderItem === 'folders',
                type: folderItem.type,
                projectId: node.id,
                id: folderItem.id
              }

              callback(child)
            })
          })
        })

        break

      case 'folders':

          this.api.getFolderContent(node.projectId, node.id).then((folderItems) => {

            folderItems.forEach((folderItem) => {

              var child = {
                name: folderItem.attributes.displayName,
                group: folderItem === 'folders',
                projectId: node.projectId,
                type: folderItem.type,
                id: folderItem.id
              }

              callback(child)
            })
          })

        break

      case 'items':

        //no children for an item ...

      default:
        break
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  on(event, fct) {

    this._events[event] = this._events[event]	|| [];
    this._events[event].push(fct);
    return fct;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  off(event, fct) {

    if(event in this._events === false)
      return;

    this._events[event].splice(
      this._events[event].indexOf(fct), 1);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  emit(event /* , args... */) {

    if(this._events[event] === undefined)
      return;

    var tmpArray = this._events[event].slice();

    for(var i = 0; i < tmpArray.length; ++i) {
      var result	= tmpArray[i].apply(this,
        Array.prototype.slice.call(arguments, 1));

      if(result !== undefined )
        return result;
    }

    return undefined;
  }
}