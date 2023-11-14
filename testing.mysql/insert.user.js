const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createPool({
    database: "dxlampr1_dbappchat",
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: false
})

// simple query
for (let i = 100; i <= 999; i++) {
    let a = Buffer.from(`${i}`).toString('base64')
    connection.query(
        `INSERT INTO user(user.phone, user.password, user.birthday, user.gender, user.lastname) VALUES (08429436${i}, 1, now(), 0, '${a}')`,
        function (err, results, fields) {
            console.log(err); // results contains rows returned by server
        }
    );
}