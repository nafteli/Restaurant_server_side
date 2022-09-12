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
    console.log("Connected from Tables");
});


export const createTable = (data, res) => {
    console.log(data)
    var sql = `INSERT INTO tables (name, capacity, GroupSeqNum) VALUES ('${data.table || data.name}', ${data.capacity}, 0)`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("record table name is:", data.table || data.name, "capacity is:", data.capacity);
        res.send(data)
    });
}

export const readTable = (res) => {

    db.query(`SELECT * FROM tables`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });

}

export const readTableByID = (res, id) => {
    db.query(`SELECT * FROM tables where id = '${id}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}


export const deleteTableByID = (res, id) => {
    db.query(`DELETE FROM tables where id = '${id}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}


export const updateTable = (res, id, data) => {

    var sql = `update tables set GroupSeqNum = '${data.GroupSeqNum}' where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record updated");
        res.send(result)
    });
}

