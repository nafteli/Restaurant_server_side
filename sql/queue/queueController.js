import {
    createGroup,
    readGroups,
    readGroupByID,
    deleteGroupByID,
    updateGroup,
    sitGroupByID,
    sitGroup
} from './queue.js'

export const writeGroupsController = (req, res) => {
    const data = req.body;
    console.log(data)
    try {
        createGroup(data, res)
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
    let id = req.params.id
    try {
        readGroupByID(res, id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const deleteGroupsControllerByID = (req, res) => {
    console.log(req.params.id)
    try {
        deleteGroupByID(res, req.params.id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const updateGroupsController = (req, res) => {
    let id = req.params.id
    console.log(typeof (id))
    let data = req.body
    try {
        updateGroup(res, id, data)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const sitGroupByIDController = (req, res) => {
    try {
        sitGroupByID(req, res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const sitGroupController = (req, res) => {
    try {
        sitGroup(req, res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}
