import express from 'express';

import { createDatabase, createTable } from '../sql/sqlDB.js';
import {
    writeDbController,
    readDbController,
    readDbControllerByID,
    deleteDbControllerByID,
    updateDbController
} from '../sql/controller.js'

//menu import
import { menuController, 
    writeMenuController, 
    menuByCategoryController,
    deleteMenuByIDController
} from '../sql/menu/menuController.js'

//tables import
import { writeTablesController, 
    readTablesController,
    readTablesControllerByID,
    updateTablesController,
    deleteTablesControllerByID
} from '../sql/tables/tablesController.js'

//import groups
import { writeGroupsController, 
    readGroupsController,
    readGroupsControllerByID,
    updateGroupsController,
    deleteGroupsControllerByID
} from '../sql/queue/queueController.js'

const router = express.Router();


router.get('/createDb/:dbName', createDatabase)
router.get('/createTable/:tableName', createTable)
router.get('/tables', readDbController)
router.put('/tables/:id', updateDbController)
router.get('/tables/:id', readDbControllerByID)
router.delete('/tables/:id', deleteDbControllerByID)

//menu router
router.get('/menu', menuController)
router.get('/menu/:category', menuByCategoryController)
router.post('/createDish', writeMenuController)
router.delete('/menu', deleteMenuByIDController)


//tables router
router.get('/tables', readTablesController)
router.get('/tables/:id', readTablesControllerByID)
router.post('/createTable', writeTablesController)
router.put('/updateTable/:id', updateTablesController)
router.delete('deleteTable/:id', deleteTablesControllerByID)


//groups router
router.get('/groups', readGroupsController)
router.get('/groups/:id', readGroupsControllerByID)
router.post('/createGroup', writeGroupsController)
router.put('/updateGroup/:id', updateGroupsController)
router.delete('deleteGroup/:id', deleteGroupsControllerByID)


export default router 