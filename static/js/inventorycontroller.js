var app = angular.module("POSApp", []);



app.controller("editProductCtl", function($scope, $http) {

      
    var instanceId = location.search;

    instanceId = instanceId.slice(12);

    getProductsInstance(instanceId);
    loadCategory();

      
    function getProductsInstance(instanceId) {
        
        
		$http.get("/Product/"+instanceId+"/read").success(function(result){
            $scope.product = result;
            
        }).error(function(){
            $scope.product = null;
            alert("Unable to load product")
        });
        
        
       
		
      return $scope.product;
    };
    
    
    function loadCategory() {
        $http.get("/Category/list").success(function(result){
            $scope.categoryList = result;
            
            //$scope.product.Category = $scope.product.Category;
             
        }).error(function(){
            alert("Unable to load category list")
        })
    }
    
   
    
    $scope.editProduct = function(product) {
     
            $http({
                   method: 'post',
                   url:'/Product/createObject', 
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                   data: $.param({obj : JSON.stringify(product)})
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


app.controller("CategoryListCtrl", function($scope, $http) {
       
var items = [];

  $scope.itemsPerPage = 2;
  $scope.currentPage = 1;
  
  $scope.totalCount = 0;
  $scope.totalPageCount = 0;
  
  var dialog = document.getElementById('viewProductWindow');  
  
   $scope.totalCount = $http.get("/Category/count");
        $scope.totalCount.then(function(data){
        $scope.totalCount = data.data.count;
        
    }, function(data){
        //error handling should go here
        window.alert('Unable to local Category count'+data);
    });
    
    $scope.openEditCategorywindow = function(instanceId) {
     
        getCategory(instanceId);
        
        dialog.show();  

    }
    
    $scope.cancelEdit = function(){
        dialog.close();
    }
    
    $scope.updateCategory = function(category) {
    
            $http({
                   method: 'post',
                   url:'/Category/createObject', 
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                   data: $.param({obj : JSON.stringify(category)})
                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    dialog.close();
                    window.location.reload();
                  }).
                  error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                  });
            
     }
        
    function getCategory(instanceId) {
        
        
		$http.get("/Category/"+instanceId+"/read").success(function(result){
            $scope.category = result;
            
        }).error(function(){
            $scope.category = null;
            alert("Unable to load category")
        });
        
        
       
		
      return $scope.category;
    };

    $scope.cancelEdit = function(){
        
        dialog.close();
    }
    
    
     
    $scope.getProducts = function(offset, limit) {
        $scope.categories = [];
		$http.get("/Category/list/p"+offset+"/"+limit).success(function(result){
            $scope.categories = result;
            
        }).error(function(){
            $scope.categories = null;
            alert("Unable to load categories")
        })
		
      return $scope.categories.slice(offset, offset+limit);
    };
	

  $scope.range = function() {
    var rangeSize = 1;
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
       return $scope.currentPage === 1 ? "disabled" : "";
  };

  $scope.nextPage = function() {
  
    if ($scope.currentPage <= $scope.pageCount() - 1) {
      $scope.currentPage++;
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount()  ? "disabled" : "";
  };

  $scope.pageCount = function() {
      $scope.totalPageCount = Math.ceil($scope.totalCount/$scope.itemsPerPage);
      return $scope.totalPageCount;
  };

  $scope.setPage = function(n) {
    if (n > 0 && n < $scope.pageCount()) {
      $scope.currentPage = n;
    }
  };

  $scope.$watch("currentPage", function(newValue, oldValue) {
    $scope.pagedItems = $scope.getProducts(newValue, $scope.itemsPerPage);
    
  });

  
  
   

});

app.controller("addCategoryCtl", function($scope, $http) {
        formValidation();

        $scope.createCategory = function(category) {
        
        
        
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


app.controller("addProductCtl", function($scope, $http) {

    loadCategory();
    
    function loadCategory() {
        $http.get("/Category/list").success(function(result){
            $scope.categoryList = result;
            
            $scope.product.Category = $scope.categoryList[$scope.categoryList.length-1].Category;
             
        }).error(function(){
            alert("Unable to load category list")
        })
    }
        
    $scope.createProduct = function(product) {
         $http({
                   method: 'post',
                   url:'/Product/createObject', 
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                   
                    data: $.param({obj : JSON.stringify(product)})
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

app.controller("PaginationCtrl", function($scope, $http) {
var items = [];




  $scope.itemsPerPage = 2;
  $scope.currentPage = 1;
  $scope.totalCount =0;
  $scope.totalPageCount = 0;
  
   $scope.importProduct = function() {
  alert();
                $http({
                   method: 'post',
                   url:'/Product/import', 
                   headers: {'Content-Type': 'application/CSV'}
                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                  }).
                  error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                  });
   }
                
                  
  $scope.totalCount = $http.get("/Product/count");
        $scope.totalCount.then(function(data){
        $scope.totalCount = data.data.count;
        
    }, function(data){
        //error handling should go here
        window.alert('err'+data);
    });

  
  //alert('base'+ total());
  
  var dialog = document.getElementById('editProductWindow');  
  var viewProductWindowDialog = document.getElementById('viewProductWindow');  
  
  $scope.closeView = function(product) {
  
    viewProductWindowDialog.close();
  }
  
  $scope.editProduct = function(product) {
     
            $http({
                   method: 'post',
                   url:'/Product/createObject', 
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                   data: $.param({obj : JSON.stringify(product)})
                }).success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    dialog.close();
                    window.location.reload();
                  }).
                  error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                  });
            
            
        }
        
  
  
  $scope.openViewProductWindow = function(instanceId) {
    
   
    //var instanceId = location.search;

    //instanceId = instanceId.slice(12);
    
    getProductsInstance(instanceId);
    
    
    
    viewProductWindowDialog.show();  

    }
    
   $scope.openwindow = function(instanceId) {
    
   
    //var instanceId = location.search;

    //instanceId = instanceId.slice(12);
    
    getProductsInstance(instanceId);
    loadCategory();
    
    
    dialog.show();  

    }

    $scope.cancelEdit = function(){
    var dialog = document.getElementById('editProductWindow');  
    dialog.close();
    }
     
   $scope.getProducts = function(offset, limit) {
        $scope.products = [];
		$http.get("/Product/list/p"+offset+"/"+limit).success(function(result){
            $scope.products = result;
            
        }).error(function(){
            $scope.products = null;
            alert("Unable to load products")
        })
		
      return $scope.products.slice(offset, offset+limit);
    };
	

  $scope.range = function() {
    var rangeSize = 1;
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

      
    function getProductsInstance(instanceId) {
        
		$http.get("/Product/"+instanceId+"/read").success(function(result){
            $scope.product = result;
            
        }).error(function(){
            $scope.product = null;
            alert("Unable to load product")
        });
        
      return $scope.product;
    };
    
    
    function loadCategory() {
        $http.get("/Category/list").success(function(result){
            $scope.categoryList = result;
            
            //$scope.product.Category = $scope.product.Category;
             
        }).error(function(){
            alert("Unable to load category list")
        })
    }

  $scope.prevPage = function() {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };

  $scope.prevPageDisabled = function() {
       return $scope.currentPage === 1 ? "disabled" : "";
  };

  $scope.nextPage = function() {
  
    if ($scope.currentPage <= $scope.pageCount() - 1) {
      $scope.currentPage++;
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount()  ? "disabled" : "";
  };

  $scope.pageCount = function() {
      $scope.totalPageCount = Math.ceil($scope.totalCount/$scope.itemsPerPage);
      return $scope.totalPageCount;
  };

  $scope.setPage = function(n) {
    if (n > 0 && n < $scope.pageCount()) {
      $scope.currentPage = n;
    }
  };

  $scope.$watch("currentPage", function(newValue, oldValue) {
    $scope.pagedItems = $scope.getProducts(newValue, $scope.itemsPerPage);
    
  });
  
  

});