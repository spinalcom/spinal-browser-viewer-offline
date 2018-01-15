
// var viewerApp;
// var viewables;
// var indexViewable = 0;

// var viewerConfig = {
//     accessToken : 'eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJCRVBEbTl6ZktxeUF1dmFoWnh0SFhTbGo2UzhwMlJCUSIsImV4cCI6MTUxMzg2NDc2NCwic2NvcGUiOlsiZGF0YTp3cml0ZSIsImRhdGE6cmVhZCIsImJ1Y2tldDpyZWFkIiwiYnVja2V0OnVwZGF0ZSIsImJ1Y2tldDpjcmVhdGUiXSwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2p3dGV4cDYwIiwianRpIjoiT0p4NzlXYlVXdGwxTnZCWHNNa0tGUjZZVUo3NXpOMDA3ZjJZSFdaanczM0dmZGU1Tzh3dEcyc0MwZVBtZ3hRViJ9.rTXNKzOuTO-auRMu6xgCePFRJpRGLANSDokRc4j55uA',
//     documentId : 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bXl0ZXN0YnVja2V0YmVwZG05emZrcXlhdXZhaHp4dGh4c2xqNnM4cDJyYnEvdGVzdC5ydnQ'
// }

// var config3d = {
//     extensions: ['PanelExtension',"Autodesk.ADN.Viewing.Extension.Color"]
// }

// var options = {
//     env: 'AutodeskProduction',
//     getAccessToken: function(onGetAccessToken) {
//         var accessToken = viewerConfig.accessToken;
//         var expireTimeSeconds = 60 * 30;
//         onGetAccessToken(accessToken, expireTimeSeconds);
       
//     }
// };


// var documentId = viewerConfig.documentId;

// Autodesk.Viewing.Initializer(options, function onInitialized(){
//     viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
//     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config3d);
//     viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
// });

// function onDocumentLoadSuccess(doc) {
//     viewables = viewerApp.bubble.search({'type':'geometry'});
//     if (viewables.length === 0) {
//         console.error('Document contains no viewables.');
//         return;
//     }
//     viewerApp.selectItem(viewables[viewables.length - 1].data, onItemLoadSuccess, onItemLoadFail);
// }
    

// function onDocumentLoadFailure(viewerErrorCode) {
//     console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
// }


// function onItemLoadSuccess(viewer, item) {
//     console.log('Viewers are equal: ' + (viewer === viewerApp.getCurrentViewer()));
// }


// function onItemLoadFail(errorCode) {
//     console.error('onItemLoadFail() - errorCode:' + errorCode);
// }


