var app = angular.module("POSApp", ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/Product List', {
        templateUrl: 'static/views/product.list.html',
        controller: 'ProductListCtrl'
      }).
      when('/Add Product', {
        templateUrl: 'static/views/product.form.html',
        controller: 'ProductCtrl'
      }).
      
      when('/Category List', {
        templateUrl: 'static/views/category.list.html',
        controller: 'CategoryListCtrl'
      }).
      when('/Add Category', {
        templateUrl: 'static/views/category.form.html',
        controller: 'CategoryCtrl'
      }).
      otherwise({
        redirectTo: '/Product List'
      });
}]);

app.controller("InventoryCtrl", function($scope, $http) {
    $scope.selectedTab = "Product List";
    
    $scope.setSelectedTab = function(tabName) {
        $scope.selectedTab = tabName;
    }
});

app.controller("ProductListCtrl", function($scope, $http, $filter) {

    $scope.products = [];
    $scope.product = null;
    
    //__init__ methods
    loadProducts(1, 5);
        
    function loadProducts(offset, limit) {
        $http.get("/Product/list/p"+offset+"/"+limit)
        .success(function(result){
            $scope.products = result;
        }).error(function(){
            alert("Unable to load products")
        })
    };
    
    $scope.openwindow = function(productId) {
        $scope.product = $filter('filter')($scope.products, {instanceId: productId})     
        document.getElementById('editProductWindow').show();  
    }
});

app.controller("CategoryListCtrl", function($scope, $http, $filter) {

    $scope.categories = [];
    $scope.category = [];
    //__init__ methods
    loadCategories(1, 5);    
    function loadCategories(offset, limit) {
        $http.get("/Category/list/p"+offset+"/"+limit)
        .success(function(result){
            $scope.categories = result;
        }).error(function(){
            alert("Unable to load categories")
        })
    }
    
    $scope.openEditCategorywindow = function(categoryId) {
        $scope.category = $filter('filter')($scope.categories, {instanceId: categoryId})     
        document.getElementById('editCategoryWindow').show();  
    }
});

app.controller("ProductCtrl", function($scope, $http) {
    validateForm();
    
    $scope.categoryList = [];
    
    loadCategory();
    
    function loadCategory() {
        $http.get("/Category/list").success(function(result){
            $scope.categoryList = result;
        }).error(function(){
            alert("Unable to load category list")
        })
    }
        
    $scope.createProduct = function(product) {
         $http({
               method: 'post',
               url:'/Product/create', 
               headers: {'Content-Type': 'application/x-www-form-urlencoded'},
               data: $.param(product)
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

app.controller("CategoryCtrl", function($scope, $http) {
    validateForm();
    
    $scope.createCategory = function(category) {
        $http({
               method: 'post',
               url:'/Category/create', 
               headers: {'Content-Type': 'application/x-www-form-urlencoded'},
               data: $.param(category)
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