CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  tem_id integer auto-increment NOT NULL,
  product_name varchar(50) NOT NULL,
  department_name varchar(30) NOT NULL,
  price decimal(5,2) NOT NULL,
  stock_quantity integer(10) default 0,
  primary key (tem_id)
);
