/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import './Viewing.Extension.A360View.css'
import ToolPanelBase from 'ToolPanelBase'
import TabManager from 'TabManager'

export default class A360Panel extends ToolPanelBase {

  constructor(extension, container, btnElement) {

    super(container, 'A360 View', {
      buttonElement: btnElement
    })

    this.extension = extension

    $(this.container).addClass('a360')

    this.TabManager = new TabManager(
      '#' + this.tabsContainerId)

    this.on('open', () => {

      this.loadData()
    })

    this.on('close', () => {

      this.TabManager.clear()
    })

    this.titleId = ToolPanelBase.guid()

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle').text('')

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle').prepend(
        `<div id="${this.titleId}">A360 View</div>`)

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle').prepend('<img/>')
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

      </div>`
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadData() {

    const hubs = await this.extension.api.getHubs()

    hubs.forEach((hub) => {

      var treeContainerId = ToolPanelBase.guid()

      this.TabManager.addTab({
        name: 'Hub: ' + hub.attributes.name,
        active: true,
        html: `<div id=${treeContainerId} class="tree-container"> </div>`
      })

      this.loadTree(treeContainerId, hub)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadTree(containerId, hub) {

    var treeContainer = $(`#${containerId}`)[0]

    var delegate = new A360TreeDelegate(this.extension)

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
      })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  startLoad (title) {

    $(`#${this.titleId}`).text(title)

    var angle = 0

    if(!this.loadIntervalId){

      this.loadIntervalId = setInterval( () => {

        angle += 30
        angle %= 360

        $(`#${this.container.id}`).find(
          '.dockingPanelTitle img').css({
            transform: `rotateY(${angle}deg)`
          })
      }, 100)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  stopLoad () {

    clearInterval(this.loadIntervalId)

    this.loadIntervalId = 0

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle img').css({
        transform: `rotateY(0deg)`
      })

    $(`#${this.titleId}`).text('A360 View')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  showError (error) {

    clearInterval(this.loadIntervalId)

    this.loadIntervalId = 0

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle img').css({
        transform: `rotateY(0deg)`
      })

    $(`#${this.titleId}`).text(error)
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class A360TreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor(extension) {

    super()

    this._events = {}

    this.extension = extension
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeId(node) {

    return node.id
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  isTreeNodeGroup (node) {

    return node.group
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeDoubleClick (tree, node, event) {

    this.extension.emit('node.dblClick', node)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeLabel = function (node) {

    return node.name
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options) {

    node.parent = parent

    parent.classList.add(node.type)

    var label = document.createElement('label')

    label.classList.add(node.type)

    parent.appendChild(label)

    var text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      label.setAttribute('data-i18n', text)
      text = Autodesk.Viewing.i18n.translate(text)
    }

    label.textContent = text
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, callback) {

    switch(node.type) {

      case 'hubs':

        this.extension.api.getProjects(node.id).then((projects) => {

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

        this.extension.api.getProject(
          node.hubId, node.id).then((project) => {

            var rootId = project.relationships.rootFolder.data.id

            this.extension.api.getFolderContent(
              node.id, rootId).then((folderItems) => {

                folderItems.forEach((folderItem) => {

                  var child = {
                    name: folderItem.attributes.displayName,
                    type: folderItem.type,
                    projectId: node.id,
                    id: folderItem.id,
                    group: true
                  }

                  callback(child)
                })
            })
          })

        break

      case 'folders':

        this.extension.api.getFolderContent(
          node.projectId, node.id).then((folderItems) => {

            folderItems.forEach((folderItem) => {

              var child = {
                name: folderItem.attributes.displayName,
                projectId: node.projectId,
                type: folderItem.type,
                id: folderItem.id,
                group: true
              }

              callback(child)
            })
          })

        break

      case 'items':

        this.extension.api.getItemVersions(
          node.projectId, node.id).then((itemVersions) => {

            node.versions = itemVersions

            // node ready for further processing,
            // by derivative for example
            var children = this.extension.emit(
              'node.added', node)

            if(children) {

              children = Array.isArray(children) ?
                children : [children]

              children.forEach((child) => {

                callback(child)
              })
            }
          })

      default:
        break
    }
  }
}