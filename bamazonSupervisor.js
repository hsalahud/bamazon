
const { createConnection } = require('mysql2')
const { prompt } = require('inquirer')
require('console.table')

//creating connection to db
const db = createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Toronto!7',
    database: 'bamazon_db'
})

//Asynchronous function to retrieve deparmentstable from database
//This joints departments table with products table and shows the pertinent columns along with an alias column
async function getDepartments() {
    let response = await new Promise((resolve, reject) => {
        db.query(`SELECT department_id, departments.department_name, over_head_costs, product_sales, product_sales - over_head_costs AS total_proft FROM departments LEFT JOIN products ON  departments.department_name = products.department_name GROUP BY department_id, departments.department_name, product_sales;`, (e, r) => {
            if (e) {
                reject(e)
            } else {
                resolve(r)
            }
        })
    })
    return response
}

//This function displays the info in the getDepartments function using console.table to format it correctly
const viewDepartments = _ => {
    getDepartments()
        .then(r => {
            console.table(r)
            //Once the table displays, we show the supervisor the initial prompt again
            getAction()
        })
}

//This function adds a new department by asking the supervisor two questions
const newDepartment = _ => {
    //The two questions we ask
    prompt([
        {
            type: 'input',
            name: 'department_name',
            message: 'What department would you like to create?'
        },
        {
            type: 'input',
            name: 'over_head_costs',
            message: 'What will the over head cost be of this department?'
        }
    ])

        //Since the information from the prompt returns an object (which we call department) that uses the keys needed to be inserted in the dtabase
        //we directly add that object to the database
        .then(department => {
            db.query('INSERT INTO departments SET ?', department, e => {
                if (e) throw e
                //Confirming with the supervisor that we have added the department.
                console.log('***Successfully added the new department!***')
                //Then we return to the initial prompt
                getAction()
            })
        })
}


//This is the initial question we ask the supervisor. Based on this information, we run different functions
const getAction = _ => {
    //The questions we ask
    prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['View Product Sales by Department', 'Create New Department', 'Exit app']
        }
    ])
        .then(({ action }) => {
            //switch case based on the selection the supervisor makes
            switch (action) {
                case 'View Product Sales by Department':
                    //If the supervisor selects view product sales by department, we run the view departments function
                    viewDepartments()
                    break
                case 'Create New Department':
                    //If the supervisor selects create new department, we run the new department function
                    newDepartment()
                    break
                case 'Exit app':
                     //If the supervisor wishes to exit the app, then we stop prompting the questions and disconnect from the database
                    process.exit()
                default:
                    //If the command the supervisor provides us is incoherent, we display the initial prompt again
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

