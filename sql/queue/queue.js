import mysql from 'mysql'
import { Router } from "express";
import { readFromSql, idCheck } from '../CRUD.js'
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

export const createGroup = async (data, res) => {
    if (!Object.hasOwn(data, "name") || !Object.hasOwn(data, "size")) {
        console.log(`The information received is incorrect ${JSON.stringify(data)}`)
        return res.status(400).send(`The information received is incorrect ${JSON.stringify(data)}`)
    }
    if (!data["name"] || data["name"].length == 0 || !data["size"] || data["size"] < 1) {
        console.log(`It is not possible to accept a group without a name and size `);
        return res.status(400).send(`It is not possible to accept a group without a name and size`)
    }
    //let sql = `INSERT INTO queue (name, size, queue, GroupSeqNo) VALUES ('${data.name || ""}', ${data.size || 1}, "AwaitSit", ${Date.now() || 123456789} )`;
    const testCreate = await readFromSql(`INSERT INTO queue (name, size, queue, GroupSeqNo) 
        VALUES ('${data.name || ""}', ${data.size || 1}, "AwaitSit", ${Date.now() || 123456789} )`)
    console.log(testCreate)
    console.log(`The group ${data.name}, was successfully absorbed`)
    return res.send(`The group ${data.name}, was successfully absorbed`)
}


export const readGroupByID = async (id, res) => {
    if (id == 'all') {
        return res.send(await readFromSql('SELECT * FROM queue ORDER BY size ASC, GroupSeqNo ASC'))
    }
    if (id == "AwaitSit" || id == "AwaitService" || id == "AwaitBill") {
        let groupData = await readFromSql(`SELECT * FROM queue WHERE queue = '${id}' ORDER BY size ASC, GroupSeqNo ASC`)
        if (groupData.length === 0) return res.send(`There are no groups in status ${id}`)
        return res.send(groupData)
    }
    else {
        const checkID = await idCheck(id, 'queue')
        if (checkID) return res.status(403).send(`${checkID}`)
        return res.send(await readFromSql(`SELECT * FROM queue WHERE id = ${id} ORDER BY size ASC`))

    }
}


export const deleteGroupByID = async (res, id) => {
    let sql = await readFromSql(`SELECT * FROM queue WHERE id = '${id}'`)
    let groupToDelete = sql[0]
    if (groupToDelete["dishes"] == '{"0":0}' && groupToDelete["queue"] == "AwaitBill" || groupToDelete["dishes"] == null && groupToDelete["queue"] == "AwaitSit") {
        let groupToDelete = await readFromSql(`DELETE FROM queue WHERE id = '${id}'`)
        let tableToUPdate = await readFromSql(`UPDATE tables SET GroupSeqNum = 0 WHERE GroupSeqNum = '${groupToDelete["GroupSeqNo"]}'`)
        console.log(`the group ${sql[0]["name"]} is deleted`);
        return res.send(`the group ${sql[0]["name"]} is deleted`)
    }
    else {
        console.log(`the group ${sql[0]["name"]} have not finished eating`)
        return res.status(403).send(`the group ${sql[0]["name"]} have not finished eating`)
    }
}


export const updateGroup = async (res, id, data) => {
    let checkGroup = await readFromSql(`SELECT * FROM queue WHERE id = ${id}`)
    let getMenuToCheckDishes = await readFromSql(`SELECT * FROM menu`)
    console.log(checkGroup, getMenuToCheckDishes)
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
        let totalPrice = 0
        db.query(getMenuToCheckDishes, (err, menuResult) => {
            if (err) return err
            for (let [key, value] of Object.entries(data.dishes)) {
                if (key > menuResult.length) {
                    console.log(`Dish ${key} does not exist`)
                    res.status(403).send(`Dish ${key} does not exist`)
                    return;
                }
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
                totalPrice = totalPrice + menuResult[key]["price"] * value
            }

            //check Equality between object
            if (groupToUpdate["dishes"] != null) {
                const json = JSON.parse(groupToUpdate["dishes"])
                const assign = Object.assign({}, json, data.dishes)
                totalPrice = 0
                for (let [key, value] of Object.entries(assign)) {
                    totalPrice = totalPrice + menuResult[key]["price"] * value
                    if (json[key] > assign[key]) {
                        console.log(`An existing order cannot be reduced\n ${json[key]} > ${assign[key]}`)
                        res.status(403).send(`An existing order cannot be reduced`)
                        return
                    }
                }
            }
            let dataToUpdate = `UPDATE queue SET dishes = '${JSON.stringify(data.dishes) || groupToUpdate["dishes"]}', price = ${totalPrice} WHERE id = '${id}'`;
            db.query(dataToUpdate, (err, resultUpdating) => {
                if (err) throw err;
                console.log(`${groupToUpdate["name"]}'s invitation was successfully received, payable by now: ${totalPrice}`)
                res.send(`${groupToUpdate["name"]}'s invitation was successfully received, payable by now: ${totalPrice}`)
                return
            });
        })
    })
}


