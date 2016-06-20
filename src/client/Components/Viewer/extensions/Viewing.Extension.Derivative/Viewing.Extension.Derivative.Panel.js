/////////////////////////////////////////////////////////////////////
// Viewing.Extension.SceneManager.Panel
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import {Formats} from './Viewing.Extension.Derivative.Constants'
import './Viewing.Extension.Derivative.css'
import ToolPanelBase from 'ToolPanelBase'

export default class DerivativePanel extends ToolPanelBase{

  constructor(extension, params) {

    super(extension._viewer.container,
      'Derivatives', {
      closable: true,
      movable: true,
      shadow: true
    })

    $(this.container).addClass('derivative')
    $(this.container).addClass('derivative-panel')

    this.extension = extension

    this.params = params

    this.loadTree($(`#${this.treeContainerId}`)[0])
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    this.treeContainerId = ToolPanelBase.guid()

    return `

      <div class="container">

         <div id="${this.treeContainerId}" class="tree-container">
        </div>

      </div>`
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadTree(container) {

    var delegate = new DerivativesTreeDelegate(
      this.extension,
      this.params)

    var rootNode = {
      name: this.params.name,
      type: 'root',
      group: true
    }

    new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, container, {
        excludeRoot: false,
        localize: true
      })
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class DerivativesTreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (extension, params) {

    super()

    this.extension = extension

    this.params = params
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeId (node) {

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

    switch(node.type) {

      case 'objects':
      case 'objects.leaf':

        this.properties.forEach((entry) => {

          if(entry.objectid === node.id) {

            var nodeProperties = []

            for(var key in entry.properties) {

              var propertyValue = entry.properties[key]

              propertyValue = Array.isArray(propertyValue) ?
                propertyValue[0] :
                propertyValue

              if(typeof propertyValue === 'object') {

                for(var subKey in propertyValue) {

                  var subPropertyValue = propertyValue[subKey]

                  subPropertyValue = Array.isArray(subPropertyValue) ?
                    subPropertyValue[0] :
                    subPropertyValue

                  nodeProperties.push({
                    displayValue: subPropertyValue,
                    displayCategory: key,
                    displayName: subKey,
                    hidden: 0,
                    type: 20,
                    units: null
                  })
                }
              }
              else {

                nodeProperties.push({
                  displayValue: propertyValue,
                  displayCategory: "Other",
                  displayName: key,
                  hidden: 0,
                  type: 20,
                  units: null
                })
              }
            }

            var propertyPanel = new DerivativesPropertyPanel(
              this.extension._viewer.container,
              node.name + ' Properties',
              nodeProperties)

            propertyPanel.setVisible(true)
          }
        })

        break

      case 'exports.iges':
      case 'exports.step':
      case 'exports.stl':
      case 'exports.obj':


        break
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getTreeNodeLabel(node) {

    return node.name
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    node.type.split('.').forEach((cls) => {

      parent.classList.add(cls)
    })

    var label = document.createElement('label');

    parent.appendChild(label);

    var text = this.getTreeNodeLabel(node);

    if (options && options.localize) {

      label.setAttribute('data-i18n', text);
      text = Autodesk.Viewing.i18n.translate(text);
    }

    label.textContent = text;

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    node.isCollapsed = () => {
      return $(parent).parent().hasClass('collapsed')
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTreeNodeIconClick (tree, node, event) {

    node.isCollapsed() ?
      node.expand():
      node.collapse()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async forEachChild (node, addChildCallback) {

    switch(node.type) {

      case 'root':

        try {

          var exportsNode = {
            name: 'Exports',
            type: 'exports',
            group: true
          }

          addChildCallback(exportsNode)

          exportsNode.collapse()

          var manifest = await this.extension.api.getManifest(
            this.params.urn)

          var metadata = await this.extension.api.getMetadata(
            this.params.urn)

          if (metadata.metadata && metadata.metadata.length) {

            var guid = metadata.metadata[0].guid

            var hierarchy = await this.extension.api.getHierarchy(
              this.params.urn, guid)

            var hierarchyNode = {
              objects: hierarchy.objects,
              name: 'Hierarchy',
              type: 'objects',
              group: true
            }

            this.extension.api.getProperties(
              this.params.urn, guid).then((properties) => {

                this.properties = properties.collection
              })

            addChildCallback(hierarchyNode)

            hierarchyNode.collapse()
          }
        }
        catch(ex) {

          console.log(ex)
        }

        break

      case 'exports':

        var fileType = this.params.name.split(".").pop(-1)

        if(Formats.iges.indexOf(fileType) > -1) {

          var igesNode = {
            name: 'IGES',
            type: 'exports.iges',
            group: true
          }

          addChildCallback(igesNode)

          this.extension.api.getDerivativeURN({
            outputType: 'iges'

          }).then((derivativeResult) => {

            console.log(derivativeResult)
          })
        }

        if(Formats.step.indexOf(fileType) > -1) {

          var stepNode = {
            name: 'STEP',
            type: 'exports.step',
            group: true
          }

          addChildCallback(stepNode)
        }

        if(Formats.stl.indexOf(fileType) > -1) {

          var stlNode = {
            name: 'STL',
            type: 'exports.stl',
            group: true
          }

          addChildCallback(stlNode)
        }

        var objNode = {
          name: 'OBJ',
          type: 'exports.obj',
          group: true
        }

        addChildCallback(objNode)

        break

      case 'objects':

        if(node.objects) {

          node.objects.forEach((object) => {

            var objectNode = {
              objects: object.objects,
              id: object.objectid,
              name: object.name,
              type: 'objects',
              group: true
            }

            if(!object.objects) {
              objectNode.type += '.leaf'
            }

            addChildCallback(objectNode)

            objectNode.collapse()
          })
        }

        break
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class DerivativesPropertyPanel extends Autodesk.Viewing.UI.PropertyPanel {

  constructor(container, title, properties) {

    super(container, ToolPanelBase.guid(), title)

    this.setProperties(properties);
  }

  /////////////////////////////////////////////////////////////
  // initialize override
  //
  /////////////////////////////////////////////////////////////
  initialize() {

    super.initialize()

    this.container.classList.add('derivative')
  }

  /////////////////////////////////////////////////////////////
  // createTitleBar override
  //
  /////////////////////////////////////////////////////////////
  createTitleBar (title) {

    var titleBar = document.createElement("div")

    titleBar.className = "dockingPanelTitle"

    this.titleTextId = ToolPanelBase.guid()

    this.titleImgId = ToolPanelBase.guid()

    var html = `
      <img id="${this.titleImgId}"></img>
      <div id="${this.titleTextId}" class="dockingPanelTitleText">
        ${title}
      </div>
    `

    $(titleBar).append(html)

    this.addEventListener(titleBar, 'click', (event)=> {

      if (!this.movedSinceLastClick) {

        this.onTitleClick(event)
      }

      this.movedSinceLastClick = false
    })

    this.addEventListener(titleBar, 'dblclick', (event) => {

      this.onTitleDoubleClick(event)
    })

    return titleBar
  }

  /////////////////////////////////////////////////////////////
  // setTitle override
  //
  /////////////////////////////////////////////////////////////
  setTitle (text, options) {

    if (options && options.localizeTitle) {

      $(`#${this.titleTextId}`).attr('data-i18n', text)

      text = Autodesk.Viewing.i18n.translate(text)

    } else {

      $(`#${this.titleTextId}`).removeAttr('data-i18n')
    }

    $(`#${this.titleTextId}`).text(text)
  }
}

