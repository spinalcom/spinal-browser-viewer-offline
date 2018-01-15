
connECTION = {
    user: '168',
    password: 'JHGgcz45JKilmzknzelf65ddDadggftIO98P',
    host: '127.0.0.1',
    port: '8888'
};
var model_path = "/__users__/admin/_forge_viewer"
var FOLDER = '__forge_viewer__';


var v;
var conn;


var newGUID = function () {

    var d = new Date().getTime();

    var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
        /[xy]/g,
        function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

    return guid;
};


function PanelClass(viewer,title) {

    Autodesk.Viewing.UI.DockingPanel.call(this, viewer.container, newGUID(), title);

    this.container.style.height = "auto";
    this.container.style.width = "auto";
    this.container.style.minWidth = "300px";
    this.container.style.left = "0px";
    this.container.style.top = "0px";
    this.viewer = viewer;
    v = this.viewer;

    
}

PanelClass.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
PanelClass.prototype.constructor = PanelClass;







// PanelClass.prototype.initialize = function () {
//     _self = this;


//     this.title = this.createTitleBar(this.titleLabel || this.container.id);
//     this.container.appendChild(this.title);

//     this.initializeMoveHandlers(this.container);

//     this.container.appendChild(this.createCloseButton());
//     var _container = this.container;
//     conn = FileSystem.get_inst();
    
//     spinalCore.load(conn,model_path,function(data){
//         var container = _container;
//         var allNotes = data;
//         container.className += " panelViewer";

//         ////////////////////////////////////////////////
//         //             Button Add Note                //
//         ////////////////////////////////////////////////
//         var headerDiv = document.createElement('div');
//         headerDiv.className = "spin row head";

//         //create note button
//         var cDiv = document.createElement('div');
//         cDiv.className = "col-sm-2 col-md-2 col-xs-2";

//         var createNote = document.createElement('button');
//         createNote.className = "btn btn-primary btn-sm btn-block";
//         createNote.innerHTML = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i> Note';

//         createNote.onclick = function(){
//             var title = prompt("Please enter the title");
//             if(title != null) {
//                 if(title != "" && title.trim().length > 0) {
//                     AddNote(title);
//                 } else {
//                     alert("invalid name");
//                 }
//             }
            

//         }

//         //color all
//         var vDiv = document.createElement('div');
//         vDiv.className = "col-sm-2 col-md-2 col-xs-2"
//         var viewButton = document.createElement('button');
//         viewButton.className = "btn btn-primary btn-sm btn-block";
//         viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i> View';

//         //--------------------------------------------------------------------------------------------
//         viewButton.onclick = function(){
//             changeAllItemsColor();
//             changeAllIcon("fa-eye-slash",true);
//         }
//         //--------------------------------------------------------------------------------------------

//         //hide all
//         var hDiv = document.createElement('div');
//         hDiv.className = "col-sm-2 col-md-2 col-xs-2";
//         var hideButton = document.createElement('button');
//         hideButton.className = "btn btn-primary btn-sm btn-block";
//         hideButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i> Hide';
        
//         //--------------------------------------------------------------------------------------------
//         hideButton.onclick = function() {
//             restoreAllItemsColor();
//             changeAllIcon("fa-eye",false);
//         }
//         //--------------------------------------------------------------------------------------------

        

//         ///////////////////////////////////////////////
//         //            Card List                      //
//         ///////////////////////////////////////////////
//         var list = document.createElement('div');
//         list.className = "list-group";
//         list.id = "allList";

//         ///////////////////////////////////////////////
//         //             Search Input                  //
//         ///////////////////////////////////////////////
//         var searchDiv = document.createElement('div');
//         searchDiv.className = "spin input-group";

//         var searchIcon = document.createElement('span');
//         searchIcon.className = "icon input-group-addon"
//         searchIcon.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';

//         var search = document.createElement('input');
//         search.className = "input form-control toolbar-search-box";
//         search.type = "number";
//         search.id = "search"
//         search.placeholder = "item id";

//         search.onclick = function(){
//             this.focus();
//         }

//         search.oninput = function(){
//             if(this.value != ""){
//                 getContainer(parseInt(this.value),(data) => {
//                     changeContainer(list,data);
//                 });
//             } else {
//                 changeContainer(list,allNotes);
//             }
            
//         }

        
//         ///////////////////////////////////////////////
//         //             Add to container              //
//         ///////////////////////////////////////////////

//         //button header
//         cDiv.appendChild(createNote);
//         vDiv.appendChild(viewButton);
//         hDiv.appendChild(hideButton);

//         headerDiv.appendChild(cDiv);
//         headerDiv.appendChild(vDiv);
//         headerDiv.appendChild(hDiv);

//         container.appendChild(headerDiv);

//         //search
//         searchDiv.appendChild(searchIcon);
//         searchDiv.appendChild(search);
//         container.appendChild(searchDiv);
        
//         //list
//         container.appendChild(list);


