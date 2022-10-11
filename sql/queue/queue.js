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
    const testCreate = await SQL(`INSERT INTO queue (name, size, queue, GroupSeqNo) 
        VALUES ('${data.name || ""}', ${data.size || 1}, "AwaitSit", ${Date.now() || 123456789} )`)
    console.log(testCreate)
    console.log(`The group ${data.name}, was successfully absorbed`)
    return res.send(`The group ${data.name}, was successfully absorbed`)
}


export const readGroupByID = async (id, res) => {
    if (id == 'all' || !id) {
        return res.send(await SQL('SELECT * FROM queue ORDER BY size ASC, GroupSeqNo ASC'))
    }
    if (id == "AwaitSit" || id == "AwaitService" || id == "AwaitBill") {
        console.log(id)
        let groupData = await SQL(`SELECT * FROM queue WHERE queue = '${id}' ORDER BY size ASC, GroupSeqNo ASC`)
        //if (groupData.length === 0) return res.send(groupData,`There are no groups in status ${id}`)
        return res.send(groupData)
    }
    else {
        const checkID = await idCheck(id, 'queue')
        if (checkID) return res.status(403).send(`${checkID}`)
        return res.send(await SQL(`SELECT * FROM queue WHERE id = ${id} ORDER BY size ASC`) || '')

    }
}


export const deleteGroupByID = async (res, id) => {
    let sql = await SQL(`SELECT * FROM queue WHERE id = '${id}'`)
    let groupToDelete = sql[0]
    if (groupToDelete["dishes"] == '{"0":0}' && groupToDelete["queue"] == "AwaitBill" || groupToDelete["dishes"] == null && groupToDelete["queue"] == "AwaitSit") {
        let deletedGroup = await SQL(`DELETE FROM queue WHERE id = '${id}'`)
        let tableToUPdate = await SQL(`UPDATE tables SET GroupSeqNum = 0 WHERE GroupSeqNum = '${groupToDelete["GroupSeqNo"]}'`)
        if (!tableToUPdate || !deletedGroup) return res.status(403).send('Something is wrong')
        console.log(`the group ${sql[0]["name"]} is deleted`);
        return res.send(`the group ${sql[0]["name"]} is deleted`)
    }
    else {
        console.log(`the group ${sql[0]["name"]} have not finished eating`)
        return res.status(403).send(`the group ${sql[0]["name"]} have not finished eating`)
    }
}


export const updateGroup = async (res, id, data) => {
    const checkID = await idCheck(id, 'queue')
    if (checkID) return res.status(403).send(`${checkID}`)
    let checkGroup = await SQL(`SELECT * FROM queue WHERE id = ${id}`)
    let getMenuToCheckDishes = await SQL(`SELECT * FROM menu`)
    let groupToUpdate = checkGroup[0]
    //status group check
    if (groupToUpdate["queue"] != "AwaitService") {
        console.log(`It is not possible to order because you are currently in ${groupToUpdate["queue"]}`)
        res.status(403).send(`It is not possible to order because you are currently in ${groupToUpdate["queue"]}`)
        return;
    }


    // //Checking information coming from the client
    let totalPrice = 0
    for (let [key, value] of Object.entries(data.dishes)) {
        if (key > getMenuToCheckDishes.length) {
            console.log(`Dish ${key} does not exist`)
            return res.status(403).send(`Dish ${key} does not exist`)
        }
        if (typeof value != "number") {
            console.log(`Non-numeric values cannot be updated ${value} is not number it ${typeof value}`)
            return res.status(403).send(`Non-numeric values cannot be updated ${value} is not number it ${typeof value}`)
        }
        if (value < 0) {
            console.log(value, "< 0")
            return res.status(403).send(`It is not possible to update minus portions`)
        }
        if (value % 1 !== 0) {
            console.log(value, "Incomplete numbers cannot be updated")
            return res.status(403).send("Incomplete numbers cannot be updated")
        }
        totalPrice = totalPrice + getMenuToCheckDishes[key]["price"] * value
    }
    //check Equality between object
    if (groupToUpdate["dishes"] != null) {
        const json = JSON.parse(groupToUpdate["dishes"])
        const assign = Object.assign({}, json, data.dishes)
        totalPrice = 0
        for (let [key, value] of Object.entries(assign)) {
            totalPrice = totalPrice + getMenuToCheckDishes[key]["price"] * value
            if (json[key] > assign[key]) {
                console.log(`An existing order cannot be reduced\n ${json[key]} > ${assign[key]}`)
                return res.status(403).send(`An existing order cannot be reduced`)
            }
        }
    }
    let dataToUpdate = `UPDATE queue SET dishes = '${JSON.stringify(data.dishes) || groupToUpdate["dishes"]}', price = ${totalPrice} WHERE id = '${id}'`;
    let updateGroup = await SQL(dataToUpdate)
    if (!updateGroup) return res.send('Something is wrong')
    console.log(`${groupToUpdate["name"]}'s invitation was successfully received, payable by now: ${totalPrice}`)
    return res.send(`${groupToUpdate["name"]}'s invitation was successfully received, payable by now: ${totalPrice}`)

}


