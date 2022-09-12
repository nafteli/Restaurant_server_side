import mysql from 'mysql'
import { Router } from "express";
const router = Router();
//import express from 'express';

//import app from './index.js'


let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected!");
});

export const createDatabase = (req, res) => {
    const { dbName } = req.params
    db.query(`CREATE DATABASE ${dbName}`, (err, result) => {
        if (err) throw err;
        console.log(`Database ${dbName} created`);
    });
}

export const createTable = (req, res) => {
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

export const writeDb = ( data, res) => {
    console.log(data.location)


    var sql = `INSERT INTO Restauranttable (location, capacity) VALUES ('${data.location}', ${data.capacity})`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record inserted");
        res.send(data)
    });
}

export const readDb = (res, id) => {
    db.query(`SELECT * FROM tables`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}

export const readDbByID = (res, id) => {
        db.query(`SELECT * FROM tables where id = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }


    export const deleteDbByID = (res, id) => {
        db.query(`DELETE FROM Restauranttable where id = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }


export const updateDb = ( res, id, data) => {

    var sql = `update Restauranttable set GroupSeqNum = '${data}' where id = '${id}'` ;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record updated");
        res.send(result)
    });
}

