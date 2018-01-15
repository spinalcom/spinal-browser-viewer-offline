angular.module('app.controllers')
  .controller('navbarCtrl', ["$scope", "authService", "$location",
    function ($scope, authService, $location) {
      $scope.username = "";
      $scope.connected = false;

      authService.wait_connect().then(() => {
        $scope.username = authService.get_user().username;
        $scope.connected = true;

      });

      $scope.logout = () => {
        $location.path('/login');
      };

      // get in SpinalDrive_Env
      $scope.layouts = [

        {
          id: "drag-viewer",
          name: "viewer",
          cfg: {
            isClosable: true,
            title: "Viewer",
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
  ]);