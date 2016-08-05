var myApp = angular.module('myApp', []);
function hash(pass){
  return CryptoJS.SHA256(pass).toString();
}
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {

var refresh = function() {
  $http.get('/userlist').success(function(response) {
    $scope.contactlist = response;
    $scope.contact = "";
    $scope.contact.admin="false";
  });
};

refresh();

$scope.addContact = function() {
  $scope.contact.pass=hash($scope.contact.pass);
  $http.post('/userlist', $scope.contact).success(function(response) {
    refresh();
  });
};

$scope.remove = function(id) {
  $http.delete('/userlist/' + id).success(function(response) {
    refresh();
  });
};

$scope.edit = function(id) {
  $http.get('/userlist/' + id).success(function(response) {
    $scope.contact = response;
  });
};

$scope.update = function() {
  $scope.contact.pass=hash($scope.contact.pass);
  $http.put('/userlist/' + $scope.contact._id, $scope.contact).success(function(response) {
    refresh();
  })
};

$scope.deselect = function() {
  $scope.contact = "";
  $scope.contact.admin="false";
}
$scope.login = function() {
  $scope.loginf.passwd=hash($scope.loginf.passwd);
  $http.post('/api/login', $scope.loginf).success(function(response) {
    $scope.loginf="";
    refresh();
  });
}

}]);
