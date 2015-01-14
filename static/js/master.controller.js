var app = angular.module("POSApp", [ 'ngRoute', 'infinite-scroll' ]);

app.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/Customers', {
		templateUrl : 'static/views/customer.list.html',
		controller : 'CustomerCtrl'
	}).when('/Employees', {
		templateUrl : 'static/views/employee.list.html',
		controller : 'EmployeeCtrl'
	})

	.otherwise({
		redirectTo : '/Customers'
	});
} ]);




app.controller("MasterCtrl", function($scope, $http) {
	
	$scope.selectedTab ='Customers';
	
	$scope.setSelectedTab = function(tabName) {
		$scope.selectedTab = tabName;
	}

});

app.controller("EmployeeCtrl", function($scope, $http) {
	$scope.employees = [];
	result = null;
	$scope.currentPage = 0;
	this.busy = false;

	// __init__ methods
	$scope.invokeLoadEmployees = function() {

		// $scope.currentPage++;

		$scope.loadEmployees(1000);
	}

	$scope.loadEmployees = function(limit) {

		if (this.busy)
			return;
		this.busy = true;
		$scope.selectedTab = 'Employees';
		
		$scope.currentPage++;

		$http.get("/User/list/p" + $scope.currentPage + "/" + limit)
				.success(function(result) {

					for (var index = 0; index < result.length; index++) {

						$scope.employees.push(result[index]);
					}

					

				}).error(function() {
					alert("Unable to load Employee")
				})

		this.busy = false;

		
	};

	$scope.openwindow = function(productId) {
		$scope.product = $filter('filter')($scope.products, {
			instanceId : productId
		})
		document.getElementById('editProductWindow').show();
	}

});	


app.controller("CustomerCtrl", function($scope, $http, $filter) {

	$scope.customers = [];
	$scope.currentPageCustomers = [];
	$scope.customer = null;
	result = null;
	$scope.currentPage = 0;
	this.busy = false;

	// __init__ methods
	$scope.invokeLoadCustomers = function() {

		// $scope.currentPage++;

		$scope.loadCustomers(1000);
	}

	$scope.loadCustomers = function(limit) {

		if (this.busy)
			return;
		this.busy = true;
		$scope.selectedTab = 'Customers';
		
		

		$scope.currentPage++;

		$http.get("/Customer/list/p" + $scope.currentPage + "/" + limit)
				.success(function(result) {

					for (var index = 0; index < result.length; index++) {

						$scope.customers.push(result[index]);
					}

					

				}).error(function() {
					$scope.products = null;
					alert("Unable to load Customer")
				})

		this.busy = false;

		
	};

	$scope.openwindow = function(productId) {
		$scope.product = $filter('filter')($scope.products, {
			instanceId : productId
		})
		document.getElementById('editProductWindow').show();
	}
});
