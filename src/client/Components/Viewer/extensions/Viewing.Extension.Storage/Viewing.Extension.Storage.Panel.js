/////////////////////////////////////////////////////////////////////
// Viewing.Extension.storageView
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import CreateBucketPanel from './OSS/Viewing.Extension.OSS.CreateBucket.Panel'
import DetailsPanel from './Viewing.Extension.Storage.DetailsPanel'
import ContextMenu from './Viewing.Extension.Storage.ContextMenu'
import ToolPanelBase from 'ToolPanelBase/ToolPanelBase'
import { EventsEmitterComposer } from 'EventsEmitter'
import TabManager from 'TabManager/TabManager'
import EventsEmitter from 'EventsEmitter'
import './Viewing.Extension.Storage.css'
import Dropzone from 'dropzone'

export default class StoragePanel extends ToolPanelBase {

  constructor(extension, container, btnElement) {

    super(container, 'Autodesk Storage', {
      buttonElement: btnElement,
      closable: true,
      movable: true,
      shadow: true
    })

    this.extension = extension

    $(this.container).addClass('storage')

    this.TabManager = new TabManager(
      '#' + this.tabsContainerId)

    this.on('open', () => {

      this.loadData()
    })

    this.on('close', () => {

      this.TabManager.clear()
    })

    this.titleId = ToolPanelBase.guid()

    let dragHandler = (e) => {

      if($(e.target).parents('.storage').length) {

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

      if(data.node.details) {

        let panel = new DetailsPanel(
          extension._viewer.container,
          data.title, {
            left: data.event.clientX + 50
          }, data.node.details)

        panel.setVisible(true)
      }
    })

    this.contextMenu.on('context.versions', (data) => {

      if(data.node.versions) {

        let panel = new DetailsPanel(
          extension._viewer.container,
          data.title, {
            left: data.event.clientX + 50
          }, data.node.versions)

        panel.setVisible(true)
      }
    })

    this.contextMenu.on('context.oss.createBucket', (data) => {

      let modal = new CreateBucketPanel(container)

      modal.setVisible(true)

      modal.on('close', async(event) => {

        if (event.result === 'OK') {

          let bucketCreationData = {
            policyKey: modal.PolicyKey,
            bucketKey: modal.BucketKey
            //allow:[{
            //  authId: 'AYVir4YpIiobKbt7peqr0Y85uGuFdUj7',
            //  access: 'full'
            //}]
          }

          let response = await this.extension.ossAPI.createBucket(
            bucketCreationData)

          console.log(response)

          let bucketNode = {
            bucketKey: response.bucketKey,
            name: response.bucketKey,
            id: response.bucketKey,
            type: 'oss.bucket',
            group: true
          }

          data.node.addChild(bucketNode)

          bucketNode.details = await this.extension.ossAPI.getBucketDetails(
            response.bucketKey)
        }
      })
    })

    this.contextMenu.on('context.oss.object.delete', async(data) => {

      console.log('Deleting object: ' + data.node.objectKey)

      let response = await this.extension.ossAPI.deleteObject(
        data.node.bucketKey,
        data.node.objectKey)

      console.log(response)
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

    const hubs = await this.extension.a360API.getHubs()

    hubs.forEach((hub) => {

      let treeContainerId = ToolPanelBase.guid()

      this.TabManager.addTab({
        name: 'Hub: ' + hub.attributes.name,
        active: true,
        html: `<div id=${treeContainerId} class="tree-container"> </div>`
      })

      this.loadHub(treeContainerId, hub)
    })

    this.loadOSS()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadHub (containerId, hub) {

    let treeContainer = $(`#${containerId}`)[0]

    let delegate = new A360TreeDelegate(
      this.container,
      this.extension,
      this.contextMenu)

    let rootNode = new TreeNode({
      name: hub.attributes.name,
      type: hub.type,
      hubId: hub.id,
      details: hub,
      group: true,
      id: hub.id
    })

    rootNode.on('childrenLoaded', (childrens) => {

      console.log('Hub Loaded: ' + rootNode.name)
    })

    let tree = new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, treeContainer, {
        excludeRoot: false,
        localize: true
      })

    delegate.on('createItemNode', (data) => {

      let { parent, item, version } = data

      let node = tree.nodeIdToNode[item.id]

      if (!node) {

        node = new TreeNode({
          name: item.attributes.displayName,
          projectId: parent.projectId,
          hubId: parent.hubId,
          folderId: item.id,
          type: item.type,
          details: item,
          id: item.id,
          group: true
        })

        this.extension.a360API.getVersions(
          node.projectId, node.id).then((versions) => {

            node.versions = versions

            node.tooltip = true

            parent.addChild(node)
          })

      } else {

        node.versions.push(versions)
      }

      return node
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadOSS () {

    let treeContainerId = ToolPanelBase.guid()

    this.TabManager.addTab({
      name: 'OSS',
      active: false,
      html: `<div id=${treeContainerId} class="tree-container"> </div>`
    })

    let treeContainer = $(`#${treeContainerId}`)[0]

    let delegate = new OSSTreeDelegate(
      this.container,
      this.extension,
      this.contextMenu)

    let rootNode = {
      id: ToolPanelBase.guid(),
      name: 'OSS Root Storage',
      type: 'oss.root',
      group: true
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

    let angle = 0

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

    this.setTitle('Autodesk Storage')
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
class TreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (properties) {

    super()

    Object.assign(this, properties)
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class BaseTreeDelegate extends
  EventsEmitterComposer (Autodesk.Viewing.UI.TreeDelegate) {

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
  nodeClickSelector (event) {

    const selector = ['HEADER', 'LABEL']

    return (selector.indexOf(event.path[0].nodeName) > -1)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeClick (tree, node, event) {

    if (this.nodeClickSelector(event)) {

      clearTimeout(this.clickTimeout)

      this.clickTimeout = setTimeout(() => {

        tree.setCollapsed(node, !tree.isCollapsed(node))

      }, 200)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeDoubleClick (tree, node, event) {

    if (this.nodeClickSelector(event)) {

      clearTimeout(this.clickTimeout)

      this.extension.emit('node.dblClick', node)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeRightClick (tree, node, event) {

    if (this.nodeClickSelector(event)) {

      this.contextMenu.show(event, node)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeLabel (node) {

    return node.name
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class A360TreeDelegate extends BaseTreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor(container, extension, contextMenu) {

    super(container, extension, contextMenu)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    parent.id = ToolPanelBase.guid()

    node.parent = parent

    parent.classList.add(node.type)

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    let labelId = ToolPanelBase.guid()

    if (node.tooltip) {

      let html = `
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

    } else {

      let label = `
        <label class="${node.type}" id="${labelId}"
          ${options && options.localize?"data-i18n=" + text : ''}>
          ${text}
        </label>
      `

      $(parent).append(label)
    }

    if (['projects', 'folders'].indexOf(node.type) > -1) {

      $(parent).find('icon').before(`
        <div class="cloud-upload">
          <button" class="btn c${parent.id}"
              data-placement="right"
              data-toggle="tooltip"
              data-delay='{"show":"1000", "hide":"100"}'
              title="Upload files to that folder">
            <span class="glyphicon glyphicon-cloud-upload">
            </span>
          </button>
        </div>
      `)

      $(`#${labelId}`).css({
        'pointer-events': 'none'
      })

      let container = this.container

      $(parent).dropzone({
        url: `/api/upload/dm/${node.projectId}/${node.folderId}`,
        clickable: `.btn.c${parent.id}`,
        dictDefaultMessage: ' - upload',
        previewTemplate: '<div></div>',
        parallelUploads: 20,
        autoQueue: true,
        init: function() {

          let dropzone = this

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

          })
        },
        success: (file, response) => {

          console.log(response)

          this.createItemNode(
            node,
            response.item,
            response.version)
        }
      })

    } else if(node.type === 'items') {

      if(node.versions) {

        // access latest item version by default
        let version = node.versions[ node.versions.length - 1 ]

        // checks if storage available
        if (version.relationships.storage) {

          // creates download button
          let downloadId = ToolPanelBase.guid()

          $(parent).find('icon').before(`
            <div class="cloud-download">
                <button" id="${downloadId}" class="btn c${parent.id}"
                  data-placement="right"
                  data-toggle="tooltip"
                  data-delay='{"show":"1000", "hide":"100"}'
                  title="Download ${version.attributes.displayName}">
                <span class="glyphicon glyphicon-cloud-download">
                </span>
              </button>
            </div>
          `)

          $(`#${downloadId}`).click(() => {

            // downloads object associated with version
            this.extension.a360API.download(version)
          })
        }
      }
    }

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    let loadDivId = ToolPanelBase.guid()

    node.showLoader = (show) => {

      if(!$('#' + loadDivId).length) {

        $('#' + labelId).after(`
          <div id=${loadDivId} class="label-loader"
            style="display:none;">
            <img> </img>
          </div>
        `)
      }

      $('#' + loadDivId).css(
        'display',
        show ? 'block' : 'none')
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

        this.extension.a360API.getProjects(
          node.id).then((projects) => {

            let projectTasks = projects.map((project) => {

              return new Promise((resolve, reject) => {

                let rootId = project.relationships.rootFolder.data.id

                let child = new TreeNode({
                  name: project.attributes.name,
                  projectId: project.id,
                  type: project.type,
                  details: project,
                  folderId: rootId,
                  hubId: node.id,
                  id: project.id,
                  group: true
                })
                
                child.on('childrenLoaded', (children) => {

                  child.showLoader(false)

                  resolve(child)
                })

                addChildCallback(child)

                child.showLoader(true)
              })
            })

            Promise.all(projectTasks).then((children) => {

              node.emit('childrenLoaded', children)
            })

        }, (error) => {

            node.emit('childrenLoaded', null)
        })

        break

      case 'projects':

        this.extension.a360API.getProject(
          node.hubId, node.id).then((project) => {

            let rootId = project.relationships.rootFolder.data.id

            this.extension.a360API.getFolderContent(
              node.id, rootId).then((folderItems) => {

                let folderItemTasks = folderItems.map((folderItem) => {

                  return new Promise((resolve, reject) => {

                    if (folderItem.type === 'items') {

                      var itemNode = this.createItemNode(
                        node,
                        folderItem)

                      resolve(itemNode)
                    }
                    else {

                      let child = new TreeNode({
                        name: folderItem.attributes.displayName,
                        folderId: folderItem.id,
                        type: folderItem.type,
                        details: folderItem,
                        projectId: node.id,
                        hubId: node.hubId,
                        id: folderItem.id,
                        group: true
                      })

                      child.on('childrenLoaded', (children) => {

                        child.showLoader(false)

                        resolve(child)
                      })

                      addChildCallback(child)

                      child.showLoader(true)
                    }
                  })
                })

                Promise.all(folderItemTasks).then((children) => {

                  node.emit('childrenLoaded', children)
                })

            }, (error) => {

                node.emit('childrenLoaded', null)

            })

          }, (error) => {

            node.emit('childrenLoaded', null)

          })

        break

      case 'folders':

        this.extension.a360API.getFolderContent(
          node.projectId, node.id).then((folderItems) => {

            let folderItemTasks = folderItems.map((folderItem) => {

              return new Promise((resolve, reject) => {

                if (folderItem.type === 'items') {

                  var itemNode = this.createItemNode(
                    node,
                    folderItem)

                  resolve(itemNode)
                }
                else {

                  let child = new TreeNode({
                    name: folderItem.attributes.displayName,
                    projectId: node.projectId,
                    folderId: folderItem.id,
                    type: folderItem.type,
                    details: folderItem,
                    hubId: node.hubId,
                    id: folderItem.id,
                    group: true
                  })

                  child.on('childrenLoaded', (children) => {

                    child.showLoader(false)

                    resolve(child)
                  })

                  addChildCallback(child)

                  child.showLoader(true)
                }
              })
            })

            Promise.all(folderItemTasks).then((children) => {

              node.emit('childrenLoaded', children)
            })

          }, (error) => {

            node.emit('childrenLoaded', null)

          })

        break
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createItemNode (parent, item, version) {

    return this.emit('createItemNode', {
      version,
      parent,
      item
    })
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class OSSTreeDelegate extends BaseTreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (container, extension, contextMenu) {

    super(container, extension, contextMenu)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    parent.id = ToolPanelBase.guid()

    node.parent = parent

    parent.classList.add(node.type)

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    let labelId = ToolPanelBase.guid()

    let label = `<label class="${node.type}" id="${labelId}"
        ${options && options.localize?"data-i18n=" + text : ''}>
        ${text}
      </label>`

    $(parent).append(label)

    if (node.type === 'oss.bucket') {

      $(parent).find('icon').before(`
        <div class="cloud-upload">
            <button" class="btn c${parent.id}"
              data-placement="right"
              data-toggle="tooltip"
              data-delay='{"show":"1000", "hide":"100"}'
              title="Upload files to that bucket">
            <span class="glyphicon glyphicon-cloud-upload">
            </span>
          </button>
        </div>
      `)

      $(`#${labelId}`).css({
        'pointer-events': 'none'
      })

      let container = this.container

      $(parent).dropzone({
        clickable: `.btn.c${parent.id}`,
        url: `/api/upload/oss/${node.name}`,
        dictDefaultMessage: ' - upload',
        previewTemplate: '<div></div>',
        parallelUploads: 20,
        autoQueue: true,
        init: function() {

          let dropzone = this

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

          })
        },
        success: (file, response) => {

          console.log(response)

          let id = response.bucketKey + '-' + response.objectKey

          if(!$(container).find(`leaf[lmv-nodeid='${id}']`).length) {

            let objectNode = {
              objectId: response.objectId,
              bucketKey: node.bucketKey,
              objectKey: file.name,
              type: 'oss.object',
              name: file.name,
              details: null,
              group: false,
              id: id
            }

            node.addChild(objectNode)

            this.extension.ossAPI.getObjectDetails(
              response.bucketKey,
              response.objectKey).then((objectDetails) => {

                objectNode.details = objectDetails
            })
          }
        }
      })

    } else if (node.type === 'oss.object') {

      let downloadId = ToolPanelBase.guid()

      $(parent).find('icon').before(`
        <div class="cloud-download">
            <button" id="${downloadId}" class="btn c${parent.id}"
              data-placement="right"
              data-toggle="tooltip"
              data-delay='{"show":"1000", "hide":"100"}'
              title="Download ${node.objectKey}">
            <span class="glyphicon glyphicon-cloud-download">
            </span>
          </button>
        </div>
      `)

      $(`#${downloadId}`).click(() => {

        this.extension.ossAPI.download(
          node.bucketKey,
          node.objectKey)
      })
    }

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    //this.extension.emit('node.added', node)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    node.addChild = addChildCallback

    switch(node.type) {

      case 'oss.root':

        this.extension.ossAPI.getBuckets().then((response) => {

          response.items.forEach((bucketDetails) => {

            this.extension.ossAPI.getBucketDetails(
              bucketDetails.bucketKey).then((bucketDetails) => {

                let bucketNode = {
                  bucketKey: bucketDetails.bucketKey,
                  name: bucketDetails.bucketKey,
                  id: bucketDetails.bucketKey,
                  details: bucketDetails,
                  type: 'oss.bucket',
                  group: true
                }

                addChildCallback(bucketNode)

                bucketNode.collapse()
              })
          })
        })

        break

      case 'oss.bucket':

        this.extension.ossAPI.getObjects(node.bucketKey).then((response) => {

          response.items.forEach((objectDetails) => {

            this.extension.ossAPI.getObjectDetails(
              node.bucketKey, objectDetails.objectKey).then((objectDetails) => {

                let objectNode = {
                  id: node.bucketKey + '-' + objectDetails.objectKey,
                  objectKey: objectDetails.objectKey,
                  name: objectDetails.objectKey,
                  bucketKey: node.bucketKey,
                  details: objectDetails,
                  type: 'oss.object',
                  group: false
                }

                addChildCallback(objectNode)
              })
          })
        })

        break
    }
  }
}






