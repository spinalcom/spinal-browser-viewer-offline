angular.module("app.spinalforge.plugin").controller("forgeViewerCtrl", [
  "$scope",
  "$rootScope",
  "$mdDialog",
  "authService",
  "$compile",
  "$injector",
  "layout_uid",
  "spinalModelDictionary",
  "spinalRegisterViewerPlugin",
  function(
    $scope,
    $rootScope,
    $mdDialog,
    authService,
    $compile,
    $injector,
    layout_uid,
    spinalModelDictionary,
    spinalRegisterViewerPlugin
  ) {
    $scope.injector = $injector;
    $scope.uid = layout_uid.get();
    $rootScope.allNotes = [];
    // load etc..
    spinalModelDictionary.init().then(function(ForgeFile) {
      var viewerApp, viewables, indexViewable, oViewer;

      var config = {
        inViewerSearchConfig: {
          uiEnabled: true,
          clientId: "dsadsa",
          sessionId: "F969EB70-242F-11E6-BDF4-0800200C9A66",
          loadedModelTab: {
            enabled: true, // If false, the tab is hidden.
            displayName: "This View",
            pageSize: 50
          },
          relatedItemsTab: {
            enabled: true, // If false, the tab is hidden.
            displayName: "This Item",
            pageSize: 20
          }
        }
      };
      spinalRegisterViewerPlugin.register(
        "Autodesk.ADN.Viewing.Extension.Color"
      );
      // var extensions = ['PanelAnnotation', "Autodesk.ADN.Viewing.Extension.Color"];

      var options = {
        env: "Local",
        docid: ""
      };
      var docs = [];

      var documentId = "urn:" + ForgeFile.urn.get();

      docs = ForgeFile._children.get();
      if (docs.length != 0) {
        var path = docs[0].path;
        for (var i = 0; i < docs.length; i++) {
          if (/.+\.svf$/.test(docs[i].path)) {
            path = docs[i].path;
            break;
          }
        }
        path = window.location.origin + path;
        options.docid = path;
      }
      init_autodesk(documentId);

      // get_oAuthToken(ForgeFile, documentId, init_autodesk);

      // function get_oAuthToken(forgeFile, documentId, callback) {
      //   forgeFile.oauth.set("");
      //   forgeFile.ask_token.set(true);
      //   var ask_for_token = true;
      //   var oauth_onchange = function () {
      //     if (ask_for_token && forgeFile.oauth.get() != "") {
      //       ask_for_token = false;
      //       forgeFile.oauth.unbind(oauth_onchange);
      //       options.accessToken = forgeFile.oauth.get();
      //       callback(documentId);
      //     }
      //   };
      //   forgeFile.oauth.bind(oauth_onchange);
      // }

      // function init_autodesk(documentId) {
      //   Autodesk.Viewing.Initializer(options, function onInitialized() {
      //     viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv' + $scope.uid);
      //     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config3d);
      //     viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
      //   });
      // }
      function init_autodesk(documentId) {
        oViewer = new Autodesk.Viewing.Private.GuiViewer3D(
          $("#MyViewerDiv" + $scope.uid)[0],
          config
        ); // With toolbar

        Autodesk.Viewing.Initializer(options, function onInitialized() {
          oViewer.initialize();
          console.log(options.docid);
          oViewer.loadModel(
            options.docid,
            config,
            onItemLoadSuccess,
            onDocumentLoadFailure
          );
          $scope.oviewer = oViewer;
          // for (var i = 0; i < docs.length; i++) {
          //   var r = $('<div><button id="view_' + i + '">' + docs[i].name + '<div><img id="img__' + i + '" src="' + docs[i].path + '.png"></div></button></div>');
          //   $('#list').append(r);
          //   $('#view_' + i).click(function (e) {
          //     e.stopPropagation();
          //     // oViewer.impl.unloadCurrentModel () ; API would be tearDown()/setUp() tearDown() unloads extensions too, so you need
          //     // setUp() after that to load again setUp() requires the viewer configuration again, the one you use to start the
          //     // viewer.
          //     oViewer.tearDown();
          //     oViewer.setUp({
          //       env: 'Local'
          //     });
          //     var i = parseInt(e.target.id.substring(5));
          //     oViewer.loadModel(docs[i].path, config, onItemLoadSuccess, onDocumentLoadFailure);
          //     // oViewer.loadModel(docs[i].path);
          //   });
          // }

          // viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
          // oViewer.registerViewer(oViewer.k3D, Autodesk.Viewing.Private.GuiViewer3D, config);
          // viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
      }

      // function onDocumentLoadSuccess(doc) {
      //   viewables = viewerApp.bubble.search({
      //     'type': 'geometry',
      //     'role': '3d'
      //   });
      //   if (viewables.length === 0) {
      //     console.error('Document contains no viewables.');
      //     return;
      //   }
      //   viewerApp.selectItem(viewables[viewables.length - 1].data, onItemLoadSuccess, onItemLoadFail);
      // }

      function onDocumentLoadFailure(viewerErrorCode) {
        console.error("onDocumentLoadFailure() - errorCode:" + viewerErrorCode);
      }

      function onItemLoadSuccess(viewer, item) {
        viewer.scope = $scope;
        // console.log('Viewers are equal: ' + (viewer === viewerApp.getCurrentViewer()));
        oViewer.addEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          function onGeometryLoadEvent() {
            oViewer.removeEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
              onGeometryLoadEvent
            );
            let extensions = spinalRegisterViewerPlugin.get();
            for (var i = 0; i < extensions.length; i++) {
              oViewer.loadExtension(extensions[i], options);
            }
            // var spinalExtension = oViewer.getExtension("SpinalCom.Forge.Extension");
            // if (typeof spinalExtension != 'undefined')
            //   spinalExtension.mainPanel.setBuilding(Building);
          }
        );
      }

      // function onItemLoadFail(errorCode) {
      //   console.error('onItemLoadFail() - errorCode:' + errorCode);
      // }
    });
  }
]);
