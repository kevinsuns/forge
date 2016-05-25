/////////////////////////////////////////////////////////////////////
//
//
//
/////////////////////////////////////////////////////////////////////
import './Viewing.Extension.ModelTransformer.css'
import ToolPanelBase from 'ToolPanelBase'
import Dropdown from 'Dropdown'

export default class ModelTransformerPanel extends ToolPanelBase {

  constructor(container, btnElement) {

    super(container, 'Transform Models', {
      buttonElement: btnElement,
      shadow: true
    });

    $(this.container).addClass('model-transformer');

    this.dropdown = new Dropdown({
      container: '#' + this.dropdownContainerId,
      title: 'Select Model',
      prompt: 'Select Model ...',
      pos: {
        top: 0, left: 0
      }
    });

    this.dropdown.on('item.selected', (item) => {

      this.currentModel = item

      this.emit('model.selected', item)
    })

    $(`#${this.container.id}-apply-btn`).click(() => {

      this.emit('model.transform', {

        model: this.currentModel,

        transform: {
          translation: this.getTranslation(),
          rotation: this.getRotation(),
          scale: this.getScale()
        }
      })
    })
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

          <button class="btn btn-info btn-apply"
                  id="${id}-apply-btn">
            <span class="glyphicon glyphicon-remove btn-span"
                  aria-hidden="true">
            </span>
             Apply Transform
          </button>

      </div>`;
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

    var euler = new THREE.Euler(
      x * Math.PI/180,
      y * Math.PI/180,
      z * Math.PI/180,
      'XYZ');

    var q = new THREE.Quaternion();

    q.setFromEuler(euler);

    return q;
  }
}