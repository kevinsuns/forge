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
        </div>

        <hr class="v-spacer">

        <div>
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

      </div>`;
  }
}