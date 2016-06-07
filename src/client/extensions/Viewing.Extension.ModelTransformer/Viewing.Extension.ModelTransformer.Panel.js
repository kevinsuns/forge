/////////////////////////////////////////////////////////////////////
//
//
//
/////////////////////////////////////////////////////////////////////
import TransformTool from './Viewing.Extension.ModelTransformer.Tool'
import './Viewing.Extension.ModelTransformer.css'
import ToolPanelBase from 'ToolPanelBase'
import Dropdown from 'Dropdown'

export default class ModelTransformerPanel extends ToolPanelBase {

  constructor(viewer, btnElement) {

    super(viewer.container, 'Transform Models', {
      buttonElement: btnElement
    })

    $(this.container).addClass('model-transformer')

    this.dropdown = new Dropdown({
      container: '#' + this.dropdownContainerId,
      title: 'Select Model',
      prompt: 'Select Model ...',
      pos: {
        top: 0, left: 0
      }
    })

    this.dropdown.on('item.selected', (model) => {

      this.currentModel = model

      if(model) {

        this.setTransform(model.transform)

        this.emit('model.selected', {
          fitToView: true,
          model
        })
      }
    })

    $(`#${this.container.id}-apply-btn`).click(() => {

      this.tool.clearSelection()

      if (this.currentModel) {

        this.emit('model.transform', {

          model: this.currentModel,

          transform: {
            translation: this.getTranslation(),
            rotation: this.getRotation(),
            scale: this.getScale()
          }
        })
      }
    })

    $(`#${this.container.id}-delete-btn`).click(() => {

      if(this.currentModel) {

        this.emit('model.delete', {

          model: this.currentModel
        })

        this.dropdown.removeCurrentItem(
          'Select Model ...')
      }
    })

    this.viewer = viewer

    this.tool = new TransformTool(viewer)

    this.viewer.toolController.registerTool(this.tool)

    this.tool.on('transform.TxChange', (data)=>{

      this.setTranslation(
        data.model.transform.translation)
    })

    this.tool.on('transform.modelSelected', (model)=>{

      this.dropdown.setCurrentItem(model)

      this.setTransform(model.transform)

      this.emit('model.selected', {
        fitToView: false,
        model
      })
    })

    this.on('open', () => {

      this.viewer.toolController.activateTool(
        this.tool.getName())
    })

    this.on('close', () => {

      this.viewer.toolController.deactivateTool(
        this.tool.getName())
    })

    $('.model-transformer .scale').on(
      'change keyup input paste', ()=>{

        if(this.currentModel){

          this.currentModel.transform.scale =
            this.getScale()
        }
      })

    $('.model-transformer .trans').on(
      'change keyup input paste', ()=>{

        if(this.currentModel){

          this.currentModel.transform.translation =
            this.getTranslation()
        }
    })

    $('.model-transformer .rot').on(
      'change keyup input paste', ()=>{

        if(this.currentModel) {

          this.currentModel.transform.rotation =
            this.getRotation()
        }
    })

    $(`#${this.container.id}-Sx`).on('change keyup', () => {

      var scale = $(`#${this.container.id}-Sx`).val()

      $(`#${this.container.id}-Sy`).val(scale)
      $(`#${this.container.id}-Sz`).val(scale)
    })

    $(`#${this.container.id}`).find(
      '.dockingPanelTitle').prepend('<img/>')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    this.dropdownContainerId = ToolPanelBase.guid()

    return `

      <div class="container">

        <div id="${this.dropdownContainerId}">
        </div>

        <hr class="v-spacer">

        <div>
          <span class="text-span">
            Scale:
          </span>

          <hr class="v-spacer">

          <input id="${id}-Sx" type="text"
            class="input numeric"
            placeholder="  x (1.0)">

          <input id="${id}-Sy" type="text"
            class="input numeric"
            placeholder="  y (1.0)">

          <input id="${id}-Sz" type="text"
            class="input numeric"
            placeholder="  z (1.0)">

          <hr class="v-spacer">

          <span class="text-span">
            Translation:
          </span>

          <hr class="v-spacer">

          <input id="${id}-Tx" type="text"
            class="input numeric"
            placeholder="  x (0.0)">

          <input id="${id}-Ty" type="text"
            class="input numeric"
            placeholder="  y (0.0)">

          <input id="${id}-Tz" type="text"
            class="input numeric"
            placeholder="  z (0.0)">

          <hr class="v-spacer">

          <span class="text-span">
            Rotation (deg):
          </span>

          <hr class="v-spacer">

          <input id="${id}-Rx" type="text"
            class="input numeric"
            placeholder="  x (0.0)">

          <input id="${id}-Ry" type="text"
            class="input numeric"
            placeholder="  y (0.0)">

          <input id="${id}-Rz" type="text"
            class="input numeric"
            placeholder="  z (0.0)">

          <hr class="v-spacer-large">

        </div>

        <div style="margin-top:8px;">

          <button class="btn btn-info"
                  id="${id}-apply-btn">
            <span class="glyphicon glyphicon-ok btn-span"
                  aria-hidden="true">
            </span>
             Apply Transform
          </button>

          <hr class="v-spacer-large">

          <button class="btn btn-danger"
                  id="${id}-delete-btn">
            <span class="glyphicon glyphicon-remove btn-span"
                  aria-hidden="true">
            </span>
             Delete Model
          </button>
        </div>

      </div>`;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setTransform (transform) {

    $(`#${this.container.id}-Tx`).val(transform.translation.x.toFixed(2))
    $(`#${this.container.id}-Ty`).val(transform.translation.y.toFixed(2))
    $(`#${this.container.id}-Tz`).val(transform.translation.z.toFixed(2))

    $(`#${this.container.id}-Rx`).val(transform.rotation.x)
    $(`#${this.container.id}-Ry`).val(transform.rotation.y)
    $(`#${this.container.id}-Rz`).val(transform.rotation.z)

    $(`#${this.container.id}-Sx`).val(transform.scale.x)
    $(`#${this.container.id}-Sy`).val(transform.scale.y)
    $(`#${this.container.id}-Sz`).val(transform.scale.z)
  }

  /////////////////////////////////////////////////////////////
  // Gets input transform
  //
  /////////////////////////////////////////////////////////////
  getScale() {

    var x = parseFloat($(`#${this.container.id}-Sx`).val());
    var y = parseFloat($(`#${this.container.id}-Sy`).val());
    var z = parseFloat($(`#${this.container.id}-Sz`).val());

    x = isNaN(x) ? 1.0 : x;
    y = isNaN(y) ? 1.0 : y;
    z = isNaN(z) ? 1.0 : z;

    return new THREE.Vector3(x, y, z);
  }

  getTranslation() {

    var x = parseFloat($(`#${this.container.id}-Tx`).val());
    var y = parseFloat($(`#${this.container.id}-Ty`).val());
    var z = parseFloat($(`#${this.container.id}-Tz`).val());

    x = isNaN(x) ? 0.0 : x;
    y = isNaN(y) ? 0.0 : y;
    z = isNaN(z) ? 0.0 : z;

    return new THREE.Vector3(x, y, z);
  }

  getRotation() {

    var x = parseFloat($(`#${this.container.id}-Rx`).val());
    var y = parseFloat($(`#${this.container.id}-Ry`).val());
    var z = parseFloat($(`#${this.container.id}-Rz`).val());

    x = isNaN(x) ? 0.0 : x;
    y = isNaN(y) ? 0.0 : y;
    z = isNaN(z) ? 0.0 : z;

    return new THREE.Vector3(x, y, z);
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setTranslation(translation){

    $(`#${this.container.id}-Tx`).val(translation.x.toFixed(2));
    $(`#${this.container.id}-Ty`).val(translation.y.toFixed(2));
    $(`#${this.container.id}-Tz`).val(translation.z.toFixed(2));
  }
}