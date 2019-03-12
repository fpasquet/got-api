const { houses, transformHouse } = require("./helper");

module.exports = api => {
  const ResourceNotFound = (slug, res) => {
    res.status(404).send({
      error: {
        status: 404,
        message: `The house with the slug \`${slug}\` doesn't exist.`
      }
    });
  };

  api.get("/houses", (req, res) =>
    res.send(houses.map(house => transformHouse(house)))
  );

  api.get("/house/:key", ({ params: { key } }, res) => {
    let house = houses.find(house => house.key === key);
    if (!house) {
      return ResourceNotFound(key, res);
    }
    return res.send(transformHouse(house));
  });

  return api;
};
