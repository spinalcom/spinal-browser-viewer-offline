angular.module('app.spinalforge.plugin').run(["spinalModelDictionary", "$mdDialog",
  function (spinalModelDictionary, $mdDialog) {

    class PannelAnnotation {
      constructor(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);
        // curr_viewer = viewer;
        this.viewer = viewer;
        viewer.registerContextMenuCallback('rightClickMenu', this.RightClick);
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
      RightClick(menu, status) {
        menu.push({
          title: 'See container',
          target: () => {
            var items = this.viewer.getSelection();

            if (items.length == 1) {
              document.getElementById("search").value = items[0];
              var list = document.getElementById("allList");

              this.getContainer(items[0], (data) => {
                this.changeContainer(list, data);
              });
            } else
              alert("you must select 1 item");
          }
        });
      }

      unload() {
        this.viewer.toolbar.removeControl(this.subToolbar);
        return true;
      }


      createUI() {
        var title = 'Annotation';
        this.panel = new PanelClass(this.viewer, title);

        this.initialize();

        var button1 = new Autodesk.Viewing.UI.Button('model-viewer');
        button1.setIcon("fa-pencil");

        button1.onClick = (e) => {
          if (!this.panel.isVisible()) {
            this.panel.setVisible(true);
          } else {
            this.panel.setVisible(false);
          }
        };

        button1.addClass('model-viewer');
        button1.setToolTip('model viewer');

        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
        this.subToolbar.addControl(button1);
        this.viewer.toolbar.addControl(this.subToolbar);
      }

      initialize() {


        this.panel.initializeMoveHandlers(this.panel.container);
        // this.panel.container.appendChild(this.panel.createCloseButton());
        var _container = this.panel.container;

        var func_success = (data) => {
          var container = _container;
          var allNotes = data;
          container.className += " panelViewer";

          ////////////////////////////////////////////////
          //             Button Add Note                //
          ////////////////////////////////////////////////
          var headerDiv = document.createElement('div');
          headerDiv.className = "spin row head";

          //create note button
          var cDiv = document.createElement('div');
          cDiv.className = "col-sm-2 col-md-2 col-xs-2";

          var createNote = document.createElement('button');
          createNote.className = "btn btn-primary btn-sm btn-block";
          createNote.innerHTML = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Note';

          createNote.onclick = () => {
            var confirm = $mdDialog.prompt()
              .title('New Note')
              .placeholder('Please enter the title')
              .ariaLabel('New Note')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Create!')
              .cancel('Cancel');
            $mdDialog.show(confirm).then((result) => {
              this.AddNote(result);
            }, function () {});
          };

          //color all
          var vDiv = document.createElement('div');
          vDiv.className = "col-sm-2 col-md-2 col-xs-2";
          var viewButton = document.createElement('button');
          viewButton.className = "btn btn-primary btn-sm btn-block";
          viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i> View';

          viewButton.onclick = () => {
            this.changeAllItemsColor();
            this.changeAllIcon("fa-eye-slash", true);
          };

          //hide all
          var hDiv = document.createElement('div');
          hDiv.className = "col-sm-2 col-md-2 col-xs-2";
          var hideButton = document.createElement('button');
          hideButton.className = "btn btn-primary btn-sm btn-block";
          hideButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i> Hide';

          //--------------------------------------------------------------------------------------------
          hideButton.onclick = () => {
            this.restoreAllItemsColor();
            this.changeAllIcon("fa-eye", false);
          };
          //--------------------------------------------------------------------------------------------

          ///////////////////////////////////////////////
          //            Card List                      //
          ///////////////////////////////////////////////
          var list = document.createElement('div');
          list.className = "list-group";
          list.id = "allList";

          ///////////////////////////////////////////////
          //             Search Input                  //
          ///////////////////////////////////////////////
          var searchDiv = document.createElement('div');
          searchDiv.className = "spin input-group";

          var searchIcon = document.createElement('span');
          searchIcon.className = "icon input-group-addon";
          searchIcon.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';

          var search = document.createElement('input');
          search.className = "input form-control toolbar-search-box";
          search.type = "number";
          search.id = "search";
          search.placeholder = "item id";

          search.onclick = function () {
            search.focus();
          };

          search.oninput = () => {
            if (search.value != "") {
              this.getContainer(parseInt(search.value), (data) => {
                this.changeContainer(list, data);
              });
            } else {
              this.changeContainer(list, allNotes);
            }
          };

          //button header
          cDiv.appendChild(createNote);
          vDiv.appendChild(viewButton);
          hDiv.appendChild(hideButton);

          headerDiv.appendChild(cDiv);
          headerDiv.appendChild(vDiv);
          headerDiv.appendChild(hDiv);

          container.appendChild(headerDiv);

          //search
          searchDiv.appendChild(searchIcon);
          searchDiv.appendChild(search);
          container.appendChild(searchDiv);

          //list
          container.appendChild(list);

          ///////////////////////////////////////////////
          //          When notes change                //
          ///////////////////////////////////////////////
          allNotes.bind(() => {
            this.changeContainer(list, allNotes);
          });
        };
        spinalModelDictionary.init().then((m) => {
          if (m) {
            if (m.annotationPlugin) {
              m.annotationPlugin.load((mod) => {
                this.model = mod;
                func_success(this.model);
              });
            } else {
              this.model = new Lst();
              m.add_attr({
                annotationPlugin: new Ptr(this.model)
              });

              func_success(this.model);
            }

          }

        });
      }

      AddNote(title, color = "#000000") {
        var notes = this.model;
        var id = newGUID();

        var newNote = new NoteModel();
        newNote.title.set(title);
        newNote.color.set(color);
        newNote.id.set(id);

        var otherNotes = notes;
        otherNotes.push(newNote);
        notes.mod_attr(otherNotes);
      }

      AddItems(id) {
        var noteSelected, indexNote;
        var items = this.viewer.getSelection();
        if (items.length == 0) {
          alert('No model selected !');
          return;
        }
        this.viewer.model.getBulkProperties(items, {
          propFilter: ['name']
        }, (models) => {
          var notes = this.model;

          for (var i = 0; i < notes.length; i++) {
            if (notes[i].id == id) {
              noteSelected = notes[i].allObject;
              indexNote = i;
              break;
            }
          }

          for (var j = 0; j < models.length; j++) {
            noteSelected.push(models[j]);
          }
          notes[indexNote].allObject = noteSelected;
          console.log("notes", notes);
        }, function () {
          console.log("error");
        });


      }

      getContainer(id, callback) {
        var notes = model;
        var containers = notes.filter((element) => {

          return element.allObject.filter(
            (e) => {
              return e.dbId.get() == id;
            }
          ).length > 0;
        });
        callback(containers);
      }

      changeColorInHub(id, color) {
        var noteSelected, indexNote;
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id == id) {
            notes[i].color.set(color);
          }
        }
      }

      changeItemColor(id) {
        var ids = [];
        var selected;
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id == id) {
            selected = notes[i];
            for (var j = 0; j < selected.allObject.length; j++) {

              ids.push(selected.allObject[j].dbId.get());
            }
          }
        }
        this.viewer.setColorMaterial(ids, selected.color.get(), selected.id.get());
      }
      restoreColor(id) {
        var ids = [];
        var selected;
        console.log("id", id);
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id == id) {
            selected = notes[i];
            for (var j = 0; j < selected.allObject.length; j++) {
              ids.push(selected.allObject[j].dbId.get());
            }
          }
        }
        console.log(ids);
        this.viewer.restoreColorMaterial(ids, id);
      }

      changeAllItemsColor() {
        var objects = [];
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          var ids = [];
          var color;
          for (var j = 0; j < notes[i].allObject.length; j++) {
            ids.push(notes[i].allObject[j].dbId.get());
          }
          color = notes[i].color.get();
          objects.push({
            ids: ids,
            color: color,
            id: notes[i].id
          });
        }
        this.viewer.colorAllMaterials(objects);
      }

      restoreAllItemsColor() {
        var objects = [];
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          var ids = [];

          for (var j = 0; j < notes[i].allObject.length; j++) {
            ids.push(notes[i].allObject[j].dbId.get());
          }
          objects.push({
            ids: ids,
            id: notes[i].id
          });
        }
        this.viewer.restoreAllMaterialColor(objects);
      }

      deleteNoteItem(note, item = null) {
        var notes = this.model;
        if (item != null) {
          for (let i = 0; i < notes.length; i++) {
            if (notes[i].id == note) {
              for (var j = 0; j < notes[i].allObject.length; j++) {
                if (notes[i].allObject[j].dbId == item) {
                  notes[i].allObject.splice(j, 1);
                }
              }
            }
          }
        } else {
          notes = notes.filter((element => element.id != note));
        }
      }

      changeAllIcon(iconName, show) {
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          var element = document.getElementsByClassName("show" + notes[i].id)[0];
          element.innerHTML = `<i class="fa ${iconName}" aria-hidden="true"></i>`;
          element.show = show;
        }
      }

      //////////////////////////////////////////////////////////////
      //                  Change container                        //
      //////////////////////////////////////////////////////////////
      changeContainer(list, allNotes) {
        list.innerHTML = "";

        if (allNotes.length > 0) {

          for (var index = 0; index < allNotes.length; index++) {
            var _object = allNotes[index];
            var title = _object.title.get();
            var id = _object.id.get();
            var color = _object.color.get();

            var card = document.createElement('div');
            card.className = "card";

            //card header
            var header = document.createElement('div');
            header.className = 'card-header row';
            // header.role = "tab";
            header.setAttribute('role', 'tab');
            header.id = "headerNote" + index;
            header.innerHTML = `<div class="col-sm-4 col-md-4 col-xs-4">
                      <a href="javascript:;" data-toggle="collapse" data-target="#notes${index}" aria-expanded="true" aria-controls="notes${index}">${title}</a>
                  </div>`;

            //add items
            var addButtonDiv = document.createElement('div');
            addButtonDiv.className = "col-sm-1 col-md-1 col-xs-1";
            var addButton = document.createElement('button');
            addButton.className = "btn btn-sm";
            addButton.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
            addButton.id = id;
            addButton.onclick = () => {
              this.AddItems(addButton.id);
            };
            addButtonDiv.appendChild(addButton);
            header.appendChild(addButtonDiv);

            //Color
            var colorDiv = document.createElement('div');
            colorDiv.className = "col-sm-1 col-md-1 col-xs-1";
            let colorButton = document.createElement('input');
            colorButton.className = "btn btn-sm btn-block";
            colorButton.setAttribute('type', 'color');
            colorButton.value = color;
            colorButton.id = id;
            colorButton.onchange = () => {
              this.changeColorInHub(colorButton.id, colorButton.value);
            };

            colorDiv.appendChild(colorButton);
            header.appendChild(colorDiv);

            //changeColor items
            var viewDiv = document.createElement('div');
            viewDiv.className = "col-sm-1 col-md-1 col-xs-1";
            var viewButton = document.createElement('button');
            viewButton.className = "btn btn-sm show" + id;
            viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
            viewButton.id = id;
            viewButton.setAttribute("show", false);

            viewButton.onclick = () => {
              if (viewButton.show == true) {
                this.restoreColor.call(this, viewButton.id);
                viewButton.show = false;
                viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
              } else {
                this.changeItemColor.call(this, viewButton.id);
                viewButton.show = true;
                viewButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
              }
            };

            viewDiv.appendChild(viewButton);
            header.appendChild(viewDiv);

            //collapse
            var collapse = document.createElement('div');
            collapse.id = "notes" + index;
            collapse.className = "collapse";

            collapse.setAttribute('role', 'tabpanel');
            collapse.setAttribute('aria-labelledby', 'notes' + index);
            collapse.setAttribute('data-parent', '#accordion');

            //card body
            var body = document.createElement('div');
            body.className = "card-body";

            //----------------------------------------- items --------------------------------------------------------------------------------------------
            var items = document.createElement('ul');
            items.className = "list-group";
            var x = _object.allObject.length;
            var li;
            if (x > 0) {
              for (var i = 0; i < x; i++) {
                li = document.createElement('li');
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = _object.allObject[i].name;

                var b = document.createElement('button');
                b.className = "btn badge";
                b.id = id + "/" + _object.allObject[i].dbId;
                b.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>';

                b.onclick = () => {
                  var t = b.id.split("/");
                  this.deleteNoteItem(t[0], t[1]);
                };

                li.appendChild(b);
                items.appendChild(li);
              }
            } else {
              li = document.createElement('span');
              li.innerText = "No item";
              items.appendChild(li);
            }
            body.appendChild(items);
            collapse.appendChild(body);

            card.appendChild(header);
            card.appendChild(collapse);

            list.appendChild(card);

          }
        } else {
          list.innerHTML = "<h6>No item found</h6>";
        }
      }
    } // end class
    Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
  } // end run
]);