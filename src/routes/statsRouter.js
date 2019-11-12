const express = require('express');
const statsController = require('../controllers/stats');

const statsRouter = express.Router();

statsRouter.get('/:userID/stats', statsController.byUser);
statsRouter.get('/:userID/stats/:shortID', statsController.byShortID);

module.exports = statsRouter;
