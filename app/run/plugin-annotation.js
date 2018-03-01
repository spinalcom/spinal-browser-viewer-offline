let appSpinalforgePlugin = angular.module('app.spinalforge.plugin');
appSpinalforgePlugin.run(["$rootScope", "$compile", "$templateCache", "$http", "spinalRegisterViewerPlugin",
    function ($rootScope, $compile, $templateCache, $http, spinalRegisterViewerPlugin) {
      spinalRegisterViewerPlugin.register("PannelAnnotation");
      // var extensions = ['PannelAnnotation', "Autodesk.ADN.Viewing.Extension.Color"];

      let load_template = (uri, name) => {
        $http.get(uri).then((response) => {
          $templateCache.put(name, response.data);
        }, (errorResponse) => {
          console.log('Cannot load the file ' + uri);
        });
      };
      let toload = [{
        uri: 'app/templates/annotationTemplate.html',
        name: 'annotationTemplate.html'
      }];
      for (var i = 0; i < toload.length; i++) {
        load_template(toload[i].uri, toload[i].name);
      }


      class PannelAnnotation {
        constructor(viewer, options) {
          Autodesk.Viewing.Extension.call(this, viewer, options);
          this.viewer = viewer;
          this.panel = null;
        }

        load() {
          if (this.viewer.toolbar) {
            this.createUI();
          } else {
            this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
            this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
          }
          return true;
        }

        onToolbarCreated() {
          this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
          this.onToolbarCreatedBinded = null;
          this.createUI();
        }

        unload() {
          this.viewer.toolbar.removeControl(this.subToolbar);
          return true;
        }

        createUI() {
          var title = 'Annotation';
          this.panel = new PanelClass(this.viewer, title);
          var button1 = new Autodesk.Viewing.UI.Button('Annotation');

          button1.onClick = (e) => {
            if (!this.panel.isVisible()) {
              this.panel.setVisible(true);
            } else {
              this.panel.setVisible(false);
            }
          };

          button1.addClass('fa');
          button1.addClass('fa-pencil');
          button1.addClass('fa-2x');
          button1.setToolTip('Annotation');

          this.subToolbar = this.viewer.toolbar.getControl("my-Annotation");
          if (!this.subToolbar) {
            this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-Annotation');
            this.viewer.toolbar.addControl(this.subToolbar);
          }
          this.subToolbar.addControl(button1);
          this.initialize();
        }

        initialize() {
          var _container = document.createElement('div');
          _container.style.height = "calc(100% - 45px)";
          _container.style.overflowY = 'auto';
          this.panel.container.appendChild(_container);

          $(_container).html("<div ng-controller=\"annotationCtrl\" ng-cloak>" +
            $templateCache.get("annotationTemplate.html") + "</div>");
          $compile($(_container).contents())($rootScope);
        }
      } // end class
      Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
    } // end run
  ])
  .controller('annotationCtrl', ["$scope", "$rootScope", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q",
    function ($scope, $rootScope, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q) {
      $scope.headerBtnClick = (btn) => {
        console.log("headerBtnClick");
        console.log(btn);
      };
      $scope.headerBtn = [{
          label: "add note",
          icon: "note_add"
        },
        {
          label: "visibility",
          icon: "visibility",
          toggleIcon: ""
        },
        {
          label: "visibility cancel",
          icon: "visibility_off"
        },
      ];
      $scope.currentVisibleObj = [];

      // {
      // id: '',
      // title: '',
      // color: '',
      // owner: '',
      // username : '',
      // date: Date.now(),
      // allObject: [],
      // notes : [],
      // view : false,
      // files : new Directory()
      // }
      $scope.notes = [];
      spinalModelDictionary.init().then((m) => {
        if (m) {
          if (m.annotationPlugin) {
            m.annotationPlugin.load((mod) => {
              $scope.noteListModel = mod;
              $scope.noteListModel.bind($scope.onModelChange);
            });
          } else {
            $scope.noteListModel = new Lst();
            m.add_attr({
              annotationPlugin: new Ptr($scope.noteListModel)
            });
            $scope.noteListModel.bind($scope.onModelChange);
          }
        }
      });

      function deferObjRdy(model, promise) {
        if (FileSystem._tmp_objects[model._server_id]) {
          setTimeout(() => {
            deferObjChange(model, promise);
          }, 200);
          return;
        }
        promise.resolve(model);
      }

      $scope.waitObjRdy = (model) => {
        let deferred = $q.defer();
        deferObjRdy(model, deferred);
        return deferred.promise;
      };

      $scope.onModelChange = () => {
        $scope.notes = [];
        let promiseLst = [];
        for (var i = 0; i < $scope.noteListModel.length; i++) {
          let note = $scope.noteListModel[i];
          promiseLst.push($scope.waitObjRdy(note));
        }
        $q.all(promiseLst).then((res) => {
          $scope.notes = [];
          for (var i = 0; i < $scope.noteListModel.length; i++) {
            let note = $scope.noteListModel[i];
            let mod = note.get();
            mod._server_id = note._server_id;
            $scope.notes.push(mod);
            if ($scope.selectedNote && $scope.selectedNote._server_id == mod._server_id) {
              $scope.selectedNote = mod;
            }
            console.log($scope.oviewer);
            // $scope.$apply();

            // chcck if aplly color
          }
        });
      };

      $scope.$on('colorpicker-closed', function () {
        // update moedels via $scope.notes
        for (var i = 0; i < $scope.notes.length; i++) {
          let note = $scope.notes[i];
          let mod = FileSystem._objects[note._server_id];
          if (mod && mod.color.get() !== note.color) {
            mod.color.set(note.color);
          }
        }
      });

      $scope.selectedNote = null;
      $scope.selectedStyle = (note) => {
        return note === $scope.selectedNote ? "background-color: #4185f4" : '';
      };
      $scope.getViewIcon = (note) => {
        return note.view ? "visibility" : "visibility_off";
      };

      $scope.selectNote = (note) => {
        $scope.selectedNote = note;
      };
      $scope.renameNote = (note) => {
        $mdDialog.show($mdDialog.prompt()
            .title("Rename Note")
            .placeholder('Please enter the title')
            .ariaLabel('Rename Note')
            .clickOutsideToClose(true)
            .required(true)
            .ok('Confirm').cancel('Cancel'))
          .then(function (result) {
            let mod = FileSystem._objects[note._server_id];
            if (mod) {
              mod.title.set(result);
            }
          }, () => {});
      };
      $scope.toggleViewNote = (note) => {
        note.view = !note.view;
      };
      $scope.addModelInNote = (note) => {

      };
      $scope.deleteNote = (note) => {

      };
      $scope.chatNote = (note) => {

      };








      // changeItemColor(id) {
      //   var ids = [];
      //   var selected;
      //   var notes = this.model;
      //   for (var i = 0; i < notes.length; i++) {
      //     if (notes[i].id == id) {
      //       selected = notes[i];
      //       for (var j = 0; j < selected.allObject.length; j++) {

      //         ids.push(selected.allObject[j].dbId.get());
      //       }
      //     }
      //   }
      //   this.viewer.setColorMaterial(ids, selected.color.get(), selected.id.get());
      // }

      // restoreColor(id) {
      //   var ids = [];
      //   var selected;
      //   var notes = this.model;
      //   for (var i = 0; i < notes.length; i++) {
      //     if (notes[i].id == id) {
      //       selected = notes[i];
      //       for (var j = 0; j < selected.allObject.length; j++) {
      //         ids.push(selected.allObject[j].dbId.get());
      //       }
      //     }
      //   }
      //   this.viewer.restoreColorMaterial(ids, id);
      // }

      // changeAllItemsColor() {
      //   var objects = [];
      //   var notes = this.model;
      //   for (var i = 0; i < notes.length; i++) {
      //     var ids = [];
      //     var color;
      //     for (var j = 0; j < notes[i].allObject.length; j++) {
      //       ids.push(notes[i].allObject[j].dbId.get());
      //     }
      //     color = notes[i].color.get();
      //     objects.push({
      //       ids: ids,
      //       color: color,
      //       id: notes[i].id
      //     });
      //   }
      //   this.viewer.colorAllMaterials(objects);
      // }

      // restoreAllItemsColor() {
      //   var objects = [];
      //   var notes = this.model;
      //   for (var i = 0; i < notes.length; i++) {
      //     var ids = [];

      //     for (var j = 0; j < notes[i].allObject.length; j++) {
      //       ids.push(notes[i].allObject[j].dbId.get());
      //     }
      //     objects.push({
      //       ids: ids,
      //       id: notes[i].id
      //     });
      //   }
      //   this.viewer.restoreAllMaterialColor(objects);
      // }

    }
  ]);