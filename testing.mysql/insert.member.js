const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createPool({
    database: "dxlampr1_dbappchat",
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: false
})

