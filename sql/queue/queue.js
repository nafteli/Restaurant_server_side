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
    console.log("Connected from Group");
});


export const createGroup = (data, res) => {
    console.log(data)
    // const GroupSeqNo = Date.now()
    // console.log(GroupSeqNo)
    var sql = `INSERT INTO queue (name, size, queue, GroupSeqNo) VALUES ('${data.name}', ${data.size}, "AwaittSit", ${Date.now()} )`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("record group name is:", data.name, "group size is:", data.size);
        res.send(data)
    });
}

export const readGroups = (res, id) => {
    if (id) {
        db.query(`SELECT * FROM tables where id = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }
    else {
        db.query(`SELECT * FROM tables`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }
}

export const readGroupByID = (res, id) => {
    db.query(`SELECT * FROM tables where id = '${id}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}


export const deleteGroupByID = (res, id) => {
    db.query(`DELETE FROM tables where id = '${id}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}


export const updateGroup = (res, id, data) => {

    var sql = `update tables set GroupSeqNum = '${data}' where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record updated");
        res.send(result)
    });
}

