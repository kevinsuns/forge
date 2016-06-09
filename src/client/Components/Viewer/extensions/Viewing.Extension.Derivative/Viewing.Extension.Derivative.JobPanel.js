/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Derivative.JobPanel
// by Philippe Leefsma, June 2016
//
/////////////////////////////////////////////////////////////////////
import './Viewing.Extension.Derivative.css'
import ToolPanelBase from 'ToolPanelBase'

export default class JobPanel extends ToolPanelBase {

  constructor(container, version) {

    super(container, 'Processing Derivatives ...', {
      movable: true,
      closable: false
    })

    this.version = version

    $(this.container).addClass('derivative')
    $(this.container).addClass('job')

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle').prepend('<img/>')

    $(`#${this.container.id}-name`).text(
      'Design: ' + version.attributes.displayName)

    var angle = 0

    this.intervalId = setInterval(() => {

      angle += 2
      angle %= 360

      $(`#${this.container.id}`).find(
        '.dockingPanelTitle img').css({
          transform: `rotateZ(${angle}deg)`
        })
    }, 10)

    this.setVisible(true)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    return `

      <div class="container">

        <div id=${id}-name>
        </div>

        <div id=${id}-job-progress>
        </div>

      </div>
      `
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateProgress (progress) {

    $(`#${this.container.id}-job-progress`).text(
      'Job Progress: ' + progress)

    return this._isVisible
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  jobFailed (job) {

    console.log('Job Failed! ')
    console.log(job)

    $(`#${this.container.id}-job-progress`).text(
      'Job failed :(')

    clearInterval(this.intervalId)

    setTimeout(() => {
      this.setVisible(false)
    }, 5000)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  done () {

    this.updateProgress('100%')

    clearInterval(this.intervalId)

    setTimeout(() => {
      this.setVisible(false)
    }, 5000)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTitleDoubleClick(event) {

    clearInterval(this.intervalId)

    this.setVisible(false)
  }
}