const { characters, transformCharacter } = require("./helper");

module.exports = api => {
  const ResourceNotFound = (slug, res) => {
    res.status(404).send({
      error: {
        status: 404,
        message: `The character with the slug \`${slug}\` doesn't exist.`
      }
    });
  };

  api.get("/characters", (req, res) =>
    res.send(characters.map(character => transformCharacter(character)))
  );

  api.get("/character/:key", ({ params: { key } }, res) => {
    let character = characters.find(character => character.key === key);
    if (!character) {
      return ResourceNotFound(key, res);
    }
    return res.send(transformCharacter(character));
  });

  return api;
};
