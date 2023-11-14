const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createPool({
    database: "dxlampr1_dbappchat",
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: false
})
for (let index = 0; index < 200; index++) {
    // Sinh số ngẫu nhiên từ 1815 đến 2714
    const min = 2414;
    const max = 2714;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomNumber2 = Math.floor(Math.random() * (max - min + 1)) + min;
    if(randomNumber === randomNumber2) continue
    const insertRequest = 'INSERT INTO relationship(relationship.requesterid, relationship.addresseeid, relationship.relation) VALUES (?,?,?)'
    connection.query(insertRequest, [randomNumber, 1, 0])
}