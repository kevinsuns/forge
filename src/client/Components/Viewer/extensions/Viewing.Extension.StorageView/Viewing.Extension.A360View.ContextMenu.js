
import { EventsEmitterComposer } from 'EventsEmitter'

export default class A360ViewContextMenu extends
  EventsEmitterComposer (Autodesk.Viewing.UI.ObjectContextMenu) {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super(viewer)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  buildMenu (event, node) {

    var menu = []

    switch(node.type) {

      case 'projects':

        menu.push({
          title: 'Show project details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Project Details'
            })
          }
        })

        break

      case 'folders':

        menu.push({
          title: 'Show folder details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Folder Details'
            })
          }
        })

        break

      case 'items':

        menu.push({
          title: 'Show item details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Item Details'
            })
          }
        })

        break

      case 'oss.root':

        menu.push({
          title: 'Create Bucket',
          target: () => {
            this.emit('context.oss.createBucket', {
              event,
              node
            })
          }
        })

        break
    }

    return menu
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  show (event, node) {

    var menu = this.buildMenu(event, node)

    if (menu && 0 < menu.length) {

      this.contextMenu.show(event, menu);
    }
  }
}