export const beyondPayment = (req, res) => {
    let id = req.params.id
    let totalPay = `SELECT * FROM queue WHERE id = ${id}`
    db.query(totalPay, (err, resultTotalPay) => {
        if (err) throw err
        if (resultTotalPay.length === 0) {
            console.log(`There is no group with the id: ${id}`)
            res.status(400).send(`There is no group with the id: ${id}`)
            return;
        }
        let dataToUpdate = `UPDATE queue SET dishes = '{"0":0}', queue = "AwaitBill" WHERE id = '${id}'`
        db.query(totalPay, (err, peyResult) => {
            if (err) throw err
            db.query(dataToUpdate, (err, result) => {
                if (err) throw err;
                console.log(`total payment for group ${resultTotalPay[0]["name"]} is: ${peyResult[0]["price"]}`)
                res.send(`total payment for group ${resultTotalPay[0]["name"]} is: ${peyResult[0]["price"]}`)
                return;
            });
        })
    })
}

export const sitGroupByID = async (res, id) => {
    let queueData;
    let tableData;
    const checkId = await idCheck(id, 'queue')
    if (checkId) {
        console.log(checkId)
        return res.status(400).send(checkId)
    }
    let getGroup = `SELECT * FROM queue WHERE id = ${id}`
    const getGroupToSit = await readFromSql(getGroup)
    queueData = getGroupToSit[0]
    if (queueData["gropeTable"] != null || queueData["gropeTable"] != undefined) {
        console.log(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
        res.status(400).send(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
        return
    }
    let getTable = `SELECT * FROM tables WHERE capacity = ${queueData["size"] || demoSize} AND GroupSeqNum = 0`
    const getTablesSeats = await readFromSql(getTable)
    tableData = getTablesSeats[0]
    if (!tableData) {
        console.log(`There are no available tables for a group size: ${queueData["size"]}`)
        return res.status(400).send(`There are no available tables for a group size: ${queueData["size"]}`)
    }
    let tableDataId = tableData["id"]
    let tableUpdate = `UPDATE tables SET GroupSeqNum = '${queueData["GroupSeqNo"] || null}' WHERE id = '${tableDataId}'`
    let queueUpdate = `UPDATE queue SET queue = "AwaitService" , gropeTable = '${tableData["name"] || null}' WHERE id = ${id}`
    const updateTable = await readFromSql(tableUpdate)
    const updateQueue = await readFromSql(queueUpdate)
    if(!updateTable || !updateQueue) return res.send('Something is wrong')
    console.log(`the table ${tableData["name"]} Caught by ${queueData["name"]}`)
    console.log(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
    return res.status(200).send(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
}

export const updateSql = (groupID, groupName, tableID, tableName) => {
    console.log(tableID, tableName, groupID, groupName)
    let queue = `SELECT * FROM queue WHERE id = ${groupID}`
    let tables = `SELECT * FROM tables WHERE id = ${tableID}`
    // let tableUpdate = `UPDATE tables 
    //     SET GroupSeqNum = '${groupName || 0}' 
    //     WHERE id = '${tableID}' 
    //     AND GroupSeqNum = 0`
    // let queueUpdate = `UPDATE queue 
    //     SET queue = "AwaitService" , gropeTable = '${tableName || null}' 
    //     WHERE id = ${groupID} 
    //     AND gropeTable IS NULL`
    db.query(queue, (err, resultQueue) => {
        if (err) throw err
        if (resultQueue[0]["queue"] === "AwaitSit" && resultQueue[0]["gropeTable"] === null) {
            console.log(resultQueue[0]["queue"], '=== "AwaitSit" &&', resultQueue[0]["gropeTable"], '=== null')
            db.query(tables, (err, resultTables) => {
                if (err) throw err
                if (resultTables[0]["GroupSeqNum"] === 0) {
                    console.log(resultTables[0]["GroupSeqNum"], '=== 0')
                    // db.query(tableUpdate, (err, result) => {
                    //     if (err) throw err
                    //     console.log(`the table ${tableName} Caught by ${groupName}`)
                    //     db.query(queueUpdate, (err, result) => {
                    //         console.log(`the group ${groupName} sitting in table ${tableName}`)
                    //         if (err) throw err
                    //         //res.status(200).send(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
                    //         return
                    //     })
                    // })
                }
                else {
                    console.log("in else", resultTables[0]["GroupSeqNum"])
                }
            })
        }
    })
}

export const sitGroups = async (req, res) => {
    let data;
    let objQueue = {}
    const queueData = await queueToSitGroups(req, res, data, objQueue)
    console.log("queueData:", queueData)
    //     let objTables = {}
    //     let queue = `SELECT * FROM queue WHERE queue = "AwaitSit" ORDER BY size DESC, GroupSeqNo ASC`
    //     db.query(queue, (err, resultQueue) => {
    //         // console.log(resultQueue)
    //         for (let [queueKey, queueValue] of Object.entries(resultQueue)) {
    //             // queueData = queueValue
    //             let tables = `SELECT * FROM tables WHERE GroupSeqNum = 0 ORDER BY capacity ASC`
    //             db.query(tables, (err, resultTables) => {
    //                 // console.log(resultTables)
    //                 for (let [tablesKey, tablesValue] of Object.entries(resultTables)) {
    //                     // tableData = tablesValue
    //                     if (tablesValue["capacity"] >= queueValue["size"]) {
    //                         console.log(`${tablesValue["capacity"]} >= ${queueValue["size"]}`)
    //                         objQueue[`${queueValue["id"]}`] = queueValue["GroupSeqNo"]
    //                         objTables[`${tablesValue["id"]}`] = tablesValue["name"]
    //                         // console.log(objQueue, objTables)
    //                         updateSql(queueValue["id"], queueValue["GroupSeqNo"], tablesValue["id"], tablesValue["name"])
    //                         return
    //                         // console.log("tablesValue:",tablesValue,'queueValue:', queueValue, )
    //                         //tableID, tableName, groupID, groupName
    //                         // console.log("resultTables[tablesKey]:",resultTables[tablesKey], "resultQueue[queueKey]:",resultQueue[queueKey])
    //                         // let tableDataId = tablesValue["id"]
    //                         // let queueDataId = queueValue["id"]
    //                         // let tableUpdate = `UPDATE tables SET GroupSeqNum = '${queueValue["GroupSeqNo"] || 0}' WHERE id = '${tableDataId}' AND GroupSeqNum = 0`
    //                         // let queueUpdate = `UPDATE queue SET queue = "AwaitService" , gropeTable = '${tablesValue["name"] || null}' WHERE id = ${queueDataId} AND gropeTable IS NULL`
    //                         // db.query(tableUpdate, (err, result) => {
    //                         //     if (err) throw err
    //                         //     // console.log(`the table ${tableData["name"]} Caught by ${queueData["name"]}`)
    //                         //     db.query(queueUpdate, (err, result) => {
    //                         //         //console.log(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
    //                         //         if (err) throw err
    //                         //         // sitGroups(req, res)
    //                         //         //res.status(200).send(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
    //                         //     })
    //                         // })
    //                         // break
    //                     }
    //                     console.log("tablesKey:", tablesKey)
    //                 }
    //             })
    //             console.log("queueKey:", queueKey)
    //         }
    //     })
    res.sendStatus(200)
}

export const queueToSitGroups = (req, res, data, objQueue) => {
    let queue = `SELECT * FROM queue WHERE queue = "AwaitSit" ORDER BY size DESC, GroupSeqNo ASC`
    return new Promise((resolve, reject) => {
        db.query(queue, (err, resultQueueToUpdate) => {
            if (err) {
                return reject(err)
            }
            return resolve(resultQueueToUpdate)
            // console.log(resultQueueToUpdate)
            // data = resultQueueToUpdate
            // // console.log(data)
            // for (let [queueKey, queueValue] of Object.entries(resultQueueToUpdate)) {
            //     objQueue[`${queueValue["id"]}`] = queueValue
            //     console.log("objQueue:", objQueue)
            //     return queueValue
            // }
        })
    })
}

