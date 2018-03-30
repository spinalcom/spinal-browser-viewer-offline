angular.module('app.controllers')
  .controller('navbarCtrl', ["$scope", "authService", "$location", "$routeParams", "$mdSidenav",
    function ($scope, authService, $location, $routeParams, $mdSidenav) {
      $scope.username = "";
      $scope.connected = false;
      authService.wait_connect().then(() => {
        $scope.username = authService.get_user().username;
        $scope.connected = true;
        $scope.viewer = $routeParams.filepath;
        if ($scope.viewer) {
          $scope.viewer = atob($scope.viewer);
        } else {
          $scope.viewer = "viewer";
        }
        console.log($routeParams.filepath);
      });
      $scope.logout = () => {
        $location.path('/login');
      };
      $scope.clickUser = () => {
        $mdSidenav('right').open();
      };

      // get in SpinalDrive_Env
      $scope.layouts = [

        {
          id: "drag-viewer",
          name: "viewer",
          cfg: {
            isClosable: true,
            title: "viewer",
            type: 'component',
            componentName: 'SpinalHome',
            componentState: {
              template: 'forgeviewer.html',
              controller: 'forgeViewerCtrl'
            }
          }
        },


      ];

    }
  ])
  .controller('RightMenuCtrl', ["$scope", "$timeout", "$mdSidenav", "$location", "authService", "$mdDialog", "$templateCache",
    function ($scope, $timeout, $mdSidenav, $location, authService, $mdDialog, $templateCache) {
      authService.wait_connect().then(() => {
        $scope.username = authService.get_user().username;
      });

      $scope.close = function () {
        $mdSidenav('right').close();
      };

      $scope.logOut = () => {
        $mdSidenav('right').close().then(function () {
          $mdDialog.show($mdDialog.confirm()
            .ariaLabel('confirm menu')
            .ok('Confim')
            .cancel('Cancel')
            .title("Do you want to log out ?")
            .targetEvent(event)).then(function () {
            window.location = '/html/drive#!/login';
          }, function () {});
        });
      };
      $scope.returnToDrive = () => {
        $mdSidenav('right').close().then(function () {
          $mdDialog.show($mdDialog.confirm()
            .ariaLabel('confirm menu')
            .ok('Confim')
            .cancel('Cancel')
            .title("Do you want to return to SpinalBIM Drive ?")
            .targetEvent(event)).then(function () {
            window.location = '/html/drive/';
          }, function () {});
        });
      };

      $scope.modifyPassword = function (event) {
        $mdSidenav('right').close().then(function () {
          let my_prompt = $mdDialog.confirm()
            .ariaLabel('confirm menu')
            .ok('Confim')
            .cancel('Cancel')
            .title("Do you want to modify your password ?")
            .targetEvent(event);
          $mdDialog.show(my_prompt).then(function (result) {
            $mdDialog.show({
              ariaLabel: 'changePasswordModal',
              template: $templateCache.get("changePasswordModal.html"),
              parent: angular.element(document.body),
              clickOutsideToClose: true,
              fullscreen: true,
              controller: ["$scope", "authService", "$mdToast", "$q", "$mdDialog", changePasswordModelCtrl],
            });
          }, function () {});
        });
      };
      $scope.menuList = [{
        name: "Change Password",
        action: $scope.modifyPassword
      }, {
        name: "Return to SpinalBIM Drive",
        action: $scope.returnToDrive
      }, {
        name: "Log out",
        action: $scope.logOut
      }];
    }
  ]);
var changePasswordModelCtrl = function ($scope, authService, $mdToast, $q, $mdDialog) {
  $scope.passwordInputType = 'password';
  $scope.showPassword = function () {
    $scope.passwordInputType = 'text';
  };
  $scope.hidePassword = function () {
    $scope.passwordInputType = 'password';
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
  $scope.change_password = {
    currentPassword: "",
    password: "",
    confirm_password: ""
  };
  $scope.onError = function (err) {
    $mdToast.showSimple("Error : " + err);
  };
  let options = location.host + '/';

  $scope.change_password = (user_id, password, new_password) => {
    let deferred = $q.defer();
    SpinalUserManager.change_password(options, user_id, password, new_password, function () {
      deferred.resolve();
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  $scope.get_user_id = (user_name, password) => {
    let deferred = $q.defer();
    SpinalUserManager.get_user_id(options, user_name, password, function (response) {
      let id = parseInt(response);
      deferred.resolve(id);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  $scope.changePasswordSubmit = (newpasswordForm, change_password) => {
    if (newpasswordForm.$valid) {
      let user = authService.get_user();
      $scope.get_user_id(user.username, change_password.currentPassword)
        .then(function (user_id) {
          $scope.change_password(user.username, change_password.currentPassword, change_password.password)
            .then(function () {
              authService.save_user(user.username, change_password.password);
              $mdToast.showSimple("Password has been successfully modified.");
              $mdDialog.hide();
            }, $scope.onError);
        }, $scope.onError);
      return;
    }
  };

};