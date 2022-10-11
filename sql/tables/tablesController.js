import { createTable, readTable, readTableByID, deleteTableByID, updateTable } from './tables.js'

export const writeTablesController = (req, res) => {
    const data = req.body
    try {
        createTable( data, res)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)

    }
}

export const readTablesController = (req, res) => {
    try {
        readTable(res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const readTablesControllerByID = (req, res) => {
    let id = req.params.id
    try {
        readTableByID(res ,id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const deleteTablesControllerByID = (req, res) => {
    console.log(req.params.id)
    try {
        deleteTableByID(res ,req.params.id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const updateTablesController = (req, res) => {
    console.log(req.params.id)
    const data = req.body
    console.log(data)
    try {
        updateTable(res, req.params.id, data)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}


