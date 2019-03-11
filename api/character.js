const path = require("path");
const fs = require("fs");
const { pick } = require("lodash");
const CharacterSchema = require("../swagger/components/character");
const HouseSchema = require("../swagger/components/house");

module.exports = api => {
  let characters = fs.readFileSync(path.resolve("./data/characters.json"));
  characters = JSON.parse(characters);

  let houses = fs.readFileSync(path.resolve("./data/houses.json"));
  houses = JSON.parse(houses);

  const characterProperties = Object.keys(CharacterSchema.properties).reduce(
    (acc, propertyName) => {
      acc[propertyName] = null;
      return acc;
    },
    {}
  );

  const houseProperties = Object.keys(HouseSchema.properties).reduce(
    (acc, propertyName) => {
      acc[propertyName] = null;
      return acc;
    },
    {}
  );

  const findItemByHref = (href, items) =>
    items.find(currentItem => currentItem.url === href);

  const findCharacterByHref = href => findItemByHref(href, characters);
  const findHouseByHref = href => findItemByHref(href, houses);

  const transformCharacter = character => {
    let properties = pick(character, Object.keys(characterProperties));
    let { culture, race, father, mother, spouse, royalHouse, allegiances } = properties;

    if (culture) {
      properties.culture = culture ? culture.value : null;
    }

    if (race) {
      properties.culture = race ? race.value : null;
    }

    if (father) {
      properties.father = pick(
        findCharacterByHref(father.href),
        ["key", "name", "imageUrl"]
      );
    }

    if (mother) {
      properties.mother = pick(
        findCharacterByHref(mother.href),
        ["key", "name", "imageUrl"]
      );
    }

    if (spouse) {
      properties.spouse = pick(
        findCharacterByHref(spouse.href),
        ["key", "name", "imageUrl"]
      );
    }

    if (royalHouse) {
      properties.royalHouse = pick(findHouseByHref(royalHouse.href), [
        "key",
        "name",
        "imageUrl"
      ]);
    }

    if (allegiances) {
      properties.allegiances = allegiances.map(allegiance => pick(findHouseByHref(allegiance.href), [
        "key",
        "name",
        "imageUrl"
      ]));
    }

    return {
      ...characterProperties,
      ...properties
    };
  };

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
