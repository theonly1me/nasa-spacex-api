const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const { planets } = require('./planets.mongo');

const isHabitablePlanet = planet => {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
};

const getAllPlanets = async () => {
  return await planets.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  );
};

const savePlanet = async data => {
  try {
    await planets.updateOne(
      {
        keplerName: data.kepler_name,
      },
      {
        keplerName: data.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

const loadPlanetsData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    ).pipe(
      parse({
        comment: '#',
        columns: true,
        delimiter: ',',
      })
        .on('data', async data => {
          if (isHabitablePlanet(data)) {
            savePlanet(data);
          }
        })
        .on('error', err => console.error(err))
        .on('end', async () => {
          const countPlanetsFound = (await getAllPlanets()).length;
          console.log(`${countPlanetsFound} habitable planets found`);
          resolve();
        })
    );
  });
};

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
