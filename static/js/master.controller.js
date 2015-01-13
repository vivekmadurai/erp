var app = angular.module("POSApp", [ 'ngRoute', 'infinite-scroll' ]);

app.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/Customers', {
		templateUrl : 'static/views/customer.list.html',
		controller : 'CustomerCtrl'
	}).when('/Add Product', {
		templateUrl : 'static/views/product.form.html',
		controller : 'ProductCtrl'
	}).

	when('/Category List', {
		templateUrl : 'static/views/category.list.html',
		controller : 'CategoryListCtrl'
	}).when('/Add Category', {
		templateUrl : 'static/views/category.form.html',
		controller : 'CategoryCtrl'
	}).otherwise({
		redirectTo : '/Customers'
	});
} ]);

app.controller("MasterCtrl", function($scope, $http) {
	$scope.selectedTab = "Customers";

	$scope.setSelectedTab = function(tabName) {
		$scope.selectedTab = tabName;
	}

});

app.controller("CustomerCtrl", function($scope, $http, $filter) {

	$scope.customers = [];
	$scope.currentPageCustomers = [];
	$scope.customer = null;
	result = null;
	$scope.currentPage = 0;

	// __init__ methods
	$scope.invokeLoadCustomers = function() {

		$scope.currentPage++;

		$scope.loadCustomers($scope.currentPage, 15);
	}

	$scope.loadCustomers = function(offset, limit) {

		$scope.result = $http.get("/Customer/list/p" + offset + "/" + limit);
		$scope.result.then(function(data) {
			//$scope.customers = data.data;

			//$scope.customers.unshift(data.data);
			
			//var vCustomers = data.data;

			for (var index = 0; index < data.data.length; index++) { 
				 
				$scope.customers.push(data.data[index]); 
			}
			
			//$scope.customers.push(customers);

		}, function(data) {
			// error handling should go here
			window.alert('err' + data);
		});

		/*
		 * $http.get("/Customer/list/p" + offset + "/" + limit).success(
		 * function(result) { var vCustomer = result; // $scope.customers =
		 * result; for (var i = 1; i <= vCustomer.length; i++) { //
		 * alert(vCustomer[i]) $scope.customers.push(vCustomer[i]); }
		 * 
		 * }).error(function() { alert("Unable to load Customers") })
		 */
	};

	$scope.openwindow = function(productId) {
		$scope.product = $filter('filter')($scope.products, {
			instanceId : productId
		})
		document.getElementById('editProductWindow').show();
	}
});
