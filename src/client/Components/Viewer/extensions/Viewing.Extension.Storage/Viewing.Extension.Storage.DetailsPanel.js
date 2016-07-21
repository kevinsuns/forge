/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import ToolPanelBase from 'ToolPanelBase/ToolPanelBase'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import './Viewing.Extension.Storage.css'

export default class StorageDetailsPanel extends ToolPanelBase {

  constructor(container, title, pos, details) {

    super(container, title, {
      closable: true,
      movable: true,
      shadow: true
    })

    $(this.container).addClass('storage')
    $(this.container).addClass('details')

    $(this.container).css({
      left: pos.left
    })

    $(`#${this.container.id}-jsonview`).JSONView(details)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    return `

      <div id="${id}-jsonview">
      </div>`
  }
}
