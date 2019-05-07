//Adding required packages
const { createConnection } = require('mysql2')
const { prompt } = require('inquirer')

//creating connection to db
const db = createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Toronto!7',
  database: 'bamazon_db'
})

//Asynchronous function to retrieve products table from database
async function getInventory() {
  let response = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM products', (e, r) => {
      if (e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
  return response
}

//function to handle requests by customer
//they are first shown the products inventory, and then are asked for a prompt
const iniitatePrompt = _ => {
  getInventory()
    .then(r => {
      r.forEach(({ item_id, product_name, department_name, price, stock_quantity }) => console.log(`
    ----------
      ${product_name} in ${department_name}
      Price: $${price}
      Product ID: ${item_id}
      Items left: ${stock_quantity}
    ----------
  `))
//Two prompts we ask the customer
      prompt([
        {
          type: 'input',
          name: 'selectedID',
          message: 'What is the Product ID of the item you wish to purchase?',
        },
        {
          type: 'input',
          name: 'quantity',
          message: 'How many of this item would you like to purchase?',
        }
      ])
      //based on what the customer enters, we retrieve price and stock information for that item
        .then(({ selectedID, quantity }) => {
          db.query('SELECT * FROM products WHERE ? ', {
            item_id: parseInt(selectedID)
          }, (e, [{ price, stock_quantity }]) => {
            if (e) throw e
            //we check if we have as much stock as the customer requests
            if (parseInt(quantity) <= stock_quantity) {

              //if we do, we update our stocks column and product_sales column
              db.query('UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?', [
                stock_quantity - parseInt(quantity),
                parseFloat(quantity * price),
                (selectedID)
                ], e => {
                if (e) throw e
                  //Confirm that the purchase has been processed.
                  console.log(
                    `Your order has been processed! You will be charged a total of $${parseFloat(quantity * price)}`
                  )
                })
              
            } else {
              //If the customer requests more stock than we have, then we show this message.
              console.log('Sorry, we are low on stock right now')
            }




          })
        })
        .catch(e => console.log(e))

    })
    .catch(e => console.log(e))

}

//running our program in db.connect
db.connect(e => {
  if (e) throw e
  iniitatePrompt()
})
