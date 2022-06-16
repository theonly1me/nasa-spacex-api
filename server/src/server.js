const http = require('http');
const app = require('./app');
const { mongoConnect } = require('./utils/mongo');
require('dotenv').config();
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async () => {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Server is up and running on port:${PORT}`);
  });
};

startServer();
