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


export const idCheck = (res, id, table) => {
    let checkId = `SELECT * FROM ${table} WHERE id = ${id}`
    const checed = () => {
        db.query(checkId, (err, resultCheckGroup) => {
            if (err) throw err
            //id check
            if (resultCheckGroup.length === 0) {
                //console.log(`There is no group with the id: ${id}`)
                // res.status(400).send(`There is no group with the id: ${id}`)
                return "falmbekgfiuse"
            }
            return "truecebkf"
        })
        //return "niorgh84hf984hg98"
    }
    return checed
}
export const createGroup = (data, res) => {
    if (!Object.hasOwn(data, "name") || !Object.hasOwn(data, "size")) {
        console.log(`The information received is incorrect ${JSON.stringify(data)}`)
        res.status(400).send(`The information received is incorrect ${JSON.stringify(data)}`)
        return
    }
    if (!data["name"] || data["name"].length == 0 || !data["size"] || data["size"] < 1) {
        console.log(`It is not possible to accept a group without a name and size `);
        res.status(400).send(`It is not possible to accept a group without a name and size`)
        return
    }
    let sql = `INSERT INTO queue (name, size, queue, GroupSeqNo) VALUES ('${data.name || ""}', ${data.size || 1}, "AwaitSit", ${Date.now() || 123456789} )`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`The group ${data.name}, was successfully absorbed`);
        res.send(`The group ${data.name}, was successfully absorbed`)
    });
}

export const readGroups = (res) => {
    db.query(`SELECT * FROM queue`, (err, result) => {
        if (err) throw err
        res.send(result)
    });
}

export const readGroupByID = (res, id) => {
    //console.log(idCheck(res, id, 'queue'))
    if (id == "AwaitSit" || id == "AwaitService" || id == "AwaitBill") {
        db.query(`SELECT * FROM queue WHERE queue = '${id}'`, (err, result) => {
            if (err) throw err;
            res.send(result)
            return
        });
    }
    else {
        db.query(`SELECT * FROM queue WHERE id = '${id}'`, (err, result) => {
            if (err) throw err
            res.send(result)
            return
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
        if (groupToDelete["dishes"] == '{"0":0}' && groupToDelete["queue"] == "AwaitBill" || groupToDelete["dishes"] == null && groupToDelete["queue"] == "AwaitSit") {
            db.query(`DELETE FROM queue WHERE id = '${id}'`, (err, deleteResult) => {
                if (err) throw err;
                console.log(deleteResult);
                db.query(`UPDATE tables SET GroupSeqNum = 0 WHERE GroupSeqNum = '${groupToDelete["GroupSeqNo"]}'`,
                    (err, updateResult) => {
                        if (err) throw err;
                        console.log(`the group ${groupToDelete["name"]} is deleted`);
                        res.send(`the group ${groupToDelete["name"]} is deleted`)
                        return
                    });
            })
        }
        else {
            console.log(`the group ${groupToDelete["name"]} have not finished eating`)
            res.status(403).send(`the group ${groupToDelete["name"]} have not finished eating`)
            return;
        }
    })
}


export const updateGroup = (res, id, data) => {
    let checkGroup = `SELECT * FROM queue WHERE id = ${id}`
    db.query(checkGroup, (err, resultCheckGroup) => {
        if (err) throw err
        //id check
        if (resultCheckGroup.length === 0) {
            console.log(`There is no group with the id: ${id}`)
            res.status(400).send(`There is no group with the id: ${id}`)
            return;
        }
        let groupToUpdate = resultCheckGroup[0]
        //status group check
        if (groupToUpdate["queue"] != "AwaitService") {
            console.log(`It is not possible to order because you are currently in ${groupToUpdate["queue"]}`)
            res.status(403).send(`It is not possible to order because you are currently in ${groupToUpdate["queue"]}`)
            return;
        }

        //Checking information coming from the client
        for (let [key, value] of Object.entries(data.dishes)) {
            if (typeof value != "number") {
                console.log(`Non-numeric values cannot be updated ${value} is not number it ${typeof value}`)
                res.status(403).send(`Non-numeric values cannot be updated ${value} is not number it ${typeof value}`)
                return;
            }
            if (value < 0) {
                console.log(value, "< 0")
                res.status(403).send(`It is not possible to update minus portions`)
                return;
            }
            if (value % 1 !== 0) {
                console.log(value, "Incomplete numbers cannot be updated")
                res.status(403).send("Incomplete numbers cannot be updated")
                return;
            }
        }
        //check Equality between object
        if (groupToUpdate["dishes"] != null) {
            const json = JSON.parse(groupToUpdate["dishes"])
            const assign = Object.assign({}, json, data.dishes)
            for (let key of Object.keys(assign)) {
                if (json[key] > assign[key]) {
                    console.log(`An existing order cannot be reduced\n ${json[key]} > ${assign[key]}`)
                    res.status(403).send(`An existing order cannot be reduced`)
                    return
                }
            }
        }
        //######i need to check if the dish exists before updating #####
        console.log("i need to check if the dish exists before updating")
        let dataToUpdate = `UPDATE queue SET dishes = '${JSON.stringify(data.dishes) || groupToUpdate["dishes"]}' WHERE id = '${id}'`;
        db.query(dataToUpdate, (err, resultUpdating) => {
            if (err) throw err;
            console.log(resultUpdating);
            res.send(resultUpdating)
            return
        });
    })
}


//i need to check the general price to pay
//i need to check if the dish exists before updating
export const beyondPayment = (req, res) => {
    console.log(`i need to check the general price to pay\n
    i need to check if the dish exists before updating`)
    let id = req.params.id
    let dataToUpdate = `UPDATE queue SET dishes = '{"0":0}', queue = "AwaitBill" WHERE id = '${id}'`;
    db.query(dataToUpdate, (err, result) => {
        if (err) throw err;
        res.sendStatus(200)
        return;
    });
}

export const sitGroupByID = (res, id) => {
    let queueData;
    let tableData;
    db.query(`SELECT * FROM queue WHERE id = ${id}`, (err, resultQueue) => {
        if (err) throw err
        if (resultQueue.length === 0) {
            console.log(`There is no group with the id: ${id}`)
            res.status(400).send(`There is no group with the id: ${id}`)
            return;
        }
        queueData = resultQueue[0]
        if (queueData["gropeTable"] != null || queueData["gropeTable"] != undefined) {
            console.log(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
            res.status(400).send(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
            return
        }
        db.query(`SELECT * FROM tables WHERE capacity = ${queueData["size"]} AND GroupSeqNum = 0`, (err, resultTables) => {
            if (err) throw err
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
                console.log(`the table ${tableData["name"]} Caught by ${queueData["name"]}`)
                db.query(queueUpdate, (err, result) => {
                    console.log(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
                    if (err) throw err
                    res.status(200).send(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
                })
            })
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

