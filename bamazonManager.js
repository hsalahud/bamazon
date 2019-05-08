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

//This function restocks items that the manager requests
const addInventory = _ => {
//Two questions we ask to update the database
  prompt([
    {
      type: 'input',
      name: 'selectedID',
      message: 'What is the Product ID of the item you we are restocking?',
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How much incoming inventory are we stocking?',
    }
  ])
  //based on the info the manager gives, we select those rows in the database
    .then(({ selectedID, quantity }) => {
      db.query('SELECT * FROM products WHERE ? ', {
        item_id: parseInt(selectedID)
      }, (e, [{stock_quantity }]) => {
        if (e) throw e
        //once we select the rows, we update them, given the information the manager gave us
        db.query('UPDATE products SET ? WHERE ?', [
          {
            stock_quantity: stock_quantity + parseInt(quantity)
          },
          {
            item_id: parseInt(selectedID)
          }
        ], e => {
          if (e) throw e
          console.log(
            //Note: If I leave stock_quantity + quantity as just stock_quantity, why does it not show me the new quantity?
            //We then confirm that the product has been restocked and how much the total stock is now.
            `Product ID: ${selectedID} has been restocked. Total inventory now is ${stock_quantity + parseInt(quantity)}. View inventory to see changes.`
          )
          getAction()
        })
      })
    })
    .catch(e => console.log(e))
}

//This function adds an entirely new product based on information the manager provides.
const newProduct = _ => {
  //The four questions we ask the manager to add a new product
  prompt ([
    {
    type: 'input',
    name: 'product_name',
    message: 'What is the name of the product?'
  },
  {
    type: 'input',
    name: 'department_name',
    message: 'What department will this product be in?'
  },
  {
    type: 'input',
    name: 'price',
    message: 'What is the unit price of this product?'
  },
  {
    type: 'input',
    name: 'stock_quantity',
    message: 'How much stock do we have of this product?'
  }
])

//Note: If I left the below as an object, will the strings be converted to ints/floats/decimals by themselves? Looks like they are
//Since the information that comes to us through the prompt is an object that matches the columns of the database, we take the object which
//we call product into the database
  .then ( product => {
    db.query ( 'INSERT INTO products SET ?', product, e => {
    if (e) throw e
    //we then confirm that the product has been added and return to the initial initial question
    console.log ('***Successfully added the new product!***')
    getAction()
    })
  })
}


//This is the initial question we ask the manager. Based on this information, we run different functions
const getAction = _ => {
//The question we ask
  prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit app']
    }
  ])
    .then(({ action }) => {
      //switch case for action
      switch (action) {
        //If the manager selected view products, then we retrieve and display info from the getInventory function
        case 'View Products for Sale':
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
      //Then we return to the initial prompt
              getAction()
            })
            .catch(e => console.log(e))
          break
        case 'View Low Inventory':
        //When the manager selects view low inventory, we display products that have a stock quantity of less than or equal to 6
          getInventory()
            .then(r => {
              const stockArr = r.map(({ stock_quantity }) => stock_quantity)
              r.forEach(({ item_id, product_name, department_name, price, stock_quantity }) => {

                if (stock_quantity <= 5) { console.log(
                  `
            ----------
              ${product_name} in ${department_name}
              Price: $${price}
              Product ID: ${item_id}
              Items left: ${stock_quantity}
            ----------
          `
                )}
              })
              //if all the products are sufficiently stocked, then we get a single message stating the below
              if (stockArr.every(stock => stock >= 5)) {
                console.log('Our inventory is currently not low on stock.')
              }
              //Then we return to the initial question
              getAction()
            })
            .catch(e => console.log(e))
          break
        case 'Add to Inventory':
        //If the manager wants to add to inventory, we run the add to inventory function
          addInventory()
          break
        case 'Add New Product':
        //If the manager wants to add a new product, then we run the new product function
          newProduct()
          break
        case 'Exit app':
        //If the manager wishes to exit the app, then we stop prompting the questions and disconnect from the database
          process.exit()
        default:
        //If the command the manager provides us is incoherent, we display the initial prompt again
          getAction()
          break
      }

    })
    .catch(e => console.log(e))

}

//running our program in db.connect
db.connect(e => {
  if (e) throw e
  getAction()
})