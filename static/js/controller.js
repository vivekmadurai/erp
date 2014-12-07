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

posApp.controller('ProductController', function($scope, $http, sharedService) {
    var productData = localStorage.getItem("productList");
    $scope.val = "test";
    if (productData){
        $scope.products = JSON.parse(productData);
    } else {
         loadProducts();
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
        sharedService.prepForBroadcast(product);
    };
        
    $scope.$on('handleBroadcast', function() {
        $scope.message = sharedService.message;
    }); 
});

posApp.controller('BillController', function($scope, $http, sharedService) {
    $scope.bills = {completed: {}, draft: {}, canceled: {}};
    var bills = localStorage.getItem("bills");
    if(bills){
        $scope.bills = JSON.parse(bills);
    }
     
    $scope.currentBill = null;
    
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
            $scope.currentBill =null ;
        }
    }
    
    $scope.printBill = function() {
        if($scope.currentBill) {
            $("#billDetails").print();
	        $scope.bills.completed[$scope.currentBill.id] = $scope.currentBill;
	        //TODO: need to send to server and remove from the completed queue
	        //...
	        localStorage.setItem("bills", JSON.stringify($scope.bills));
	        $scope.currentBill = null;
	    }
    }
    
    $scope.$on('handleBroadcast', function() {
        addItem(sharedService.selectedProduct);
    });
    
    function addItem(product) {
        if($scope.currentBill) {
            var item = {id: $scope.currentBill.items.length + 1, quantity: 1};
            item.name = product.name;
            item.price = product.price;
            item.amount = item.quantity * item.price;
            
            $scope.currentBill.items.push(item);
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
    }
    
    $scope.getLength = function(obj) {
        return _.size(obj)
    }
    
    $scope.setSelectedReport = function(report) {
        $scope.selectedReport = report;
        $scope.currentBill = null;
    }
});