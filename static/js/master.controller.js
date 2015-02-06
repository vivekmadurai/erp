var app = angular.module("POSApp", [ 'ngRoute', 'infinite-scroll' ]);

app.service('commonService', function($http, $route, $location, $window){
    
    this.delete = function(record, recordStrName ) { 
    	
    	
    	$http
		.delete(
				"/"+recordStrName+"/"+record.instanceId+"/delete")
		.success(
				function(result) {
					
					alert(recordStrName +" record is deleted");
					
					// Loading Employee section alone.. No full page reload
					$location = $window.location.origin + '/master#/'+recordStrName;
					$route.reload();
				
				}).error(function() {
			
					alert("Unable to delete "+recordStrName);
					return false;
		})
    	
    };  
    
    
 
});



app.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/Customers', {
		templateUrl : 'static/views/customer.list.html',
		controller : 'CustomerCtrl'
		
	}).when('/Employees', {
		templateUrl : 'static/views/employee.list.html',
		controller : 'EmployeeCtr1'
	})
	.when('/InventoryQuantity', {
		templateUrl : 'static/views/InventoryQuantity.form.html',
		controller : 'InventoryQuantityCtr1'
	})
	.when('/StoreConfig', {
		templateUrl : 'static/views/StoreConfig.form.html',
		controller : 'StoreConfigCtr1'
	})
	.otherwise({		
		redirectTo : '/Customers'
	});
} ]);



