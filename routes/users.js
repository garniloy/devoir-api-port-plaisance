var express = require('express');
var router = express.Router();
const authMiddleware = require('../middleware/auth');
const services = require('../services/users')


/* POST login. */
router.post('/login', services.login);



/* GET users listing. */
router.get('/', authMiddleware, services.getAll);

/* POST create user*/
router.post('/', authMiddleware, services.register);

/* GET specific user*/
router.get('/:email', services.getSpecificUser);

/* PUT modify user*/
router.put('/:email', authMiddleware, services.updateUser);

/* DELETE specific user*/
router.delete('/:email', authMiddleware, services.deleteUser);





module.exports = router;
