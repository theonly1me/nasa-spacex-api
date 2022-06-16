const express = require('express');
const {
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', getAllLaunches);

launchesRouter.post('/', addNewLaunch);

launchesRouter.delete('/:flightNumber', abortLaunch);

module.exports = launchesRouter;
