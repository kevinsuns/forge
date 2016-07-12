/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import DetailsPanel from './Viewing.Extension.A360View.DetailsPanel'
import ContextMenu from './Viewing.Extension.A360View.ContextMenu'
import './Viewing.Extension.A360View.css'
import ToolPanelBase from 'ToolPanelBase'
import TabManager from 'TabManager'
import Dropzone from 'dropzone'

export default class A360Panel extends ToolPanelBase {

  constructor(extension, container, btnElement) {

    super(container, 'A360 View', {
      buttonElement: btnElement,
      closable: true,
      movable: true,
      shadow: true
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

    var dragHandler = (e) => {

      if($(e.target).parents('.a360').length) {

        $(this.container).find(
          '.container').addClass('hover')

      } else {

        $(this.container).find(
          '.container').removeClass('hover')
      }

      e.preventDefault()
      e.dataTransfer.effectAllowed = 'none'
      e.dataTransfer.dropEffect = 'none'
    }

    window.addEventListener('dragenter', (e) => {

      dragHandler(e)

    }, false);

    window.addEventListener('dragover', (e) => {

      dragHandler(e)
    })

    this.contextMenu = new ContextMenu(extension._viewer)

    this.contextMenu.on('context.details', (data) => {

      var panel = new DetailsPanel(
        extension._viewer.container,
        data.title, {
          left: data.event.clientX + 50
        }, data.node.object)

      panel.setVisible(true)
    })
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

    var delegate = new A360TreeDelegate(
      this.container,
      this.extension,
      this.contextMenu)

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

    this.setTitle(title)

    var angle = 0

    if(!this.loadIntervalId){

      this.loadIntervalId = setInterval( () => {

        angle += 30
        angle %= 360

        $(`#${this.titleImgId}`).css({
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

    $(`#${this.titleImgId}`).css({
      transform: `rotateY(0deg)`
    })

    this.setTitle('A360 View')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  showError (error) {

    clearInterval(this.loadIntervalId)

    this.loadIntervalId = 0

    $(`#${this.titleImgId}`).css({
      transform: `rotateY(0deg)`
    })

    this.setTitle(error)
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
  constructor(container, extension, contextMenu) {

    super()

    this.contextMenu = contextMenu

    this.container = container

    this.extension = extension

    this.clickTimeout = 0
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
  onTreeNodeIconClick (tree, node, event) {

    clearTimeout(this.clickTimeout)

    this.clickTimeout = setTimeout(() => {

      tree.setCollapsed(node, !tree.isCollapsed(node))

    }, 200)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeClick (tree, node, event) {

    clearTimeout(this.clickTimeout)

    this.clickTimeout = setTimeout(() => {

      tree.setCollapsed(node, !tree.isCollapsed(node))

    }, 200)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeDoubleClick (tree, node, event) {

    clearTimeout(this.clickTimeout)

    this.extension.emit('node.dblClick', node)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeRightClick (tree, node, event) {

    this.contextMenu.show(event, node)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeLabel (node) {

    return node.name
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    parent.id = ToolPanelBase.guid()

    node.parent = parent

    parent.classList.add(node.type)

    var text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    var labelId = ToolPanelBase.guid()

    if (node.tooltip) {

      var html = `
        <label class="${node.type}" id="${labelId}"
          ${options && options.localize?"data-i18n=" + text : ''}
            data-placement="right"
            data-toggle="tooltip"
            data-delay='{"show":"1000", "hide":"100"}'
            title="loading item ...">
          ${text}
        </label>
      `

      $(parent).append(html)

      $(parent).find('label[data-toggle="tooltip"]').tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })

      node.setTooltip = (title) => {

        $(parent).find('label')
          .attr('title', title)
          .tooltip('fixTitle')
          .tooltip('setContent')
      }
    }
    else {

      var label = `<label class="${node.type}" id="${labelId}"
          ${options && options.localize?"data-i18n=" + text : ''}>
          ${text}
        </label>`

      $(parent).append(label)
    }

    if (node.type === 'projects' || node.type === 'folders') {

      $(`#${labelId}`).css({
        'pointer-events': 'none'
      })

      var container = this.container

      $(parent).dropzone({
        url: `/api/dm/upload/${node.projectId}/${node.folderId}`,
        dictDefaultMessage: ' - upload',
        previewTemplate: '<div></div>',
        parallelUploads: 20,
        clickable: false,
        autoQueue: true,
        init: function() {

          var dropzone = this

          dropzone.on('dragenter', () => {
            $(parent).addClass('drop-target')

            $(container).find(
              '.container').addClass('hover')
          })

          dropzone.on('dragleave', () => {
            $(parent).removeClass('drop-target')
          })

          dropzone.on('dragend', () => {
            $(parent).removeClass('drop-target')
          })

          dropzone.on('drop', () => {
            $(parent).removeClass('drop-target')
          })

          dropzone.on('addedfile', (file) => {
            console.log(file)
          })

          dropzone.on('uploadprogress', (file, progress) => {
            console.log(progress)
          })
        },
        success: (file, response) => {

          console.log(response)

          this.createItemNode(node, response.item)
        }
      })

      //$('div.dz-default.dz-message > span').hide();
    }

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    this.extension.emit('node.added', node)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    node.addChild = addChildCallback

    if(node.onIteratingChildren) {

      node.onIteratingChildren()
    }

    switch(node.type) {

      case 'hubs':

        this.extension.api.getProjects(
          node.id).then((projects) => {

            projects.forEach( (project) => {

              var rootId = project.relationships.rootFolder.data.id

              var child = {
                name: project.attributes.name,
                projectId: project.id,
                type: project.type,
                object: project,
                folderId: rootId,
                hubId: node.id,
                id: project.id,
                group: true
              }

              addChildCallback(child)
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

                  if(folderItem.type === 'items') {

                    this.createItemNode (
                      node,
                      folderItem)
                  }
                  else {

                    var child = {
                      name: folderItem.attributes.displayName,
                      folderId: folderItem.id,
                      type: folderItem.type,
                      object: folderItem,
                      projectId: node.id,
                      hubId: node.hubId,
                      id: folderItem.id,
                      group: true
                    }

                    addChildCallback(child)
                  }
                })
            })
          })

        break

      case 'folders':

        this.extension.api.getFolderContent(
          node.projectId, node.id).then((folderItems) => {

            folderItems.forEach((folderItem) => {

              if(folderItem.type === 'items') {

                this.createItemNode (
                  node,
                  folderItem)
              }
              else {

                var child = {
                  name: folderItem.attributes.displayName,
                  projectId: node.projectId,
                  folderId: folderItem.id,
                  type: folderItem.type,
                  object: folderItem,
                  hubId: node.hubId,
                  id: folderItem.id,
                  group: true
                }

                addChildCallback(child)
              }
            })
          })

        break
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createItemNode (parent, item) {

    var node = {
      name: item.attributes.displayName,
      projectId: parent.projectId,
      hubId: parent.hubId,
      folderId: item.id,
      type: item.type,
      object: item,
      id: item.id,
      group: true
    }

    this.extension.api.getVersions(
      node.projectId, node.id).then((versions) => {

        node.versions = versions
        node.tooltip = true

        parent.addChild(node)
      })
  }
}