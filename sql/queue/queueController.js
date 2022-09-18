import {
    createGroup,
    readGroups,
    readGroupByID,
    deleteGroupByID,
    updateGroup,
    sitGroupByID,
    sitGroups,
    beyondPayment
} from './queue.js'

export const writeGroupsController = (req, res) => {
    const data = req.body
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
    let data = req.body
    try {
        updateGroup(res, id, data)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const sitGroupByIDController = (req, res) => {
    let id = req.params.id
    try {
        sitGroupByID(res, id)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const sitGroupsController = (req, res) => {
    try {
        sitGroups(req, res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}

export const beyondPaymentController = (req, res) => {
    try {
        beyondPayment(req, res)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)

    }
}
