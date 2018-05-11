angular.module("app.spinalcom").factory("ngSpinalCore", [
  "$q",
  function($q) {
    var service = {};
    service.conn = 0;

    service.connect = function(option) {
      service.conn = spinalCore.connect(option);
    };
    service.store = function(model, path) {
      var deferred = $q.defer();
      spinalCore.store(
        service.conn,
        model,
        path,
        function(model) {
          deferred.resolve(model);
        },
        function() {
          deferred.reject();
        }
      );
      return deferred.promise;
    };
    service.load = function(path) {
      var deferred = $q.defer();
      spinalCore.load(
        service.conn,
        path,
        function(model) {
          deferred.resolve(model);
        },
        function() {
          deferred.reject();
        }
      );
      return deferred.promise;
    };
    service.load_type = function(model, path) {
      var deferred = $q.defer();
      spinalCore.load_type(
        service.conn,
        model,
        path,
        function(model) {
          deferred.resolve(model);
        },
        function() {
          deferred.reject();
        }
      );
      return deferred.promise;
    };
    service.load_right = function(ptr) {
      var deferred = $q.defer();
      spinalCore.load_right(
        service.conn,
        ptr,
        function(model) {
          deferred.resolve(model);
        },
        function() {
          deferred.reject();
        }
      );
      return deferred.promise;
    };
    service.share_model = function(data, filename, flag, target_username) {
      return spinalCore.share_model(
        service.conn,
        data,
        filename,
        flag,
        target_username
      );
    };
    return service;
  }
]);
