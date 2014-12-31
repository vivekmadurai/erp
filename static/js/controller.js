var posApp = angular.module('POSApp',[]);

posApp.factory('sharedService', function($rootScope) {
    var sharedService = {};
    
	sharedService.resource = {"product": null, "category": null};

    sharedService.prepForBroadcast = function(name, value) {
        this.resource[name] = value;
        this.broadcastItem(name);
    };

    sharedService.broadcastItem = function(name) {
        $rootScope.$broadcast('handleBroadcast', {name: name});
    };
    
    return sharedService;
});

posApp.factory("Item", function() {

  var items = [];
  for (var i=0; i<50; i++) {
    items.push({ id: i, name: "name "+ i, description: "description " + i });
  }

  return {
    get: function(offset, limit) {
      return items.slice(offset, offset+limit);
    },
    total: function() {
      return items.length;
    }
  };
});

posApp.controller('ProductController', function($scope, $http, sharedService, $filter) {
    var productData = localStorage.getItem("productList");
    $scope.val = "test";
    if (productData){
        $scope.products = JSON.parse(productData);
    } else {
         loadProducts();
    }
	
	if(typeof($scope.selectedProductCategary) == "undefined"){
	
	$scope.selectedProductCategary  = $filter('filter')($scope.products, { categoryId: 1 });
	}
 
    function loadProducts() {
        $http.get("/product/list").success(function(result){
            $scope.products = result;
            localStorage.setItem("productList", JSON.stringify(result));
        }).error(function(){
            alert("Unable to load products")
        })
    }
	
    $scope.handleClick = function(product) {
	    sharedService.prepForBroadcast("product", product);
    };
        
    $scope.$on('handleBroadcast', function(event, args) {
		if(args.name == "category"){
			$scope.selectedProductCategary  = $filter('filter')($scope.products, { categoryId: sharedService.resource.category.id });
		}
	}); 
});

posApp.controller('BillController', function($scope, $http, sharedService) {
    $scope.bills = {completed: {}, draft: {}, canceled: {}};
    var bills = localStorage.getItem("bills");
	
	
	$scope.currentBill = {id: new Date().getTime(), items: [], total: 0,customerPaidAmt: 0, tenderAmt: 0};
	
    if(bills){
        $scope.bills = JSON.parse(bills);
    }
     
    //$scope.currentBill = null;
    
    $scope.setCurrentBill = function(bill) {
        $scope.currentBill = bill;
        $("#suspendModal").modal("hide")
    }
    
    $scope.createBill = function() {
        $scope.currentBill = {id: new Date().getTime(), items: [], total: 0};
    }
    
    $scope.suspendBill = function() {
        if($scope.currentBill) {
	        $scope.bills.draft[$scope.currentBill.id] = $scope.currentBill;
	        localStorage.setItem("bills", JSON.stringify($scope.bills));
        }
    }
    
    $scope.cancelBill = function() {
        if($scope.currentBill) {
            if($scope.bills.draft[$scope.currentBill.id]){
                delete $scope.bills.draft[$scope.currentBill.id]
            }
            $scope.bills.canceled[$scope.currentBill.id] = $scope.currentBill;
            localStorage.setItem("bills", JSON.stringify($scope.bills));
			$scope.currentBill = {id: new Date().getTime(), items: [], total: 0,customerPaidAmt: 0, tenderAmt: 0};        
		}
    }
    
    $scope.printBill = function() {
        if($scope.currentBill) {
            var billDetails = $("#billDetails")
            //setTimeout(function(){billDetails.print()}, 500);
            if($scope.bills.draft[$scope.currentBill.id]){
                delete $scope.bills.draft[$scope.currentBill.id]
            }
	        $scope.bills.completed[$scope.currentBill.id] = $scope.currentBill;
	        //TODO: need to send to server and remove from the completed queue
	        $http({
	           method: 'post',
	           url:'/Bill/batch', 
	           headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	           data: $.param({batchJson : JSON.stringify($scope.bills)})
	        }).success(function(data, status, headers, config) {
			    // this callback will be called asynchronously
			    // when the response is available
			  }).
			  error(function(data, status, headers, config) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			  });
	        localStorage.setItem("bills", JSON.stringify($scope.bills));
	        //$scope.currentBill = null;
	    }
    }
    
    $scope.$on('handleBroadcast', function(event, args) {
        if(args.name == "product") {
            addItem(sharedService.resource.product);
        }
    });
    
    function addItem(product) {
        if($scope.currentBill) {
            var item = {id: $scope.currentBill.items.length + 1, quantity: 1};
            item.name = product.name;
            item.price = product.price;
            item.amount = item.quantity * item.price;
            
            $scope.currentBill.items.unshift(item);
            updateTotal();
        } else {
            alert("Please create Bill before selecting products");
        }
    }
    
    $scope.updateItem = function(item){
        item.amount = item.quantity * item.price;
        updateTotal();
    }
    
    function updateTotal() {
        var total = 0;
        for(var i in $scope.currentBill.items) {
            total = total + $scope.currentBill.items[i].amount; 
        }
        
        $scope.currentBill.total = total;
		$scope.currentBill.customerPaidAmt = total;
    }
    
    $scope.getLength = function(obj) {
        return _.size(obj)
    }
    
    $scope.setSelectedReport = function(report) {
        $scope.selectedReport = report;
        $scope.currentBill = null;
    }
});

posApp.controller('CategoryController', function($scope, $http, sharedService) {

var categoryList = localStorage.getItem("categoryList");
	
	if (categoryList){
        $scope.categoryList = JSON.parse(categoryList);
    } else {
         loadCategoryList();
    }
	
	$scope.displayProductsForCategory = function(category) {
        sharedService.prepForBroadcast("category", category);	   
    };
});

posApp.controller("ProductListController", function($scope, $http, sharedService, Item) {

 $scope.itemsPerPage = 5;
  $scope.currentPage = 0;
  
  var items = [];
  for (var i=0; i<50; i++) {
    items.push({ id: i, name: "name "+ i, description: "description " + i });
  }
  
  $scope.pageCount = function() {
    return Math.ceil($scope.total/$scope.itemsPerPage);
  };

  $scope.get = function(offset, limit) {
      return items.slice(offset, offset+limit);
    };
    
    
    $scope.range = function() {
        var rangeSize = 5;
        var ret = [];
        var start;

        start = $scope.currentPage;
        if ( start > $scope.pageCount()-rangeSize ) {
          start = $scope.pageCount()-rangeSize;
        }

        for (var i=start; i<start+rangeSize; i++) {
          ret.push(i);
        }
        return ret;
      };
      
    $scope.prevPage = function() {
            if ($scope.currentPage > 0) {
          $scope.currentPage--;
        }
    };

    $scope.prevPageDisabled = function() {
        return $scope.currentPage === 0 ? "disabled" : "";
    };
    
    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pageCount() - 1) {
          $scope.currentPage++;
        }
    };

    $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.pageCount() - 1 ? "disabled" : "";
    };

    $scope.pageCount = function() {
        return Math.ceil($scope.total/$scope.itemsPerPage);
    };
    
    $scope.setPage = function(n) {
        if (n > 0 && n < $scope.pageCount()) {
          $scope.currentPage = n;
        }
    };
    
    $scope.$watch("currentPage", function(newValue, oldValue) {
        $scope.pagedItems = Item.get(newValue*$scope.itemsPerPage, $scope.itemsPerPage);
        $scope.total = Item.total();
      });
   
  

});

