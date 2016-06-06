/////////////////////////////////////////////////////////////////////
// DerivativeExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import DerivativePropertyPanel from './Viewing.Extension.Derivative.PropertyPanel'
import DerivativeAPI from './Viewing.Extension.Derivative.API'
import ExtensionBase from 'ExtensionBase'

class DerivativeExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this.api = new DerivativeAPI({
      apiUrl: '/api/derivative'
    })
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Derivative';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.panel = new DerivativePropertyPanel(
      this._viewer, this.api)

    this._viewer.setPropertyPanel(this.panel)

    console.log('Viewing.Extension.Derivative loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._viewer.setPropertyPanel(null)

    console.log('Viewing.Extension.Derivative unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  postJob(urn) {

    console.log('Job: ' + urn)

    this.api.postJob({urn: urn, outputType: 'svf'}).then(async(job) => {

      if(job.result === 'success' || job.result === 'created') {

        await this.api.waitJob(urn, (progress) => {

          console.log('Job Progress: ' + progress)
        })

        console.log('Job Progress: 100%')

        this.api.getMetadata(urn).then(
          (response) => {

            if(response.metadata && response.metadata.length) {

              //Pick firt metadata for now ...
              var metadataElement = response.metadata[0]

              console.log('Model GUID: ' + metadataElement.guid)

              this._viewer.model.guid = metadataElement.guid
            }
        })
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteManifest(urn) {

    this.api.deleteManifest(urn)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  DerivativeExtension.ExtensionId,
  DerivativeExtension);
