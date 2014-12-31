var app = angular.module("POSApp", []);

app.controller("addProductCtl", function($scope, $http) {
var items = [];
$scope.product = {Name: 'prd'};
  
   loadCategory();
   
   $('.input-group input[required], .input-group textarea[required], .input-group select[required]').on('keyup change', function() {
		var $form = $(this).closest('form'),
            $group = $(this).closest('.input-group'),
			$addon = $group.find('.input-group-addon'),
			$icon = $addon.find('span'),
			state = false;
            
    	if (!$group.data('validate')) {
			state = $(this).val() ? true : false;
		}else if ($group.data('validate') == "email") {
			state = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($(this).val())
		}else if($group.data('validate') == 'phone') {
			state = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test($(this).val())
		}else if ($group.data('validate') == "length") {
			state = $(this).val().length >= $group.data('length') ? true : false;
		}else if ($group.data('validate') == "number") {
			state = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());
		}

		if (state) {
				$addon.removeClass('danger');
				$addon.addClass('success');
				$icon.attr('class', 'glyphicon glyphicon-ok');
		}else{
				$addon.removeClass('success');
				$addon.addClass('danger');
				$icon.attr('class', 'glyphicon glyphicon-remove');
		}
        
        if ($form.find('.input-group-addon.danger').length == 0) {
            $form.find('[type="submit"]').prop('disabled', false);
        }else{
            $form.find('[type="submit"]').prop('disabled', true);
        }
	});
    
    
    
    
        
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
                   //data: $.param({batchJson : JSON.stringify($scope.product)})
                   //data: $.param({Name : 'Prd'})
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