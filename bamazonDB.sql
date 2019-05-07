-- For customer and manager js pages 
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
item_id INT AUTO_INCREMENT NOT NULL,
product_name VARCHAR(200) NOT NULL,
department_name VARCHAR(200) NOT NULL,
price DECIMAL (4,2) NOT NULL,
stock_quantity INT NOT NULL,
PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Red Dead Redemption 2", "Video Games", 39.99, 1000), ("JS For Dummies", "Books", 30.99, 500), ("Stand and Deliver", "DVDs", 5.99, 200),
("Vitamin C", "Health & Beauty Products", 14.99, 1000), ("God of War", "Video Games", 34.99, 800), ("Lean on Me", "DVDs", 5.99, 50),
("Resistance Band", "Workout", 12.99, 500), ("Fish Oil", "Health & Beauty Products", 28.99, 900), ("One Hundred Years of Solitude", "Books", 20.99, 300),
("Assassin's Creed Odyssey", "Video Games", 59.99, 10);

-- USE bamazon_db;
-- SELECT * FROM products;

-- End of database work for customer and manager js pages


-- For supervisor js page

USE bamazon_db;

CREATE TABLE departments (
department_id INT AUTO_INCREMENT NOT NULL,
department_name VARCHAR(200) NOT NULL,
over_head_costs DECIMAL (10,2) NOT NULL,
PRIMARY KEY (department_id)

);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Video Games", 10000), ("Books", 5000), ("DVDs", 6000), ("Health & Beauty Products", 8000), ("Workout", 7000), ("Entertainment", 11000), ("Kitchen", 5000);

USE bamazon_db;
ALTER TABLE products
ADD COLUMN product_sales DECIMAL (10,2);

-- USE bamazon_db;
-- ALTER TABLE products MODIFY product_sales DECIMAL (10,2);


-- USE bamazon_db;
-- SELECT * FROM departments;




-- Testing code for joining tables, creating alias and grouping

USE bamazon_db;
SELECT department_id, departments.department_name, over_head_costs, product_sales, product_sales - over_head_costs AS total_proft FROM departments
LEFT JOIN products
ON  departments.department_name = products.department_name
GROUP BY department_id, departments.department_name, product_sales;

-- End of database work for supervisor.js


