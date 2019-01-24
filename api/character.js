const path = require("path");
const fs = require("fs");
const { pick } = require("lodash");
const CharacterSchema = require("../swagger/components/character");

module.exports = api => {
  const characterProperties = Object.keys(CharacterSchema.properties).reduce(
    (acc, propertyName) => {
      acc[propertyName] = null;
      return acc;
    },
    {}
  );

  let characters = fs.readFileSync(path.resolve("./data/characters.json"));
  characters = JSON.parse(characters);

  const ResourceNotFound = (slug, res) => {
    res.status(404).send({
      error: {
        status: 404,
        message: `The character with the slug \`${slug}\` doesn't exist.`
      }
    });
  };

  api.get("/characters", (req, res) =>
    res.send(
      characters.map(character => ({ ...characterProperties, ...pick(character, Object.keys(characterProperties)) }))
    )
  );

  api.get("/character/:key", ({ params: { key } }, res) => {
    let character = characters.find(character => character.key === key);
    if (!character) {
      return ResourceNotFound(key, res);
    }
    return res.send({ ...characterProperties, ...pick(character, Object.keys(characterProperties)) });
  });

  return api;
};