app.controller("MasterCtrl", function($scope, $http, $location) {

	$scope.selectedTab = 'Customers';
	//$scope.sidebarSelectedTab = $location.url().slice(1);
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
		$route, commonService) {
	
	var initialPassword;
	
	$scope.employees = [];
	result = null;
	$scope.currentPage = 0;
	this.busy = false;
	
	$scope.delete = function(record, recordStrName){
		$scope.successMsg = commonService.delete(record, recordStrName);
		
	}

	// __init__ methods
	$scope.invokeLoadEmployees = function() {

		// $scope.currentPage++;

		$scope.loadEmployees(20);
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
						
						/*
						 * Add employee only if employee name is present in the object.
						 * 
						 * Default user (anonymous@erpfog.com) is not loaded with user info. so not displaying in UI.
						 *  
						 */
						if (typeof result[index].firstName == 'string')
						{
							$scope.employees.push(result[index]);
						}
						else{
							continue;
						}
							
					}

				}).error(function() {
			alert("Unable to load Employee")
		})

		this.busy = false;

	};

	$scope.createEmployee = function(User, employeeForm, instanceId) {
		
		
		
		if (!employeeForm.$valid) {
			alert("Please check the entered data.")
			return;
		}
		
		// Create new Employee
		if (instanceId == null){			
			$scope.invokeAddEmployee (User, employeeForm);
		}
		else if (instanceId != null){ // Update existing employee
			
			/*
			 * Update the password only if user has updated it
			 */
			if (initialPassword != User.password){
				
				// Base64 Encoded
				User.password = btoa(User.password);
				
			}
			$scope.invokeUpdateEmployee (User, employeeForm, instanceId);
		}

		
	}
	
	
	$scope.invokeAddEmployee = function (User, employeeForm){
		
			
		$http
			.get("/User/"+User.name+"/read")
			.success(
					function(result) {
						
						alert("Employee exist with email id "+User.name);
							
						
					}).error(function() {
				
						//Create new employee only if email is not present already.
						if (result == null){
							
							//Assign user name(Email Id) as instance id before persisting
							User.instanceId = User.name;
							
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
			})
		
				
	}
	
	$scope.invokeUpdateEmployee = function (User, employeeForm, instanceId){
		
		$http({
			method : 'put',
			url : '/User/'+User.instanceId+'/update',
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
		
		initialPassword = $scope.User.password;
	}

});

app.controller("CustomerCtrl",function($scope, $http, commonService, $window, $location,
		$route) {
					$scope.customers = [];
					$scope.currentPageCustomers = [];
					
					result = null;
					$scope.currentPage = 0;
					this.busy = false;
					
					$scope.selectedTab = 'Customers';
					$scope.sidebarSelectedTab = 'Contacts';
					
					
					$scope.delete = function(record, recordStrName){
						$scope.successMsg = commonService.delete(record, recordStrName);
						
					}

					$scope.invokeLoadCustomers = function() {

						$scope.loadCustomers(20);
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
					
				
					
					$scope.createCustomer = function(customer, customerForm, customerInstanceId) {

						if (!customerForm.$valid) {
							alert("Please check the entered data.")
							return;
						}
						
						if (customerInstanceId == null){
							$scope.invokeAddCustomer (customer, customerForm);
						}
						else if (customerInstanceId != null){
							$scope.invokeUpdateCustomer (customer, customerForm, customerInstanceId);
						}

						
					}
					
					$scope.invokeAddCustomer = function(customer, customerForm){
						
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

					
					$scope.invokeUpdateCustomer = function(customer, customerForm, customerInstanceId){
						
						$http(
								{
									method : 'put',
									url : '/Customer/'+customerInstanceId +'/update',
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

app.controller("InventoryQuantityCtr1", function($scope, $http, $window, $location,
		$route) {
	
	var initialPassword;
	
	$scope.products = [];
	result = null;
	$scope.currentPage = 0;
	this.busy = false;
	$scope.isAddStcoking = [];

	// __init__ methods
	$scope.invokeLoadProducts = function() {

		// $scope.currentPage++;

		$scope.loadProducts(20);
	}

	$scope.loadProducts = function(limit) {

		if (this.busy)
			return;
		this.busy = true;

		$scope.currentPage++;

		$http.get("/Product/list/p" + $scope.currentPage + "/" + limit).success(
				function(result) {

					for (var index = 0; index < result.length; index++) {

						$scope.products.push(result[index]);
					}

				}).error(function() {
			alert("Unable to load Products")
		})

		this.busy = false;

	}
	
	$scope.updateProductQuantity = function(product, productForm){
		
	
		product.quantity = product.quantity + parseInt(productForm.quantity.$viewValue, 10);
		
		$http(
				{
					method : 'put',
					url : '/Product/' + product.instanceId
							+ '/update',
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					},
					data : $.param(product)
				})
				.success(
						function(data, status, headers, config) {

							
							//$route.reload();

						})
				.error(function(data, status, headers, config) {
					$window.alert("Product is not persisted")
				});
	}
	
	
	
});


app.controller("StoreConfigCtr1",function($scope, $http, $window, $route, $filter) {
	
	$scope.stores = [];
	
	result = null;
	
	
	loadStores();

	
	function loadStores() {
		
		/*$http
				.get(
						"/Store/list/p1/"+20)
				.success(
						function(result) {

							for (var index = 0; index < result.length; index++) {

								$scope.stores
										.push(result[index]);
							}

						}).error(function() {
				})*/
				
				
				
		$scope.stores = $http.get("/Store/list/p1/"+20);
        $scope.stores.then(function(data){
        $scope.stores = data.data;
    	$scope.selectedStore = $scope.stores[0];

        
		    }, function(data){
		        //error handling should go here
		        window.alert('Unable to local Category count'+data);
		});
        		

	}
	
	
	$scope.updateStore = function(store, storeForm){
		
		$scope.successMsg = "";

		
		if (!storeForm.$valid) {
			alert("Please check the entered data.")
			return;
		}
		
		$http({
			method : 'put',
			url : '/Store/'+store.instanceId+'/update',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			data : $.param(store)
		}).success(function(data, status, headers, config) {

			$scope.successMsg = "Configuration is saved succesfully."


		}).error(function(data, status, headers, config) {
			$window.alert("Store info is not persisted")
		});
    	
    }
	
	

});


              