var app = angular.module("POSApp", [ 'ngRoute', 'infinite-scroll' ]);

app.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/Customers', {
		templateUrl : 'static/views/customer.list.html',
		controller : 'CustomerCtrl'
	}).when('/Employees', {
		templateUrl : 'static/views/employee.list.html',
		controller : 'EmployeeCtr1'
	})
	.otherwise({
		redirectTo : '/Customers'
	});
} ]);

app.controller("MasterCtrl", function($scope, $http) {

	$scope.selectedTab = 'Customers';
	$scope.sidebarSelectedTab = 'Contacts';

	$scope.setSelectedTab = function(tabName) {
		$scope.selectedTab = tabName;
	}

	$scope.open = function(size) {

		var modalInstance = $modal.open({
			templateUrl : 'myModalContent.html',
			controller : 'ModalInstanceCtrl',
			size : size,
			resolve : {
				items : function() {
					return $scope.items;
				}
			}
		});

		modalInstance.result.then(function(selectedItem) {
			$scope.selected = selectedItem;
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

	$scope.setSidebarSelectedTab = function(tabName) {
		$scope.sidebarSelectedTab = tabName;
	}
	
	
});

app.controller("EmployeeCtr1", function($scope, $http, $window, $location,
		$route) {
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

		$http.get("/User/list/p" + $scope.currentPage + "/" + limit).success(
				function(result) {

					for (var index = 0; index < result.length; index++) {

						$scope.employees.push(result[index]);
					}

				}).error(function() {
			alert("Unable to load Employee")
		})

		this.busy = false;

	};

	$scope.createEmployee = function(User, employeeForm) {

		if (!employeeForm.$valid) {
			alert("Please check the entered data.")
			return;
		}

		$http({
			method : 'post',
			url : '/User/create',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			data : $.param(User)
		}).success(function(data, status, headers, config) {

			$window.alert("Employee information is persisted successfully")
			$('#addEmployeeModal').modal('hide');

			// Loading Employee section alone.. No full page reload
			$location = $window.location.origin + '/master#/Employees';
			$route.reload();

		}).error(function(data, status, headers, config) {
			$window.alert("Employee is not persisted")
		});
	}
	
	/*
	 * Below functionality is used for save and save another.
	 */
	$scope.createEmployeeAndSaveAnother = function(User,
			employeeForm) {

		$scope.successMsg = "";

		if (!employeeForm.$valid) {
			alert("Please check the entered data.")
			return;
		}

		$http(
				{
					method : 'post',
					url : '/User/create',
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data : $.param(User)
				})
				.success(
						function(data, status, headers, config) {

							$scope.resetForm(employeeForm);
							$scope.successMsg = "Employee is saved succesfully. Please save another employee"

						})
				.error(function(data, status, headers, config) {
					$window.alert("Employee is not persisted")
				});

	}
	
	$scope.resetForm = function(employeeForm) {
		employeeForm.$setPristine();
		$scope.User =  {};
	}
	
	$scope.resetEmployeeAddForm = function(User) {
	
		$scope.User =  {};
		
	}
	
	$scope.openEmployeeModelWindow = function(employeeRow) {
		$scope.User = employeeRow;
	}

});

app
		.controller(
				"CustomerCtrl",
				function($scope, $http, $window, $route, $filter) {

					$scope.customers = [];
					$scope.currentPageCustomers = [];
					// $scope.customer = null;

					result = null;
					$scope.currentPage = 0;
					this.busy = false;

					$scope.invokeLoadCustomers = function() {

						$scope.loadCustomers(1000);
					}

					$scope.loadCustomers = function(limit) {

						if (this.busy)
							return;
						this.busy = true;
						$scope.selectedTab = 'Customers';

						$scope.currentPage++;

						$http
								.get(
										"/Customer/list/p" + $scope.currentPage
												+ "/" + limit)
								.success(
										function(result) {

											for (var index = 0; index < result.length; index++) {

												$scope.customers
														.push(result[index]);
											}

										}).error(function() {
									$scope.products = null;
									alert("Unable to load Customer")
								})

						this.busy = false;

					};

					$scope.createCustomer = function(customer, customerForm) {

						if (!customerForm.$valid) {
							alert("Please check the entered data.")
							return;
						}

						$http(
								{
									method : 'post',
									url : '/Customer/create',
									headers : {
										'Content-Type' : 'application/x-www-form-urlencoded'
									},
									data : $.param(customer)
								})
								.success(
										function(data, status, headers, config) {

											$window
													.alert("Customer information is persisted successfully");
											$('#addCustomerModal')
													.modal('hide');

											// Loading Employee section alone..
											// No full page reload
											$location = $window.location.origin
													+ '/master#/Customers';
											$route.reload();

										})
								.error(function(data, status, headers, config) {
									$window.alert("Customer is not persisted")
								});
					}

					/*
					 * Below functionality is used for save and save another.
					 */
					$scope.createCustomerAndSaveAnother = function(customer,
							customerForm) {

						$scope.successMsg = "";

						if (!customerForm.$valid) {
							alert("Please check the entered data.")
							return;
						}

						$http(
								{
									method : 'post',
									url : '/Customer/create',
									headers : {
										'Content-Type' : 'application/x-www-form-urlencoded'
									},
									data : $.param(customer)
								})
								.success(
										function(data, status, headers, config) {

											$scope.resetForm(customerForm);
											$scope.successMsg = "Customer is saved succesfully. Please save another customer"

										})
								.error(function(data, status, headers, config) {
									$window.alert("Customer is not persisted")
								});

					}

					$scope.resetForm = function(customerForm) {
						customerForm.$setPristine();
						$scope.customer =  {};
					}
					
					$scope.resetCustomerAddForm = function(customer) {
					
						$scope.customer =  {};
						
					}

					$scope.openwindow = function(customerRow) {

						$scope.customer = customerRow;
					}
					
					

				});
