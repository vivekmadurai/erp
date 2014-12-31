
var app = angular.module("POSApp", []);

app.controller("addCategoryCtl", function($scope, $http) {
var items = [];
formValidation();
$scope.product = {Name: 'prd'};
       
        $scope.createCategory = function(category) {
        alert(category);
            $http({
                   method: 'post',
                   url:'/Category/createObject', 
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                   data: $.param({obj : JSON.stringify(category)})
                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                  }).
                  error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                  });
            
        }
    
  
  
   

});