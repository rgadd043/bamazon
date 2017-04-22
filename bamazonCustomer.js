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
    console.log("Welcome to Bamazon, where dreams come true!")
    start();
  }
});

// -------------- Functions --------------
// ---- Give user the option to start shopping.
var start = function() {
  inquirer.prompt({
    name: "wantToShop",
    type: "rawlist",
    message: "Would you like to shop at Bamazon?",
    choices: ["Yes, please.", "No, thanks."]
  }).then(function(answer) {
    // based on their answer, either call the bid or the post functions
    if (answer.wantToShop === "Yes, please.") {
      startShopping();
    }
    else {
      console.log("Thank you, come again.")
      return;
    }
  });
};

// ---- Main Function ----

var startShopping = function(){
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    else {
      // Display Inventory
      console.log("----- Bamazon Inventory -----")
      for (var i = 0; i < results.length; i++) {
        console.log("Product ID: " + results[i].tem_id + " | Product: " + results[i].product_name + " | Department: " + results[i].department_name + " | Price: $" + results[i].price.toFixed(2) + " | Stock: " + results[i].stock_quantity);
      }
      console.log("----- End of Inventory -----")
      // Query user for item selection and quantity
      inquirer.prompt([
        {
        name: "itemSelection",
        type: "input",
        message: "Which Product ID do you wish to buy?"
      },
        {
          name: "quantitySelection",
          type: "input",
          message: "How many do you want to buy?"
        }
      ]).then(function(answer){
        connection.query("SELECT * FROM products WHERE tem_id=?", [answer.itemSelection], function(err, res){
          if (err) {
            throw err;
            startShopping();
          }
          if (res.length === 0) {
            console.log("----- ERROR -----")
            console.log("Incorrect Product ID, please try again.")
            startShopping();
          }
          else {
          if (answer.quantitySelection > res[0].stock_quantity) {
              console.log("----- ERROR -----");
              console.log("Sorry, we only have " +res[0].stock_quantity + " in stock. Please enter another quanity.");
              startShopping();
          }
          else {
            var newQuantity = res[0].stock_quantity - answer.quantitySelection;
            var totalCost = res[0].price * answer.quantitySelection;
             connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: newQuantity}, {tem_id: res[0].tem_id}], function(error, result) {
            if (error) {
              throw error
            }
            else {
              console.log("---- Purchase Successful ----");
              console.log("You purchased " + answer.quantitySelection + " " + res[0].product_name + ".");
              console.log("Your credit card has been charged $" + totalCost.toFixed(2) + ". Thanks for shopping at Bamazon.");
              continueShopping();
            }
          });
        };
      };
      });
    });
  };
});
};

// ---- Continue Shopping? ----
var continueShopping = function(){
  inquirer.prompt({
    name: "shopMore",
    type: "rawlist",
    message: "Would you like to place another order?",
    choices: ["Yes, please.", "No, thanks."]
  }).then(function(answer){
    if (answer.shopMore === "Yes, please.") {
      startShopping();
    }
    else {
      console.log("Thank you for shopping at Bamazon!")
      return;
    }
  });
};
