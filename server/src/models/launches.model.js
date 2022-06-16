const axios = require('axios');
const { launches } = require('./launches.mongo');
const { planets } = require('./planets.mongo');

const DEFAULT_FLIGHT_NUM = 100;

const getLatestFlightNo = async () => {
  const latestLaunch = await launches.findOne().sort('-flightNumber');
  if (!latestLaunch) return DEFAULT_FLIGHT_NUM;
  return latestLaunch.flightNumber;
};

const getAllLaunches = async (skip, limit) => {
  return await launches
    .find({}, { _id: 0, __v: 0 })
    .limit(limit)
    .skip(skip)
    .sort({ flightNumber: 1 });
};

const saveLaunch = async launch => {
  await launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
};

const scheduleNewLaunch = async launch => {
  const planet = await planets.findOne({ keplerName: launch.target });
  if (!planet) throw new Error('No matching planet found!');

  const newFlightNo = (await getLatestFlightNo()) + 1;

  const newLaunch = {
    ...launch,
    success: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'],
    flightNumber: newFlightNo,
  };
  saveLaunch(newLaunch);
};

const findLaunch = async filter => {
  return await launches.findOne(filter);
};

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
const data = {
  query: {},
  options: {
    pagination: false,
    populate: [
      {
        path: 'rocket',
        select: {
          name: 1,
        },
      },
      {
        path: 'payloads',
        select: {
          customers: 1,
        },
      },
    ],
  },
};

const populateLaunches = async () => {
  const response = await axios.post(SPACEX_API_URL, data);
  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }
  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap(payloads => payloads['customers']);

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      launchDate: launchDoc['date_local'],
      customers,
    };

    //populate launches
    saveLaunch(launch);
  }
};

const loadLaunchData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data is already loaded');
  }

  await populateLaunches();
};

const abortLaunch = async flightNumber => {
  const launch = await launches.findOne({ flightNumber });
  if (!launch) return false;
  await launches.updateOne(
    { flightNumber },
    { upcoming: false, success: false }
  );
  return true;
};

module.exports = {
  loadLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunch,
};
