/////////////////////////////////////////////////////////////////////
// DerivativeExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import DerivativePropertyPanel from './Viewing.Extension.Derivative.PropertyPanel'
import DerivativeAPI from './Viewing.Extension.Derivative.API'
import JobPanel from './Viewing.Extension.Derivative.JobPanel'
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
  async postJob(model) {

    var storageUrn = model.storageUrn

    console.log('Job: ' + storageUrn)

    var jobPanel = new JobPanel(
      this._viewer.container,
      model)

    var job = await this.api.postJob({
      urn: storageUrn,
      outputType: 'svf'
    })

    if(job.result === 'success' || job.result === 'created') {

      await this.api.waitJob(storageUrn, (progress) => {

        jobPanel.updateProgress(progress)
      })

      jobPanel.done()

      var metadataResult = await this.api.getMetadata(storageUrn)

      if(metadataResult.metadata &&
         metadataResult.metadata.length) {

        //Pick firt metadata for now ...
        var metadataElement = metadataResult.metadata[0]

        console.log('Model GUID: ' + metadataElement.guid)

        model.guid = metadataElement.guid
      }
    }
    else {

      jobPanel.jobFailed(job)
    }
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
