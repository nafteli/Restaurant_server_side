import { writeMenuDb, menu, MenuByID, MenuByCategory, deleteMenuByID, updateMenuDb } from "./menu.js";

export const writeMenuController = (req, res) => {
    const data = req.body;
    try {
        writeMenuDb( data, res)
    } catch (error) {
        console.error(error);
        res.sendStatus(500)

    }
}

export const menuController = (req, res) => {
    try {
        menu(res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const menuByIDController = (req, res) => {
    const id = req.params.id
    try {
        MenuByID(res ,id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const menuByCategoryController = (req, res) => {
    const category = req.params.category
    console.log(category)
    try {
        MenuByCategory(res ,category)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const deleteMenuByIDController = (req, res) => {
    let id = req.params.id
    try {
        deleteMenuByID(res , id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const updateMenuController = (req, res) => {
    const data = req.body
    const id = req.params.id
    try {
        updateMenuDb(res, id, data)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}


