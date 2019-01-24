const characterApi = require("./character");
const houseApi = require("./house");

module.exports = api => {
  characterApi(api);
  houseApi(api);
  return api;
};
