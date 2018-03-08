// Copyright 2015 SpinalCom  www.spinalcom.com

// This file is part of SpinalCore.

// SpinalCore is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Soda is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with Soda. If not, see <http://www.gnu.org/licenses/>.
var exports = module.exports = {};

var ForgeFileDerivativesItem = class ForgeFileDerivativesItem extends Model {
  constructor(params) {
    super();
    if (!params) {
      params = {};
    }
    if ((params != null ? params.name : void 0) == null) {
      params.name = "unnamed";
    }
    if ((params != null ? params.path : void 0) == null) {
      params.path = ".";
    }
    this.add_attr({
      name: params.name,
      path: params.path
    });
    this._name = this.name;
  }

  add_child(child) {
    this._children.push(child);
  }

  accept_child(ch) {
    return false;
  }
};

exports.ForgeFileDerivativesItem = ForgeFileDerivativesItem;

var ForgeFileItem = class ForgeFileItem extends Model {
  constructor(name = "Forge File") {
    super();
    let tmp = {
      _name: name,
      _viewable: false,
      _children: [],
      name: name,
      filepath: new Path(),
      state: new Choice(0, ["Initial",
        "Uploading", "Uploading completed",
        "Uploading to forge", "Upload to forge completed",
        "Translating", "Translating completed",
        "Export completed", "Failed"
      ]),
      urn: "",
      ask_token: false,
      oauth: "",
      bucket_key: ""
    };
    this.add_attr(tmp);
  }
  add_child(child) {
    this._children.push(child);
  }
  accept_child(ch) {
    return (ch instanceof ForgeFileDerivativesItem);
  }
};

exports.ForgeFileItem = ForgeFileItem;


var ThemeModel = class ThemeModel extends Model {
  constructor(){
    super()
    this.add_attr({
      name : "",
      owner : "",
      username : "",
      creation : Date.now(),
      listModel : []
    })
  }

  get_obj() {
    let obj = {
      name : this.name.get(),
      owner : this.owner.get(),
      username : this.username.get(),
      creation : this.creation.get(),
      listModel : [],
      _server_id : this._server_id
    } 

    for (var i = 0; i < this.listModel.length; i++) {
      obj.listModel.push(this.listModel[i].get_obj());
    }

    return obj;
  }

}

exports.ThemeModel = ThemeModel;


var NoteModel = class NoteModel extends Model {
  constructor(name = "NoteModel") {
    super();

    this.add_attr({
      title: '',
      color: '',
      owner: '',
      username : '',
      date: Date.now(),
      allObject: [],
      notes : [],
      display : false,
      files : new Directory()
    });
  }

  get_obj() {
    let obj = {
      title: this.title.get(),
      color: this.color.get(),
      owner: this.owner.get(),
      username : this.username.get(),
      date: this.date.get(),
      allObject: [],
      notes : [],
      display : this.display.get(),
      files : this.files.get(),
      _server_id : this._server_id
    }

    for (var i = 0; i < this.allObject.length; i++) {
      obj.allObject.push(this.allObject[i])
    }

    for (var i = 0; i < this.notes.length; i++) {
      obj.notes.push(this.notes[i].get_obj())
    }
    return obj;
  }



}
exports.NoteModel = NoteModel;


var MessageModel = class MessageModel extends Model {
  constructor() {
    super();
     this.add_attr({
      username : '',
      owner : '',
      message : '',
      date : Date.now()
    });
  }

  get_obj() {
    let obj = {
      username : this.username.get(),
      owner : this.owner.get(),
      message : this.message.get(),
      date : this.date.get(),
      _server_id : this._server_id
    }

    return obj;
  }
}

exports.MessageModel = MessageModel;


var FileModel = class FileModel extends Model {
  constructor(file) {
    super();
    this.add_attr({
      username : '',
      owner : '',
      name : '',
      date : '',
      path : new Path()
    })
  }

  get_obj() {
    let obj = {
      username : this.username.get(),
      owner : this.owner.get(),
      name : this.name.get(),
      date : this.date.get(),
      _server_id : this._server_id
    }

    return obj;

  }

}
exports.FileModel = FileModel;
