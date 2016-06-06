/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Derivative.JobPanel
// by Philippe Leefsma, June 2016
//
/////////////////////////////////////////////////////////////////////
import './Viewing.Extension.Derivative.css'
import ToolPanelBase from 'ToolPanelBase'

export default class JobPanel extends ToolPanelBase {

  constructor(container, model) {

    super(container, 'Processing Derivatives ...', {
      movable: false,
      closable: false
    })

    this.model = model

    $(this.container).addClass('derivative')
    $(this.container).addClass('job')

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle').prepend('<img/>')

    $(`#${this.container.id}-model-name`).text(
      'Model: ' + model.name)

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

        <div id=${id}-model-name>
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

    console.log('Job Progress: ' + progress)

    $(`#${this.container.id}-job-progress`).text(
      'Job Progress: ' + progress)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  jobFailed (job) {

    console.log('Job Failed! ')
    console.log(job)

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
}