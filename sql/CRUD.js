import mysql from 'mysql'

let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant"
})

db.connect(err => {
    if (err) throw err;
    console.log("Connected!!");
});

export const idCheck = (id, table) => {
    if (typeof id != Number) return(`URL ERROR`)
    let checkIdSql = `SELECT * FROM ${table} WHERE id = ${id}`
    return new Promise((resolve, reject) => {
        db.query(checkIdSql, (error, resultCheckGroup) => {
            if (error) return reject(error)
            if (resultCheckGroup.length === 0) {
                return resolve(`There is no group with the id: ${id}`)
            }
            else return resolve()
        })
    })
}


export const readFromSql = (sql) => {
    console.log(sql)
    return new Promise((resolveRead, reject) => {
        db.query(sql, (error, resultRead) => {
            if (error) reject(error)
            return resolveRead(resultRead)
        })
    })
}
