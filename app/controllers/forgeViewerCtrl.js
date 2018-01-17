angular.module('app.spinalforge.plugin')
  .controller('forgeViewerCtrl', ["$scope", "$rootScope", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary",
    function ($scope, $rootScope, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary) {
      $scope.injector = $injector;
      $scope.uid = layout_uid.get();
      spinalModelDictionary.init().then(function (ForgeFile) {
        var viewerApp, viewables, indexViewable;
        var viewerConfig = {
          accessToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJCRVBEbTl6ZktxeUF1dmFoWnh0SFhTbGo2UzhwMlJCUSIsImV4cCI6MTUxMzk2MjA1OSwic2NvcGUiOlsiZGF0YTp3cml0ZSIsImRhdGE6cmVhZCIsImJ1Y2tldDpyZWFkIiwiYnVja2V0OnVwZGF0ZSIsImJ1Y2tldDpjcmVhdGUiXSwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2p3dGV4cDYwIiwianRpIjoicGpVRnhIN2JlRjFBamk2WjlLaWZzWm5rZjlCUmUzVEdSNzNzYTcwWGRxS3BDRERiTmhXZ3pNSHlyQ3VmYzU1RiJ9.b4o7UaOiBvVViIKm2LcvchoYa8Btpe_I-iQIPzX8Rnk',
          documentId: 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bXl0ZXN0YnVja2V0YmVwZG05emZrcXlhdXZhaHp4dGh4c2xqNnM4cDJyYnEvdGVzdC5ydnQ'
        };

        var config3d = {
          extensions: ['PannelAnnotation', "Autodesk.ADN.Viewing.Extension.Color"]
        };
        var options = {
          env: 'AutodeskProduction',
          accessToken: ''
        };

        var documentId = 'urn:' + ForgeFile.urn.get();
        get_oAuthToken(ForgeFile, documentId, init_autodesk);

        function get_oAuthToken(forgeFile, documentId, callback) {
          forgeFile.oauth.set("");
          forgeFile.ask_token.set(true);
          var ask_for_token = true;
          var oauth_onchange = function () {
            if (ask_for_token && forgeFile.oauth.get() != "") {
              ask_for_token = false;
              forgeFile.oauth.unbind(oauth_onchange);
              options.accessToken = forgeFile.oauth.get();
              callback(documentId);
            }
          };
          forgeFile.oauth.bind(oauth_onchange);
        }

        function init_autodesk(documentId) {
          Autodesk.Viewing.Initializer(options, function onInitialized() {
            viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv' + $scope.uid);
            viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config3d);
            viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
          });
        }


        function onDocumentLoadSuccess(doc) {
          viewables = viewerApp.bubble.search({
            'type': 'geometry',
            'role': '3d'
          });
          if (viewables.length === 0) {
            console.error('Document contains no viewables.');
            return;
          }
          viewerApp.selectItem(viewables[viewables.length - 1].data, onItemLoadSuccess, onItemLoadFail);
        }


        function onDocumentLoadFailure(viewerErrorCode) {
          console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
        }


        function onItemLoadSuccess(viewer, item) {
          console.log('Viewers are equal: ' + (viewer === viewerApp.getCurrentViewer()));
        }


        function onItemLoadFail(errorCode) {
          console.error('onItemLoadFail() - errorCode:' + errorCode);
        }

      });


    }
  ]);