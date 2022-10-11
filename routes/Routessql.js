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
    readGroupsControllerByID,
    updateGroupsController,
    deleteGroupsControllerByID,
    sitGroupByIDController,
    sitGroupsController,
    beyondPaymentController
} from '../sql/queue/queueController.js'

const router = express.Router();


router.get('/createDb/:dbName', createDatabase)
router.get('/createTable/:tableName', createTable)
// router.get('/tables', readDbController)
// router.put('/tables/:id', updateDbController)
// router.get('/tables/:id', readDbControllerByID)
// router.delete('/tables/:id', deleteDbControllerByID)

//menu router
router.get('/menu', menuController)
router.get('/menu/:category', menuByCategoryController)
router.post(['/createDish', '/menu'], writeMenuController)
router.delete('/menu/:id', deleteMenuByIDController)


//tables router
router.get('/tables', readTablesController)
router.get('/tables/:id', readTablesControllerByID)
router.post(['/createTable', '/tables'], writeTablesController)
router.put('/updateTable/:id', updateTablesController)
router.delete('/deleteTable/:id', deleteTablesControllerByID)


//groups router
router.post(['/createGroup', '/diners'], writeGroupsController)
router.get(['/groups/:id', '/diners/:id', '/diners', '/groups'], readGroupsControllerByID)
router.put('/sitGroups', sitGroupsController)
router.put('/sitGroup/:id',sitGroupByIDController)
router.put('/updateGroup/:id', updateGroupsController)
router.put('/beyondPayment/:id', beyondPaymentController)
router.delete(['/deleteGroup/:id', '/diners/:id'], deleteGroupsControllerByID)


export default router 