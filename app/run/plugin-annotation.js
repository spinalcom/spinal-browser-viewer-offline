angular.module('app.spinalforge.plugin').run(["spinalModelDictionary", "$mdDialog", "authService",
  function (spinalModelDictionary, $mdDialog, authService) {

    class PannelAnnotation {
      constructor(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);
        this.viewer = viewer;
        viewer.registerContextMenuCallback('rightClickMenu', (menu, status) => {
           menu.push({
             title : 'See Annotation',
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
           })
        });

        this.panel = null;
        this.user = authService.get_user();
        this.detailPanelContent = null;
        this.detailPanel = null;
        this._selected = null;

        console.log(this.user);
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

      /*RightClick(menu, status) {
        console.log(viewer);
        menu.push({
          title: 'See Annotation',
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
      }*/

      unload() {
        this.viewer.toolbar.removeControl(this.subToolbar);
        return true;
      }

      createUI() {
        var title = 'Annotation';
        this.panel = new PanelClass(this.viewer, title);

        this.initialize();

        var button1 = new Autodesk.Viewing.UI.Button('Annotation');
        button1.setIcon("fa-pencil");

        button1.onClick = (e) => {
          if (!this.panel.isVisible()) {
            this.panel.setVisible(true);
          } else {
            this.panel.setVisible(false);
          }
        };

        button1.addClass('Annotation');
        button1.setToolTip('Annotation');

        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-Annotation');
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
          cDiv.className = "col-sm-3 col-md-3 col-xs-3";

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
          vDiv.className = "col-sm-3 col-md-3 col-xs-3"
          var viewButton = document.createElement('button');
          viewButton.className = "btn btn-primary btn-sm btn-block";
          viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i> View';

          viewButton.onclick = () => {
            this.changeAllItemsColor();
            this.changeAllIcon("fa-eye-slash", true);
          };

          //hide all
          var hDiv = document.createElement('div');
          hDiv.className = "col-sm-3 col-md-3 col-xs-3";
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
        newNote.date.set(Date.now());
        newNote.owner.set(this.user.id);
        newNote.username.set(this.user.username);

        var otherNotes = notes;
        otherNotes.push(newNote);
        notes.mod_attr(otherNotes);
      }

      AddItems(id) {
        var noteSelected, indexNote;
        var items = this.viewer.getSelection();
        var notes = this.model;


        if (items.length == 0) {
          alert('No model selected !');
          return;
        }

        this.viewer.model.getBulkProperties(items, {
          propFilter: ['name']
        }, (models) => {

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
        }, function () {
          console.log("error");
        });


      }

      getContainer(id, callback) {
        var notes = this.model;

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
        var notes = this.model;
        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id == id) {
            selected = notes[i];
            for (var j = 0; j < selected.allObject.length; j++) {
              ids.push(selected.allObject[j].dbId.get());
            }
          }
        }
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

        if(item != null) {
          for (let i = 0; i < notes.length; i++) {
            if(notes[i].id == note) {
              for(var j = 0; j < notes[i].allObject.length; j++){
                if(notes[i].allObject[j].dbId == item) {
                    notes[i].allObject.splice(j,1);
                    break;
                }
              }
            }
              
          }
        } else {
          for (let i = 0; i < notes.length; i++) {
              if(notes[i].id == note){
                  notes.splice(i,1);
                  break;
              }
          }
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

      renameNote(id,title) {
        var notes = this.model;
        for (let i = 0; i < notes.length; i++) {
          if(notes[i].id == id) {
              notes[i].title.set(title);
              break;
          } 
        }
      }

      //////////////////////////////////////////////////////////////
      //                  Change container                        //
      //////////////////////////////////////////////////////////////
      changeContainer(list, allNotes) {
        list.innerHTML = "";
        var _self = this;

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

            var btn_group = document.createElement("div");
            btn_group.className = "btn-group btn-group-lg";

            //add items
            var addButton = document.createElement('button');
            addButton.className = "btn";
            addButton.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
            addButton.title = "Add item selected"
            addButton.id = id;
            addButton.onclick = function() {
                _self.AddItems(this.id);
            }

            //Color
            var colorButton = document.createElement('input');
            colorButton.className = "btn";
            colorButton.setAttribute('type','color');
            colorButton.value = color;
            colorButton.title = "change color";
            colorButton.id = id;
            colorButton.onchange = function(){
              _self.changeColorInHub(this.id,this.value);
            }

            //changeColor items
            var viewButton = document.createElement('button');
            viewButton.className = "btn show" + id;
            viewButton.title = "show all elements";
            viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
            viewButton.id = id;
            viewButton.setAttribute("show",false);


            viewButton.onclick = function() {
                if(this.show == true) {
                  _self.restoreColor(this.id);
                  this.show = false;
                  this.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
                } else {
                  _self.changeItemColor(this.id);
                  this.show = true;
                  this.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
                }  
                
            }

            //Rename notes
            var renameButton = document.createElement("button");
            renameButton.className = "btn";
            renameButton.title = "rename";
            renameButton.id = id;
            renameButton.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';
            
            renameButton.onclick = function(){

              var confirm = $mdDialog.prompt()
              .title('Rename Note')
              .placeholder('Please enter the title')
              .ariaLabel('Rename')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Rename')
              .cancel('Cancel');
              $mdDialog.show(confirm).then((result) => {
                _self.renameNote(this.id,result);
              }, function () {});

            }

            //remove notes
            var deleteButton = document.createElement("button");
            deleteButton.className = "btn";
            deleteButton.title = "delete";
            deleteButton.id = id;
            deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';

            deleteButton.onclick = function() {
              _self.deleteNoteItem(this.id);
            }


            //detail
            var detailButton = document.createElement("button");
            detailButton.className = "btn";
            detailButton.title = "See detail";
            detailButton.id = id;
            detailButton.innerHTML = '<i class="fa fa-info" aria-hidden="true"></i>';

            detailButton.onclick = function() {
              _self.DetailPanel(this.id);
            }


            btn_group.appendChild(addButton);
            btn_group.appendChild(colorButton);
            btn_group.appendChild(viewButton);
            btn_group.appendChild(renameButton);
            btn_group.appendChild(deleteButton);
            btn_group.appendChild(detailButton);

            header.appendChild(btn_group);

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
                  _self.deleteNoteItem(t[0], t[1]);
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

      ////////////////////////////////////////////////////
      //                END                             //
      ///////////////////////////////////////////////////

      DetailPanel(id) {
        var notes = this.model;


        if(this.detailPanelContent == null){
          this.detailPanelContent = document.createElement('div');
          this.detailPanelContent.className = "content";
        }

        if(this.detailPanel == null) {
          this.detailPanel = new PanelClass(this.viewer,id);
          this.detailPanel.initializeMoveHandlers(this.detailPanel.container);
          this.detailPanel.container.appendChild(this.detailPanel.createCloseButton());
          this.detailPanel.container.style.right = "0px";
          this.detailPanel.container.style.width = "400px";
          this.detailPanel.container.style.height = "600px";
          this.detailPanel.container.padding = "0px";

        }

        for (let index = 0; index < notes.length; index++) {
          if(notes[index].id == id){
              this._selected = notes[index];
              break;
          }   
        }

        var formDiv = document.createElement('div');
        formDiv.className = "form_div";


        var textareaDiv = document.createElement('div');
        textareaDiv.className = "textarea_div";

        var inputText = document.createElement('textarea');
        inputText.className = "form-control";
        inputText.setAttribute('rows','2')
        inputText.id = id;
        inputText.placeholder = "add texte";

        inputText.onclick = () => {
          inputText.focus();
        }

        textareaDiv.appendChild(inputText);

        var sendButtonDiv = document.createElement('div');
        sendButtonDiv.className = "send_button_div"

        var sendButton = document.createElement('button');
        sendButton.className = "btn btn-block";
        sendButton.textContent = "Add";
        sendButton.id = id;

        sendButton.onclick = () => {
            var textAreaValue = document.querySelector(`textarea[id='${sendButton.id}']`).value;
            document.querySelector(`textarea[id='${sendButton.id}']`).value = "";

            var message = new MessageModel();
            message.id.set(newGUID());
            message.owner.set(this.user.id);
            message.username.set(this.user.username);
            message.date.set(Date.now());
            message.message.set(textAreaValue);

            this._selected.notes.push(message);

            //this.DisplayMessage(formDiv);
        }

        sendButtonDiv.appendChild(sendButton);
        
        formDiv.appendChild(textareaDiv);
        formDiv.appendChild(sendButtonDiv);
        
        
        notes.bind( () => {   
          this.DisplayMessage(formDiv)
        });



      }

      DisplayMessage(formDiv) {
        var _self = this;
        var messageContainer = document.createElement('div');
        messageContainer.className = "messageContainer"; 

        for (let i = 0; i < this._selected.notes.length; i++) {
            //message div
            var message_div = document.createElement('div');
            message_div.className = "message_div";

            //header message
            var _message = document.createElement('div');
            _message.className = "_message";
            
            //name
            var message_owner = document.createElement('div');
            message_owner.className = "message_owner";
            message_owner.innerText = this._selected.notes[i].username.get();


            //date
            var message_date = document.createElement('div');
            message_date.className = "message_date";
            var date = new Date(parseInt(this._selected.notes[i].date));
            message_date.innerText =   date.getDate() + "/" + date.getMonth() + 1 + "/" + date.getFullYear();

            

            //message content
            var message_content = document.createElement('div');
            message_content.className = "message_content";

            var message_texte = document.createElement('div');
            message_texte.className = "message_texte";
            message_texte.innerHTML = this._selected.notes[i].message;

            if(this._selected.notes[i].owner == this.user.id) {
              var closeDiv = document.createElement('div');
              closeDiv.className = "close_div";

              var span = document.createElement('span');
              span.innerHTML = "X";
              span.className = "close";
              span.id = this._selected.notes[i].id

              span.onclick = function(){
                _self.deteteMessage(this.id,formDiv);
              }

              closeDiv.appendChild(span);
              message_content.appendChild(closeDiv);
            }

            message_content.appendChild(message_texte);

            _message.appendChild(message_owner);
            _message.appendChild(message_content);
            


            message_div.appendChild(message_date);
            message_div.appendChild(_message);
            

            messageContainer.appendChild(message_div);

        }


        this.detailPanelContent.innerHTML = "";

        this.detailPanelContent.appendChild(messageContainer);
        this.detailPanelContent.appendChild(formDiv);

        this.detailPanel.setTitle(this._selected.title.get());
        this.detailPanel.setVisible(true);
        this.detailPanel.container.appendChild(this.detailPanelContent);

        var d = document.getElementsByClassName("messageContainer")[0];
        d.scrollTop = d.scrollHeight;
    
      }

      deteteMessage(id, formDiv) {
        
        for (let i = 0; i < this._selected.notes.length; i++) {
          
          if(this._selected.notes[i].id == id) {
            this._selected.notes.splice(i,1);
            // this.DisplayMessage(formDiv);
            break;
          }
          
        }


      }


    } // end class
    Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
  } // end run
]);