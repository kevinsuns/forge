/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import './Viewing.Extension.A360View.css'
import ToolPanelBase from 'ToolPanelBase'

export default class A360DetailsPanel extends ToolPanelBase {

  constructor(container, title, pos, object) {

    super(container, title, {
      closable: true,
      movable: true,
      shadow: true
    })

    $(this.container).addClass('a360')
    $(this.container).addClass('details')

    $(this.container).css({
      left: pos.left
    })

    $(`#${this.container.id}-jsonview`).JSONView(object)
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
