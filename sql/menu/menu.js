import mysql from 'mysql'
import { Router } from "express";
const router = Router();
//import express from 'express';

//import app from './index.js'


var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected from menu");
});

// export const createDatabase = (req, res) => {
//     const { dbName } = req.params
//     db.query(`CREATE DATABASE ${dbName}`, (err, result) => {
//         if (err) throw err;
//         console.log(`Database ${dbName} created`);
//     });
// }

export const createMenuTable = (req, res) => {
    const { tableName } = req.params
    console.log(tableName)
    let sql = `CREATE TABLE ${tableName}
     (id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255), size INT, queue VARCHAR(255),GroupSeqNo BIGINT, 
        arrivalTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP, gropeTable VARCHAR(255),
        dishs VARCHAR(255))`
    db.query(sql, (err, result) => {
        if (err) throw err
        console.log(`Table ${tableName} created`)
        res.send(`Table ${tableName} created`)
    });
}

export const writeMenuDb = ( data, res) => {
    let sql = `INSERT INTO menu (category, name, price) VALUES ('${data.category}', '${data.name}', ${data.price})`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("record inserted", data);
        res.send(data)
    });
}

export const menu = (res, id) => {
    db.query(`SELECT * FROM menu`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}

export const MenuByID = (res, id) => {
        db.query(`SELECT * FROM menu where id = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }


export const MenuByCategory = (res, category) => {
    db.query(`SELECT * FROM menu where category = '${category}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}

export const deleteMenuByID = (res, id) => {
    db.query(`DELETE FROM menu where id = '${id}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}


export const updateMenuDb = ( res, id, data) => {

    let sql = `update menu set price = '${data}' where id = '${id}'` ;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("update", data, "in menu id:", id)
        res.send(result)
    });
}

