const planetsModel = require('../../models/planets.model');

const getAllPlanets = async (req, res) => {
  return res.status(200).json(await planetsModel.getAllPlanets());
};

module.exports = {
  getAllPlanets,
};
