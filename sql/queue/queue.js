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
    let sql = `INSERT INTO queue (name, size, queue, GroupSeqNo) VALUES ('${data.name || ""}', ${data.size || 1}, "AwaitSit", ${Date.now() || 123456789} )`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("record group name is:", data.name, "group size is:", data.size);
        res.send(data)
    });
}

export const readGroups = (res) => {
    db.query(`SELECT * FROM queue`, (err, result) => {
        if (err) throw err;
        console.log(result.length);
        res.send(result)
    });
}

export const readGroupByID = (res, id) => {
    if (id == "AwaitSit" || id == "AwaitService" || id == "AwaitBill") {
        db.query(`SELECT * FROM queue WHERE queue = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log("result:", result);
            res.send(result)
        });
    }
    else {
        db.query(`SELECT * FROM queue WHERE id = '${id}'`, (err, result) => {
            if (err) throw err;
            res.send(result)
            //console.log("result:", result);
            // return result
        });
    }
}


export const deleteGroupByID = (res, id) => {
    let paymentCheck = `SELECT * FROM queue WHERE id = '${id}'`
    db.query(paymentCheck, (err, resultCheck) => {
        if (err) throw err
        if (resultCheck.length === 0) {
            console.log(`There is no group with the id: ${id}`)
            res.status(400).send(`There is no group with the id: ${id}`)
            return;
        }
        let groupToDelete = resultCheck[0]
        console.log(groupToDelete["dishs"] != "paiUp", groupToDelete["queue"] != "AwaitBill")
        if (groupToDelete["dishs"] != "paiUp" && groupToDelete["queue"] != "AwaitBill") {
            console.log(`the group ${groupToDelete["name"]} have not finished eating`)
            res.status(403).send(`the group ${groupToDelete["name"]} have not finished eating`)
            return;
        }
        console.log(resultCheck)
        db.query(`DELETE FROM queue WHERE id = '${id}'`, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.send(result)
            db.query(`UPDATE tables SET GroupSeqNum = 0 WHERE GroupSeqNum = '${groupToDelete["GroupSeqNo"]}'`,
                (err, result) => {
                    if (err) throw err;
                    console.log(result);
                    return res.send(result)
                });
        })

    })
}


export const updateGroup = (res, id, data) => {
    let checkGroup = `SELECT * FROM queue WHERE id = ${id}`
    db.query(checkGroup, (err, resultCheckGroup) => {
        if (err) throw err
        if (resultCheckGroup.length === 0) {
            console.log(`There is no group with the id: ${id}`)
            res.status(400).send(`There is no group with the id: ${id}`)
            return;
        }
        let groupToUpdate = resultCheckGroup[0]
        console.log(groupToUpdate["queue"] == "AwaitService")
        if (groupToUpdate["queue"] != "AwaitService") {
            console.log(`It is not possible to order because you are currently in ${groupToUpdate["queue"]}`)
            res.status(403).send(`It is not possible to order because you are currently in ${groupToUpdate["queue"]}`)
            return;
        }
        let json = JSON.parse(groupToUpdate["dishs"])
        console.log(typeof data.dishs ,data.dishs)
        // console.log(_.isEqual(json, data.dishs))
        // res.send(JSON.stringify( data.dishs))
        let dataToUpdate = `UPDATE queue SET dishs = '${JSON.stringify(data.dishs) || groupToUpdate["dishs"]}' WHERE id = '${id}'`;
        db.query(dataToUpdate, (err, resultUpdating) => {
            if (err) throw err;
            console.log(resultUpdating);
            res.send(resultUpdating)
        });
    })
}

export const sitGroupByID = (res, id) => {
    let queueData;
    let tableData;
    db.query(`SELECT * FROM queue WHERE id = ${id}`, (err, resultQueue) => {
        console.log("resultQueue:", resultQueue, resultQueue.length, resultQueue.length == 0)
        if (err) throw err
        console.log(err)
        if (resultQueue.length === 0) {
            console.log(`There is no group with the id: ${id}`)
            res.status(400).send(`There is no group with the id: ${id}`)
            return;
        }
        queueData = resultQueue[0]
        console.log(typeof queueData)
        if (queueData["gropeTable"] != null || queueData["gropeTable"] != undefined) {
            console.log(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
            res.status(400).send(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
            return
        }
        db.query(`SELECT * FROM tables WHERE capacity = ${queueData["size"]} AND GroupSeqNum = 0`, (err, resultTables) => {
            if (err) {
                // res.sendStatus(400) 
                throw err
                // return;
            }//throw err

            tableData = resultTables[0]
            if (!tableData) {
                console.log(`There are no available tables for a group size: ${queueData["size"]}`)
                return res.status(400).send(`There are no available tables for a group size: ${queueData["size"]}`)
            }
            let tableDataId = tableData["id"]
            let tableUpdate = `UPDATE tables SET GroupSeqNum = '${queueData["GroupSeqNo"] || null}' WHERE id = '${tableDataId}'`
            let queueUpdate = `UPDATE queue SET queue = "AwaitService" , gropeTable = '${tableData["name"] || null}' WHERE id = ${id}`
            db.query(tableUpdate, (err, result) => {
                if (err) throw err
                db.query(queueUpdate, (err, result) => {
                    if (err) throw err
                })
            })
            res.sendStatus(200)
        })
    });

}

export const sitGroups = (req, res) => {
    db.query(`SELECT * FROM queue`, (err, result) => {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            //console.log(i)
            console.log(result[i]["id"]);
            sitGroupByID(res, result[i]["id"])
        }
        // sitGroupByID(res, 2)
        res.sendStatus(200)
    });
}