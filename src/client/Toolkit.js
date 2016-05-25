

export default class Toolkit {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static loadDocument(urn, tokenUrl) {

    var promise = new Promise((resolve, reject)=> {

      try{

        var tokenFunc = ()=>{
          return getTokenSync(tokenUrl);
        }

        var options = {
          env: 'AutodeskProduction',
          refreshToken: tokenFunc,
          getAccessToken: tokenFunc
        };

        Autodesk.Viewing.Initializer (options, ()=> {

          Autodesk.Viewing.Document.load(
            (urn.indexOf('urn:') == 0 ? '' : 'urn:') + urn,
            (LMVDocument)=> {

              return resolve(LMVDocument);
            });
        });
      }
      catch (ex){

        return reject('ex');
      }
    });

    return promise;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  static getViewablePath(LMVDocument) {

    var viewablePath = [];

    var rootItem = LMVDocument.getRootItem();

    var path3d = Autodesk.Viewing.Document.getSubItemsWithProperties(
      rootItem,
      { 'type': 'geometry', 'role': '3d' },
      true);

    path3d.forEach(function(path){
      viewablePath.push({
        type: '3d',
        name : path.name,
        path: LMVDocument.getViewablePath(path)
      });
    });

    var path2d = Autodesk.Viewing.Document.getSubItemsWithProperties(
      rootItem,
      { 'type': 'geometry', 'role': '2d' },
      true);

    path2d.forEach(function(path){
      viewablePath.push({
        type: '2d',
        name : path.name,
        path: LMVDocument.getViewablePath(path)
      });
    });

    return viewablePath;
  }
}

///////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////
function getTokenSync(url) {

  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, false);
  xhr.send(null);

  if(xhr.status != 200) {

    console.log('xrh error: ');
    console.log(xhr.statusText + ':' + xhr.status);
    return '';
  }

  var response = JSON.parse(
    xhr.responseText);

  return response.access_token;
}