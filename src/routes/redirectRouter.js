const express = require('express');
const redirectController = require('../controllers/redirect');

const redirectRouter = express.Router();

redirectRouter.get('/:shortID', redirectController.handle);
redirectRouter.post('/:userID/new', redirectController.create);

module.exports = redirectRouter;
