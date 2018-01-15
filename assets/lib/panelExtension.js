(function () {

    var curr_viewer;
    var model;

    function PanelExtension(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);
        curr_viewer = viewer;
        viewer.registerContextMenuCallback('rightClickMenu', this.RightClick);
        this.panel = null;

        console.log("viewer", viewer);
    }

    PanelExtension.prototype.load = function () {
        if (this.viewer.toolbar) {
            this.createUI();
        } else {
            this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
            this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
        }

        return true;
    }

    PanelExtension.prototype.onToolbarCreated = function () {
        this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
        this.onToolbarCreatedBinded = null;
        this.createUI();
    }


    PanelExtension.prototype.RightClick = function (menu, status) {

        if (status.hasSelected) {
            menu.push({
                title: 'See container',
                target: function () {
                    var items = curr_viewer.getSelection();

                    if (items.length == 1) {
                        document.getElementById("search").value = items[0];
                        var list = document.getElementById("allList");

                        getContainer(items[0], (data) => {
                            changeContainer(list, data);
                        });
                    } else
                        alert("you must select 1 item");
                }
            })
        }
    }


    PanelExtension.prototype.createUI = function () {

        var viewer = this.viewer;
        var title = 'Spinal Share'
        this.panel = new PanelClass(viewer, title);

        this.initialize();

        var button1 = new Autodesk.Viewing.UI.Button('model-viewer');
        button1.setIcon("fa-pencil");

        button1.onClick = (e) => {
            if (!this.panel.isVisible()) {
                this.panel.setVisible(true);
            } else {
                this.panel.setVisible(false);
            }
        }

        button1.addClass('model-viewer');
        button1.setToolTip('model viewer');

        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
        this.subToolbar.addControl(button1);

        viewer.toolbar.addControl(this.subToolbar);

    }


    PanelExtension.prototype.initialize = function () {
        var elem = angular.element(document.querySelector('[ng-app]'));
        var injector = elem.injector();
        var spinalModelDictionary = injector.get('spinalModelDictionary');
        spinalModelDictionary.init().then(function (m) {
            // model = m;
            if (m) {
                if (m.annotationPlugin) {
                    m.annotationPlugin.load(function (mod) {
                        model = mod;
                        func_success(model)
                    })
                } else {
                    model = new Lst()
                    m.add_attr({
                        annotationPlugin: new Ptr(model)
                    })

                    func_success(model)
                }

            }

        });

        // this.panel.title = this.panel.createTitleBar(this.panel.titleLabel || this.panel.container.id);
        // this.panel.container.appendChild(this.panel.title);

        this.panel.initializeMoveHandlers(this.panel.container);

        this.panel.container.appendChild(this.panel.createCloseButton());

        var _container = this.panel.container;
        // // conn = FileSystem.get_inst();

        // spinalCore.load(conn,model,

        function func_success(data) {
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

            createNote.onclick = function () {
                var title = prompt("Please enter the title");
                console.log(title);
                if (title != null) {
                    if (title != "" && title.trim().length > 0) {
                        AddNote(title);
                    } else {
                        alert("invalid name");
                    }
                }


            }

            //color all
            var vDiv = document.createElement('div');
            vDiv.className = "col-sm-2 col-md-2 col-xs-2"
            var viewButton = document.createElement('button');
            viewButton.className = "btn btn-primary btn-sm btn-block";
            viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i> View';

            //--------------------------------------------------------------------------------------------
            viewButton.onclick = function () {
                changeAllItemsColor();
                changeAllIcon("fa-eye-slash", true);
            }
            //--------------------------------------------------------------------------------------------

            //hide all
            var hDiv = document.createElement('div');
            hDiv.className = "col-sm-2 col-md-2 col-xs-2";
            var hideButton = document.createElement('button');
            hideButton.className = "btn btn-primary btn-sm btn-block";
            hideButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i> Hide';

            //--------------------------------------------------------------------------------------------
            hideButton.onclick = function () {
                restoreAllItemsColor();
                changeAllIcon("fa-eye", false);
            }
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
            searchIcon.className = "icon input-group-addon"
            searchIcon.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';

            var search = document.createElement('input');
            search.className = "input form-control toolbar-search-box";
            search.type = "number";
            search.id = "search"
            search.placeholder = "item id";

            search.onclick = function () {
                this.focus();
            }

            search.oninput = function () {
                if (this.value != "") {
                    getContainer(parseInt(this.value), (data) => {
                        changeContainer(list, data);
                    });
                } else {
                    changeContainer(list, allNotes);
                }

            }


            ///////////////////////////////////////////////
            //             Add to container              //
            ///////////////////////////////////////////////

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
            allNotes.bind(function () {
                changeContainer(list, allNotes);
            })

        }

        // , function (err) {
        //     console.log('unable to load the model')
        // })

    }



    PanelExtension.prototype.unload = function () {
        this.viewer.toolbar.removeControl(this.subToolbar);
        return true;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                       Fonctions                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    function AddNote(title, color = "#000000") {

        var notes = model;

        var id = newGUID();

        var newNote = new NoteModel();
        newNote.title.set(title);
        newNote.color.set(color);
        newNote.id.set(id);

        var otherNotes = notes;
        otherNotes.push(newNote);
        notes.mod_attr(otherNotes);
    }


    function AddItems(id) {
        var items = curr_viewer.getSelection();

        if (items.length == 0) {
            alert('No model selected !');
            return;
        }


        v.model.getBulkProperties(items, {
            propFilter: ['name']
        }, success, function () {
            console.log("error");
        })

        var noteSelected, indexNote;

        function success(models) {
            // spinalCore.load(conn,model, function(notes){
            var notes = model;
            var notes = model;

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

            console.log("notes", notes)
            // })
        }

    }


    function getContainer(id, callback) {
        var containers = [];
        // conn = FileSystem.get_inst();
        // spinalCore.load(conn,model, function(notes){
        var notes = model;

        var containers = notes.filter((element) => {

            return element.allObject.filter(
                (e) => {
                    return e.dbId.get() == id
                }
            ).length > 0

        });

        callback(containers);

        // });
    }


    function changeColorInHub(id, color) {
        var noteSelected, indexNote;

        // conn = FileSystem.get_inst();
        // spinalCore.load(conn,model, function(notes){
        var notes = model;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id == id) {
                notes[i].color.set(color);
            }
        }
        // });
    }


    function changeItemColor(id) {

        var ids = [];
        var selected;

        // conn = FileSystem.get_inst();

        // spinalCore.load(conn,model, function(notes){
        var notes = model;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id == id) {
                selected = notes[i];
                for (var j = 0; j < selected.allObject.length; j++) {

                    ids.push(selected.allObject[j].dbId.get());
                }
            }
        }

        v.setColorMaterial(ids, selected.color.get(), selected.id.get());

        // });

    }

    var restoreColor = function (id) {
        var ids = [];
        var selected;

        console.log("id", id);

        // conn = FileSystem.get_inst();

        // spinalCore.load(conn,model, function(notes){
        var notes = model;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id == id) {
                selected = notes[i];
                for (var j = 0; j < selected.allObject.length; j++) {
                    ids.push(selected.allObject[j].dbId.get());
                }
            }
        }

        console.log(ids);

        v.restoreColorMaterial(ids, id);

        // });
    }


    var changeAllItemsColor = function () {
        var objects = [];

        // spinalCore.load(conn,model, function(notes){
        var notes = model;

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

        v.colorAllMaterials(objects);

        // });
    }

    var restoreAllItemsColor = function () {
        var objects = [];

        // spinalCore.load(conn,model, function(notes){
        var notes = model;

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

        v.restoreAllMaterialColor(objects);



        // });
    }


    var deleteNoteItem = function (note, item = null) {
        // spinalCore.load(conn,model,function(notes){  
        var notes = model;
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
        // })


    }



    var changeAllIcon = function (iconName, show) {
        // spinalCore.load(conn,model,function(notes){

        var notes = model;

        for (var i = 0; i < notes.length; i++) {
            var element = document.getElementsByClassName("show" + notes[i].id)[0];
            element.innerHTML = `<i class="fa ${iconName}" aria-hidden="true"></i>`;
            element.show = show;
        }

        // });
    }


    //////////////////////////////////////////////////////////////
    //                  Change container                        //
    //////////////////////////////////////////////////////////////

    var changeContainer = function (list, allNotes) {
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
                header.innerHTML = `
                    <div class="col-sm-4 col-md-4 col-xs-4">
                        <a href="javascript:;" data-toggle="collapse" data-target="#notes${index}" aria-expanded="true" aria-controls="notes${index}">${title}</a>
                    </div>
                `;

                //add items
                var addButtonDiv = document.createElement('div');
                addButtonDiv.className = "col-sm-1 col-md-1 col-xs-1";
                var addButton = document.createElement('button');
                addButton.className = "btn btn-sm";
                addButton.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
                addButton.id = id;
                addButton.onclick = function () {
                    AddItems(this.id);
                }
                addButtonDiv.appendChild(addButton);
                header.appendChild(addButtonDiv);

                //Color
                var colorDiv = document.createElement('div');
                colorDiv.className = "col-sm-1 col-md-1 col-xs-1";
                var colorButton = document.createElement('input');
                colorButton.className = "btn btn-sm btn-block";
                colorButton.setAttribute('type', 'color');
                colorButton.value = color;
                colorButton.id = id;
                colorButton.onchange = function () {
                    changeColorInHub(this.id, this.value);
                }

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


                viewButton.onclick = function () {
                    if (this.show == true) {
                        restoreColor(this.id);
                        this.show = false;
                        this.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
                    } else {
                        changeItemColor(this.id);
                        this.show = true;
                        this.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
                    }

                }

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

                if (x > 0) {
                    for (var i = 0; i < x; i++) {
                        var li = document.createElement('li');
                        li.className = "list-group-item d-flex justify-content-between align-items-center";
                        li.innerHTML = _object.allObject[i].name;

                        var b = document.createElement('button');
                        b.className = "btn badge";
                        b.id = id + "/" + _object.allObject[i].dbId;
                        b.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>';

                        b.onclick = function () {
                            var t = this.id.split("/");
                            deleteNoteItem(t[0], t[1]);
                        }

                        li.appendChild(b);
                        items.appendChild(li);
                    }
                } else {
                    var li = document.createElement('span');
                    li.innerText = "No item";
                    items.appendChild(li);
                }


                // var textareaDiv = document.createElement('li');

                // var inputText = document.createElement('textarea');
                // inputText.className = "input form-control toolbar-search-box";
                // inputText.setAttribute('rows','2')
                // inputText.id = id;
                // inputText.placeholder = "add anotation";

                // inputText.onclick = function(){
                //     this.focus();
                // }


                // textareaDiv.appendChild(inputText);

                // items.appendChild(textareaDiv)
                body.appendChild(items);
                collapse.appendChild(body)

                card.appendChild(header);
                card.appendChild(collapse);

                list.appendChild(card);

            }
        } else {
            list.innerHTML = "<h6>No item found</h6>";
        }

    }


    Autodesk.Viewing.theExtensionManager.registerExtension('PanelExtension', PanelExtension);

})();