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