//         ///////////////////////////////////////////////
//         //          When notes change                //
//         ///////////////////////////////////////////////
//         allNotes.bind(function(){
//             changeContainer(list,allNotes);
//         })

//     }, function (err) {
//         console.log('unable to load the model')
//     })

// }



// //////////////////////////////////////////////////////////////////////////////////////////////////////
// //                                       Fonctions                                                  //
// //////////////////////////////////////////////////////////////////////////////////////////////////////

// function AddNote (title,color = "") {
//     conn = FileSystem.get_inst();
//     spinalCore.load(conn,model_path,function(notes){
//         var id = newGUID();

//         var newNote = new NoteModel();
//         newNote.title.set(title);
//         newNote.color.set(color);
//         newNote.id.set(id);

//         var otherNotes = notes;
//         otherNotes.push(newNote);
//         notes.mod_attr(otherNotes);
//     });
// }


// function AddItems(id) {
//     var items = curr_viewer.getSelection();

//     if(items.length == 0) {
//         alert('No model selected !');
//         return;
//     }

    
//     v.model.getBulkProperties(items, {propFilter: ['name']}, success , function(){ console.log("error"); })

//     var noteSelected, indexNote;

//     function success(models) {
//         spinalCore.load(conn,model_path, function(notes){
//             for(var i = 0; i < notes.length;i++){
//                 if(notes[i].id == id) {
//                     noteSelected = notes[i].allObject;
//                     indexNote = i;
//                     break;
//                 }
//             }

//             for(var j = 0; j < models.length; j++) {
//                 noteSelected.push(models[j]);
//             }

//             notes[indexNote].allObject = noteSelected;

//             console.log("notes", notes)
//         })
//     }

// }


// function getContainer(id,callback) {
//     var containers = [];
//     conn = FileSystem.get_inst();
//     spinalCore.load(conn,model_path, function(notes){

//         var containers = notes.filter((element) => {

//                 return element.allObject.filter(
//                     (e) =>  {
//                         return e.dbId.get() == id
//                     } 
//                 ).length > 0

//         });

//         callback(containers);

//     });
// }


// function changeColorInHub(id,color) {
//     var noteSelected, indexNote;

//     conn = FileSystem.get_inst();
//     spinalCore.load(conn,model_path, function(notes){
//         for(var i = 0; i < notes.length;i++){
//             if(notes[i].id == id) {
//                 notes[i].color.set(color);
//             }
//         }
//     });
// }


// function changeItemColor(id) {

//     var ids = [];
//     var selected;

//     conn = FileSystem.get_inst();

//     spinalCore.load(conn,model_path, function(notes){
//         for(var i = 0; i < notes.length;i++){
//             if(notes[i].id == id) {
//                 selected = notes[i];
//                 for(var j = 0; j < selected.allObject.length; j++){

//                     ids.push(selected.allObject[j].dbId.get());
//                 }
//             }
//         }

//         v.setColorMaterial(ids,selected.color.get(),selected.id.get());
        
//     });

// }

// var restoreColor = function(id) {
//     var ids = [];
//     var selected;

//     console.log("id",id);

//     conn = FileSystem.get_inst();
    
//     spinalCore.load(conn,model_path, function(notes){
//         for(var i = 0; i < notes.length;i++) {
//             if(notes[i].id == id) {
//                 selected = notes[i];
//                 for(var j = 0; j < selected.allObject.length; j++){
//                     ids.push(selected.allObject[j].dbId.get());
//                 }
//             }
//         }

//         console.log(ids);

//         v.restoreColorMaterial(ids,id);
        
//     });
// }


// var changeAllItemsColor = function() {
//     var objects = [];

//     spinalCore.load(conn,model_path, function(notes){

//         for(var i = 0; i < notes.length;i++){
//             var ids = [];
//             var color;

//             for(var j = 0; j < notes[i].allObject.length; j++){
//                 ids.push(notes[i].allObject[j].dbId.get());
//             }
//             color = notes[i].color.get();

//             objects.push({ids : ids, color : color, id : notes[i].id});
//         }

//         v.colorAllMaterials(objects);

//     });
// }

// var restoreAllItemsColor = function() {
//     var objects = [];
    
//         spinalCore.load(conn,model_path, function(notes){
    
//             for(var i = 0; i < notes.length;i++){
//                 var ids = [];
    
//                 for(var j = 0; j < notes[i].allObject.length; j++){
//                     ids.push(notes[i].allObject[j].dbId.get());
//                 }
    
//                 objects.push({ids : ids, id : notes[i].id});
 
//             }

//             v.restoreAllMaterialColor(objects);
    
           
    
//         });
// }


// var deleteNoteItem = function(note, item = null){
//     spinalCore.load(conn,model_path,function(notes){    
//         if(item != null) {
//             for (let i = 0; i < notes.length; i++) {
//                 if(notes[i].id == note) {
//                     for(var j = 0; j < notes[i].allObject.length; j++){
//                         if(notes[i].allObject[j].dbId == item) {
//                             notes[i].allObject.splice(j,1);
//                         }
//                     }
//                 }
                
