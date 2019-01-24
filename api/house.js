const path = require("path");
const fs = require("fs");
const { pick } = require("lodash");
const HouseSchema = require("../swagger/components/house");

module.exports = api => {
  const houseProperties = Object.keys(HouseSchema.properties).reduce(
    (acc, propertyName) => {
      acc[propertyName] = null;
      return acc;
    },
    {}
  );

  let houses = fs.readFileSync(path.resolve("./data/houses.json"));
  houses = JSON.parse(houses);

  const ResourceNotFound = (slug, res) => {
    res.status(404).send({
      error: {
        status: 404,
        message: `The house with the slug \`${slug}\` doesn't exist.`
      }
    });
  };

  api.get("/houses", (req, res) =>
    res.send(
      houses.map(house => ({ ...houseProperties, ...pick(house, Object.keys(houseProperties)) }))
    )
  );

  api.get("/house/:key", ({ params: { key } }, res) => {
    let house = houses.find(house => house.key === key);
    if (!house) {
      return ResourceNotFound(key, res);
    }
    return res.send({ ...houseProperties, ...pick(house, Object.keys(houseProperties)) });
  });

  return api;
};
