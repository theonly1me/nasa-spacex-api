const launchesModel = require('../../models/launches.model');
const getPagination = require('../../utils/query');

exports.getAllLaunches = async (req, res) => {
  const { skip, limit } = getPagination(req.query);
  res.status(200).json(await launchesModel.getAllLaunches(skip, limit));
};

exports.addNewLaunch = async (req, res) => {
  const launch = req.body;

  if (!(launch.mission && launch.rocket && launch.launchDate && launch.target))
    return res.status(400).json({
      error: 'Missing required launch property',
    });

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate))
    return res.status(400).json({
      error: 'Invalid Launch Date',
    });
  await launchesModel.scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

exports.abortLaunch = async (req, res) => {
  const {
    params: { flightNumber },
  } = req;
  const isSuccess = await launchesModel.abortLaunch(+flightNumber);

  return isSuccess
    ? res.status(204).send()
    : res
        .status(404)
        .json(`Launch with flightNumber ${flightNumber} does not exist`);
};
