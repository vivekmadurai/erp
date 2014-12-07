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
    $scope.current = null;
    
    $scope.createBill = function() {
        $scope.current = {id: new Date().getTime(), items: [], total: 0};
    }
    
    $scope.suspendBill = function() {
    }
    
    $scope.cancelBill = function() {
    }
    
    $scope.$on('handleBroadcast', function() {
        addItem(sharedService.selectedProduct);
    });
    
    function addItem(product) {
        if($scope.current) {
            var item = {id: $scope.current.items.length + 1, quantity: 1};
            item.name = product.name;
            item.price = product.price;
            item.amount = item.quantity * item.price;
            
            $scope.current.items.push(item);
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
        for(var i in $scope.current.items) {
            total = total + $scope.current.items[i].amount; 
        }
        
        $scope.current.total = total;
    }
});







function Master() {

    this.listProducts = function() {
        var productData = localStorage.getItem("productList");
        if(productData) {
            this.productDict = JSON.parse(localStorage.getItem("productDict"))
            $("#productList").select2({
              placeholder: "select your product",
              data: JSON.parse(productData),
              results: function (data, page) {
                console.info(data)
                console.info(page)
              }
            });
        } else {
            $("#productList").val("click sync button to load products")
        }
    }
    this.loadProducts = function() {
        var curr = this;
        $.ajax({
		  url: "/product/list",
		  dataType: "json",
		  success: function(result) {
		      localStorage.setItem("productDict", JSON.stringify(result));
		      var productList = [];
		      for(key in result){
		          var product = result[key];
		          productList.push({"id": product.id, "text": product.name})
		      }
		      localStorage.setItem("productList", JSON.stringify(productList));
		      curr.listProducts();
		  }
		});    
    }
    
}

function Billing() {
    this.totalPrice = 0;
    
    this.createBill = function(elem) {
        var itemId = elem.value;
        var productPrice = master.productDict[itemId].price;
        this.totalPrice = this.totalPrice + parseFloat(productPrice);
        $("#result").append(productPrice+" + ");
        
        $("#total").text(this.totalPrice);
    }
    
    this.addItems = function(product) {
    }
    
    this.calculateTotal = function() {
    }
}
