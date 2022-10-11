import mysql from 'mysql'
import { Router } from "express";
import { SQL, idCheck } from '../CRUD.js'
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


export const createTable = async (data, res) => {
    let sql = `INSERT INTO tables (name, capacity, GroupSeqNum, groupName) VALUES ('${data.table || data.name || 'table'}', ${data.capacity}, 0, '')`
    let create = await SQL(sql)
    if (!create) return res.send('Something is wrong')
    console.log(`record table name is: ${data.table || data.name || 'table'} capacity is: ${data.capacity}`)
    return res.send(`record table name is: ${data.table || data.name || 'table'} capacity is: ${data.capacity}`)
    // db.query(sql, (err, result) => {
    //     if (err) throw err;
    //     console.log("record table name is:", data.table || data.name, "capacity is:", data.capacity);
    //     return res.send(data)
    // })
}

export const readTable = async(res) => {
    let tables = await SQL(`SELECT * FROM tables`)
    if (!tables) return res.send('Something is wrong')
    return res.send(tables)
    // db.query(`SELECT * FROM tables`, (err, result) => {
    //     if (err) throw err
    //     return res.send(result)
    // })

}

export const readTableByID = async(res, id) => {
    let checkID = await idCheck(id)
    if (checkID) return res.status(403).send(`${checkID}`)
    let tablesByID = await SQL(`SELECT * FROM tables where id = '${id}'`)
    if (!tablesByID) return res.send('Something is wrong')
    console.log(tablesByID)
    return res.send(tablesByID)
    // db.query(`SELECT * FROM tables where id = '${id}'`, (err, result) => {
    //     if (err) throw err;
    //     console.log(result);
    //     return res.send(result)
    // });
}


export const deleteTableByID = (res, id) => {
    db.query(`DELETE FROM tables where id = '${id}'`, (err, result) => {
        if (err) throw err
        console.log(result)
        return res.send(result)
    })
}


export const updateTable = (res, id, data) => {

    let sql = `update tables set GroupSeqNum = '${data.GroupSeqNum}' where id = '${id}'`
    db.query(sql, (err, result) => {
        if (err) throw err
        console.log("1 record updated")
        return res.send(result)
    })
}

