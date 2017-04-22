var mysql = require("mysql");
var inquirer = require("inquirer");
var nodemon = require("nodemon");


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

// Connect to DB and prompt user if they wish to start shopping.
connection.connect(function(err) {
  if (err) throw err;
  else {
    console.log("Welcome to Bamazon Manager.")
    mainMenu();
  }
});

var mainMenu = function() {
  inquirer.prompt({
    name: "managerChoice",
    type: "rawlist",
    message: "What would you like to do?",
    choices: ["View products for sale.", "View low inventory.", "Add to inventory.", "Add new product.", "Exit Bamazon Manager."]
  }).then(function(answer) {
    // based on their answer, either call the bid or the post functions
    if (answer.managerChoice === "View products for sale.") {
      productsForSale();
    }
    else if (answer.managerChoice === "View low inventory.") {
      viewLowInventory();
    }
    else if (answer.managerChoice === "Add to inventory.") {
      displayInventory();
      setTimeout(selectItemAndUpdateStock, 1000);
    }
    else if (answer.managerChoice === "Add new product.") {
      productToBeAdded();
    }
    else {
      console.log("Good bye.");
      return;
    }

  });
};

// Functions
// ==========================
function displayInventory(){
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    else {
      console.log("----- Bamazon Inventory -----")
      for (var i = 0; i < results.length; i++) {
        console.log("Product ID: " + results[i].tem_id + " | Product: " + results[i].product_name + " | Department: " + results[i].department_name + " | Price: $" + results[i].price.toFixed(2) + " | Stock: " + results[i].stock_quantity);
      };
      console.log("----- End of Inventory -----");
    };
  });
}

function productsForSale(){
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      else {
        console.log("----- Bamazon Inventory -----")
        for (var i = 0; i < results.length; i++) {
          console.log("Product ID: " + results[i].tem_id + " | Product: " + results[i].product_name + " | Department: " + results[i].department_name + " | Price: $" + results[i].price.toFixed(2) + " | Stock: " + results[i].stock_quantity);
        };
        console.log("----- End of Inventory -----");
      };
    });
    setTimeout(mainMenu, 3000);
  }

function viewLowInventory(){
    connection.query("SELECT * FROM products WHERE stock_quantity<5", function(err, results) {
      if (err) throw err;
      else {
  		for (var i=0; i<results.length; i++) {
  			console.log("ID: " + results[i].tem_id + " | Product: " + results[i].product_name + " | Stock: " + results[i].stock_quantity);
  		  };
      };
  	});
  	 setTimeout(mainMenu, 3000);
  }


function selectItemAndUpdateStock(){
    inquirer.prompt([
    	    {
    	      type: "input",
    	      name: "selectID",
    	      message: "Enter the Product ID of the item you would wish to stock.",
    	    },
    	    {
    	    type: "input",
    	      name: "quantity",
    	      message: "How many do you want to stock?",
    	    },
          {
          type: "rawlist",
          name: "areYouSure",
          message: "Are you sure you want to re-stock this amount?",
          choices: ["Yes.", "No."]
          }
        ]).then(function(answer){
          if (answer.areYouSure === "Yes.") {
    	   		updateStock(parseInt(answer.quantity), parseInt(answer.selectID));
          } else {
            mainMenu();
          }
    	   });
    }

function updateStock(quantity, item){
      connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE tem_id=?;", [quantity, item], function(err, res){
        if (err){
          throw err;
        } else {
          console.log("Stock updated. Thanks.");
          setTimeout(mainMenu, 3000);
        }
      })
    }

function productToBeAdded() {
  inquirer.prompt([
	    {
	      type: "input",
	      name: "whatProduct",
	      message: "What is the name of the product you're adding?",
	    },
	    {
	      type: "rawlist",
	      name: "whatDepartment",
	      message: "What department will this be sold in?",
        choices: ["Electronics", "Clothing"]
	    },
	    {
	      type: "input",
	      name: "whatCost",
	      message: "What is the cost of the product?",
	    },
	    {
	    type: "input",
	      name: "whatStock",
	      message: "How many are you adding to stock?",
	    }
    ]).then(function(answer){
	   		addNewProduct(answer.whatProduct, answer.whatDepartment, answer.whatCost, answer.whatStock);
	   });
}

function addNewProduct(item, department, price, stock){
  var price = parseInt(price);
  var stock = parseInt(stock);
  connection.query("INSERT INTO products SET ?", {product_name: item, department_name: department, price: price, stock_quantity: stock}, function (err,res){
		if (err) {
			throw err;
		} else {
      console.log("The product has been added to the inventory, thank you.")
			setTimeout(mainMenu, 3000);
		};
	});
}