//             }
//         } else {
//             notes = notes.filter((element => element.id != note));
//         }
//     })
    

// }



// var changeAllIcon = function(iconName, show){
//     spinalCore.load(conn,model_path,function(notes){

//         for(var i = 0; i < notes.length; i++) {
//             var element = document.getElementsByClassName("show" + notes[i].id)[0];  
//             element.innerHTML = `<i class="fa ${iconName}" aria-hidden="true"></i>`;
//             element.show = show;
//         }

//     });
// }


// //////////////////////////////////////////////////////////////
// //                  Change container                        //
// //////////////////////////////////////////////////////////////

// var changeContainer = function(list,allNotes){
//     list.innerHTML = "";

//     if(allNotes.length > 0){
        
//         for (var index = 0; index < allNotes.length; index++) {
//             var _object = allNotes[index];
//             var title = _object.title.get();
//             var id = _object.id.get();
//             var color = _object.color.get();

//             var card = document.createElement('div');
//             card.className = "card";
            
//             //card header
//             var header = document.createElement('div');
//             header.className = 'card-header row';
//             // header.role = "tab";
//             header.setAttribute('role','tab');
//             header.id = "headerNote" + index;
//             header.innerHTML = `
//                 <div class="col-sm-4 col-md-4 col-xs-4">
//                     <a href="javascript:;" data-toggle="collapse" data-target="#notes${index}" aria-expanded="true" aria-controls="notes${index}">${title}</a>
//                 </div>
//             `;
            
//             //add items
//             var addButtonDiv = document.createElement('div');
//             addButtonDiv.className = "col-sm-1 col-md-1 col-xs-1";
//             var addButton = document.createElement('button');
//             addButton.className = "btn btn-sm";
//             addButton.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
//             addButton.id = id;
//             addButton.onclick = function() {
//                 AddItems(this.id);
//             }
//             addButtonDiv.appendChild(addButton);
//             header.appendChild(addButtonDiv);

//             //Color
//             var colorDiv = document.createElement('div');
//             colorDiv.className =  "col-sm-1 col-md-1 col-xs-1";
//             var colorButton = document.createElement('input');
//             colorButton.className = "btn btn-sm btn-block";
//             colorButton.setAttribute('type','color');
//             colorButton.value = color;
//             colorButton.id = id;
//             colorButton.onchange = function(){
//                 changeColorInHub(this.id,this.value);
//             }

//             colorDiv.appendChild(colorButton);
//             header.appendChild(colorDiv);
            
//             //changeColor items
//             var viewDiv = document.createElement('div');
//             viewDiv.className =  "col-sm-1 col-md-1 col-xs-1";
//             var viewButton = document.createElement('button');
//             viewButton.className = "btn btn-sm show" + id;
//             viewButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
//             viewButton.id = id;
//             viewButton.setAttribute("show",false);


//             viewButton.onclick = function(){
//                 if(this.show == true) {
//                     restoreColor(this.id);
//                     this.show = false;
//                     this.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
//                 } else {
//                     changeItemColor(this.id);
//                     this.show = true;
//                     this.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
//                 }  
                
//             }

//             viewDiv.appendChild(viewButton);
//             header.appendChild(viewDiv);




//             //collapse
//             var collapse = document.createElement('div');
//             collapse.id = "notes" + index;
//             collapse.className = "collapse";

//             collapse.setAttribute('role','tabpanel');
//             collapse.setAttribute('aria-labelledby','notes' + index);
//             collapse.setAttribute('data-parent','#accordion');
            
//             //card body
//             var body = document.createElement('div');
//             body.className = "card-body";
            
            
//             //items
//             var items = document.createElement('ul');
//             items.className = "list-group";
//             var x = _object.allObject.length;

//             if(x > 0) {
//                 for(var i = 0; i < x; i++) {
//                     var li = document.createElement('li');
//                     li.className = "list-group-item d-flex justify-content-between align-items-center";
//                     li.innerHTML = _object.allObject[i].name;

//                     var b = document.createElement('button');
//                     b.className = "btn badge";
//                     b.id = id + "/" + _object.allObject[i].dbId;
//                     b.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>';

//                     b.onclick = function(){
//                         var t = this.id.split("/");
//                         deleteNoteItem(t[0],t[1]);
//                     }

//                     li.appendChild(b);
//                     items.appendChild(li);
//                 }
//             } else {
//                 var li = document.createElement('span');
//                 li.innerText = "No item";
//                 items.appendChild(li);
//             }
            
//             body.appendChild(items);
//             collapse.appendChild(body)
            
//             card.appendChild(header);
//             card.appendChild(collapse);
            
//             list.appendChild(card);

//         }
//     } else {
//         list.innerHTML = "<h6>No item found</h6>";
//     }

// }