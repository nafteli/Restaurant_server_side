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
    var sql = `INSERT INTO queue (name, size, queue, GroupSeqNo) VALUES ('${data.name || ""}', ${data.size || 1}, "AwaitSit", ${Date.now() || 123456789} )`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("record group name is:", data.name, "group size is:", data.size);
        res.send(data)
    });
}

export const readGroups = (res, id) => {
    if (id) {
        db.query(`SELECT * FROM queue where id = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }
    else {
        db.query(`SELECT * FROM queue`, (err, result) => {
            if (err) throw err;
            console.log(result);
            return res.send(result)
        });
    }
}

export const readGroupByID = (res, id, result1) => {
    console.log(result1)
    if (id == "AwaitSit" || id == "AwaitService" || id == "AwaitBill") {
        db.query(`SELECT * FROM queue where queue = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log("result:", result);
            return res.send(result)
        });
    }
    else {
        db.query(`SELECT * FROM queue where id = '${id}'`, (err, result) => {
            if (err) throw err;
            res.send(result)
            //console.log("result:", result);
            return result
        });
    }
}


export const deleteGroupByID = (res, id) => {
    db.query(`DELETE FROM queue where id = '${id}'`, (err, result) => {
        if (err) throw err;
        console.log(result);
        return res.send(result)
    });
}


export const updateGroup = (res, id, data) => {
    let sql = `UPDATE queue set gropeTable = '${data.gropeTable || null}' where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record updated");
        res.send(result)
    });
}

export const sitGroupByID = (req, res) => {
    let id = req.params.id
    let queueData;
    let tableData;
    //let sql = `INSERT INTO queue (gropeTable) select (name) from tables `
    // AND gropeTable = 'NULL'
    db.query(`SELECT * FROM queue where id = ${id}`, (err, result) => {
        if (err) throw err
        queueData = result[0]
        if (queueData) {
            console.log(typeof queueData["size"], queueData["size"]);
            // res.send(result)
            //console.log(queueData)
            db.query(`SELECT * FROM tables where capacity = ${queueData["size"]} AND GroupSeqNum = 0`, (err, result) => {
                if (err) {
                    throw err
                }

                tableData = result[0]
                if (tableData) {
                    if (queueData["gropeTable"] != null) { 
                        res.status(400).send(`This group is already sitting at the table: ${queueData["gropeTable"]}`) }
                    else {
                        let tableDataId = tableData["id"]
                        console.log(tableDataId)
                        console.log(queueData, "\n", queueData["gropeTable"])
                        console.log(tableData, "\n", tableData["capacity"])
                        let tableUpdate = `UPDATE tables set GroupSeqNum = '${queueData["GroupSeqNo"] || null}' where id = '${tableDataId}'`
                        db.query(tableUpdate, (err, result) => {
                            if (err) throw err
                        })
                        let queueUpdate = `UPDATE queue set gropeTable = '${tableData["name"] || null}' where id = ${id}`
                        db.query(queueUpdate, (err, result) => {
                            if (err) throw err
                        })
                        res.sendStatus(200)
                    }
                }
                else {
                    res.status(400).send(`There are no available tables for a group size: ${queueData["size"]}`)
                }
                // res.send(result)
                // return queueData
                //return tableData
                // res.sendStatus(400)
            })
            // return queueData
        }
        else {
            res.sendStatus(400).send(`There is no group with the id: ${id}`)
        }

    });

}

export const sitGroup = (req, res) => {

}


// let resu = [];
// let id = req.params.id
// const blaBla = () => {
//     db.query(`SELECT * FROM queue where id = '${id}'`, (err, result) => {
//         if (err) throw err;
//         res.send(result)
//         //console.log("result:", result);
//         return resu.push(result)
//     })
// }
// blaBla()
// console.log(resu)
// //let sql = `UPDATE queue set gropeTable `
