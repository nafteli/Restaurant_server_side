import { writeDb, readDb, readDbByID, deleteDbByID, updateDb } from "./sqlDB.js";

export const writeDbController = (req, res) => {
    const data = req.body;
    try {
        writeDb( data, res)
    } catch (error) {
        console.error(error);
        res.sendStatus(500)

    }
}

export const readDbController = (req, res) => {
    try {
        readDb(res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const readDbControllerByID = (req, res) => {
    console.log(req.params.id)
    try {
        readDbByID(res ,req.params.id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const deleteDbControllerByID = (req, res) => {
    console.log(req.params.id)
    try {
        deleteDbByID(res ,req.params.id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const updateDbController = (req, res) => {
    console.log(req.params.id)
    const data = Date.now()
    try {
        updateDb(res, req.params.id, data)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}


