import { createGroup, readGroups, readGroupByID, deleteGroupByID, updateGroup } from './queue.js'

export const writeGroupsController = (req, res) => {
    const data = req.body;
    console.log(data)
    try {
        createGroup( data, res)
    } catch (error) {
        console.error(error);
        res.sendStatus(500)

    }
}

export const readGroupsController = (req, res) => {
    try {
        readGroups(res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const readGroupsControllerByID = (req, res) => {
    console.log(req.params.id)
    try {
        readGroupByID(res ,req.params.id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const deleteGroupsControllerByID = (req, res) => {
    console.log(req.params.id)
    try {
        deleteGroupByID(res ,req.params.id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const updateGroupsController = (req, res) => {
    console.log(req.params.id)
    const data = Date.now()
    try {
        updateGroup(res, req.params.id, data)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}