export const beyondPayment = async (req, res) => {
    let id = req.params.id
    const checkID = await idCheck(id, 'queue')
    if (checkID) return res.status(403).send(`${checkID}`)
    let totalPay = `SELECT * FROM queue WHERE id = ${id}`
    let dataToUpdate = `UPDATE queue SET dishes = '{"0":0}', queue = "AwaitBill" WHERE id = '${id}'`
    let toPay = await SQL(totalPay)
    let update = await SQL(dataToUpdate)
    if (!toPay || !update) return res.send('Something is wrong')
    console.log(`total payment for group ${toPay[0]["name"]} is: ${toPay[0]["price"]}`)
    return res.send(`total payment for group ${toPay[0]["name"]} is: ${toPay[0]["price"]}`)
}

export const sitGroupByID = async (res, id, demoSize) => {
    let queueData;
    let tableData;
    const checkId = await idCheck(id, 'queue')
    if (checkId) return res.status(400).send(checkId)
    let getGroup = `SELECT * FROM queue WHERE id = ${id}`
    const getGroupToSit = await SQL(getGroup)
    queueData = getGroupToSit[0]
    if (queueData["gropeTable"] != null || queueData["gropeTable"] != undefined) {
        console.log(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
        return res.status(400).send(`${queueData["name"]} is already sitting at the table: ${queueData["gropeTable"]}`)
    }
    let getTable = `SELECT * FROM tables WHERE capacity >= ${queueData["size"] || demoSize} AND GroupSeqNum = 0`
    const getTablesSeats = await SQL(getTable)
    tableData = getTablesSeats[0]
    console.log(tableData)
    if (!tableData) {
        console.log(`There are no available tables for a group size: ${queueData["size"]}`)
        return res.status(400).send("No place to sit for any group",`There are no available tables for a group size: ${queueData["size"]}`)
    }
    let tableDataId = tableData["id"]
    let tableUpdate = `UPDATE tables SET GroupSeqNum = '${queueData["GroupSeqNo"] || null}', groupName = '${queueData['name']}' WHERE id = '${tableDataId}'`
    let queueUpdate = `UPDATE queue SET queue = "AwaitService" , gropeTable = '${tableData["name"] || null}' WHERE id = ${id}`
    const updateTable = await SQL(tableUpdate)
    const updateQueue = await SQL(queueUpdate)
    if (!updateTable || !updateQueue) return res.send('Something is wrong')
    console.log(`the table ${tableData["name"]} Caught by ${queueData["name"]}`)
    console.log(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
    return res.status(200).send(`the group ${queueData["name"]} sitting in table ${tableData["name"]}`)
}


export const sitGroups = async (req, res) => {
    let objectToSend = {}
    let groupsSql = `SELECT * FROM queue WHERE queue = "AwaitSit" ORDER BY size DESC, GroupSeqNo ASC`
    let tablesSql = `SELECT * FROM tables WHERE GroupSeqNum = 0 ORDER BY capacity ASC`
    let groups = await SQL(groupsSql)
    let tables = await SQL(tablesSql)
    for (let [groupKey, groupValue] of Object.entries(groups)) {
        for (let [tableKey, tableValue] of Object.entries(tables)) {
            // console.log(groupValue['size'], tableValue['capacity'])
            if (tableValue['capacity'] >= groupValue['size']) console.log(true)
            let groupToSit = await SQL(`SELECT * FROM queue WHERE id = ${groupValue['id']}`)
            let tableToSit = await SQL(`SELECT * FROM tables WHERE id = ${tableValue['id']}`)
            if (groupToSit[0]['gropeTable'] == null && tableToSit[0]['GroupSeqNum'] == 0) {
                let tableUpdate = `UPDATE tables SET GroupSeqNum = '${groupToSit[0]['GroupSeqNo'] || null}' WHERE id = '${tableToSit[0]['id']}'`
                let queueUpdate = `UPDATE queue SET queue = "AwaitService" , gropeTable = '${tableToSit[0]['name'] || null}' WHERE id = ${groupToSit[0]['id']}`
                const updateTable = await SQL(tableUpdate)
                const updateQueue = await SQL(queueUpdate)
                if (!updateTable || !updateQueue) return res.send('Something is wrong')
                objectToSend[`${tableToSit[0]['name']}`] = `the table ${tableToSit[0]['name']} Caught by ${groupToSit[0]["name"]}`
                objectToSend[`${groupToSit[0]["name"]}`] = `the group ${groupToSit[0]["name"]} sitting in table ${tableToSit[0]['name']}`
                console.log(`the table ${tableToSit[0]['name']} Caught by ${groupToSit[0]["name"]}`)
                console.log(`the group ${groupToSit[0]["name"]} sitting in table ${tableToSit[0]['name']}`)
            }
        }
    }
    // console.log("groups:", groups, '\n')
    console.log(objectToSend)
    return res.send(objectToSend)
}