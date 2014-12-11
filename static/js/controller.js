var posApp = angular.module('POSApp',[]);

posApp.factory('sharedService', function($rootScope) {
    var sharedService = {};
    
    sharedService.selectedProduct = null;
	
	
    sharedService.prepForBroadcast = function(product) {
        this.selectedProduct = product;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };

    return sharedService;
});

posApp.controller('ProductController', function($rootScope, $http, sharedService) {
    var productData = localStorage.getItem("productList");
	var categaryList = localStorage.getItem("categaryList");
	
   $rootScope.currentBill = {id: new Date().getTime(), items: [], total: 0,customerPaidAmt: 0, tenderAmt: 0};
   $rootScope.currentBill.items
	
    $rootScope.val = "test";
    if (productData){
        $rootScope.products = JSON.parse(productData);
    } else {
         loadProducts();
    }
	
	if (categaryList){
        $rootScope.categaryList = JSON.parse(categaryList);
    } else {
         loadCategaryList();
    }
 
    function loadProducts() {
        $http.get("/product/list").success(function(result){
            $rootScope.products = result;
            localStorage.setItem("productList", JSON.stringify(result));
        }).error(function(){
            alert("Unable to load products")
        })
    }
    
    $rootScope.handleClick = function(product) {
        sharedService.prepForBroadcast(product);
    };
        
    $rootScope.$on('handleBroadcast', function() {
        $rootScope.message = sharedService.message;
    }); 
});


posApp.controller('POSController', function($scope, $http, sharedService) {
   
     
   $scope.updateTenderAmt = function(currentBill){
   $scope.currentBill.tenderAmt = currentBill.customerPaidAmt - currentBill.total;
   }
	
	
});

posApp.controller('BillController', function($rootScope, $http, sharedService) {
    $rootScope.bills = {completed: {}, draft: {}, canceled: {}};
    var bills = localStorage.getItem("bills");
    if(bills){
        $rootScope.bills = JSON.parse(bills);
    }
	
	
	$rootScope.currentBill = null;
    
    $rootScope.setCurrentBill = function(bill) {
	
        $rootScope.currentBill = bill;
        //$("#suspendModal").modal("hide")
    }
     
    
    
    
    $rootScope.suspendBill = function() {
	alert($rootScope.currentBill);
        if($rootScope.currentBill) {
	        $rootScope.bills.draft[$rootScope.currentBill.id] = $rootScope.currentBill;
	        localStorage.setItem("bills", JSON.stringify($rootScope.bills));
        }
    }
    
    $rootScope.cancelBill = function() {
        if($rootScope.currentBill) {
            if($rootScope.bills.draft[$rootScope.currentBill.id]){
                delete $rootScope.bills.draft[$rootScope.currentBill.id]
            }
            $rootScope.bills.canceled[$rootScope.currentBill.id] = $rootScope.currentBill;
            localStorage.setItem("bills", JSON.stringify($rootScope.bills));
            $rootScope.currentBill =null ;
        }
    }
    
    $rootScope.printBill = function() {
	
        if($rootScope.currentBill) {
		
		alert($rootScope.currentBill);
            var billDetails = $("#billDetails");
			
				

			
            setTimeout(function(){billDetails.print()}, 500);
            if($rootScope.bills.draft[$rootScope.currentBill.id]){
                delete $rootScope.bills.draft[$rootScope.currentBill.id]
            }
	        $rootScope.bills.completed[$rootScope.currentBill.id] = $rootScope.currentBill;
	        //TODO: need to send to server and remove from the completed queue
	        //...
	        localStorage.setItem("bills", JSON.stringify($rootScope.bills));
	        //$rootScope.currentBill = null;
	    }
    }
    
    $rootScope.$on('handleBroadcast', function() {
        addItem(sharedService.selectedProduct);
    });
    
    function addItem(product) {
        if($rootScope.currentBill) 
		{
            var item = {id: $rootScope.currentBill.items.length + 1, quantity: 1};
            item.name = product.name;
            item.price = product.price;
            item.amount = item.quantity * item.price;
            
            $rootScope.currentBill.items.unshift(item);
            updateTotal();
        } else {
            alert("Please create Bill before selecting products");
        }
    }
    
    $rootScope.updateItem = function(item){
        item.amount = item.quantity * item.price;
        updateTotal();
    }
    
    function updateTotal() {
        var total = 0;
        for(var i in $rootScope.currentBill.items) {
            total = total + $rootScope.currentBill.items[i].amount; 
        }
        
        $rootScope.currentBill.total = total;
		
		$rootScope.currentBill.customerPaidAmt = total;
		
		
    }
    
    $rootScope.getLength = function(obj) {
        return _.size(obj)
    }
    
    $rootScope.setSelectedReport = function(report) {
        $rootScope.selectedReport = report;
        $rootScope.currentBill = null;
    }
});
