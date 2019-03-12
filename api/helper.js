const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { pick } = require("lodash");
const CharacterSchema = require("../swagger/components/character");
const HouseSchema = require("../swagger/components/house");

let characters = fs.readFileSync(path.resolve(__dirname, "../data/characters.json"));
characters = JSON.parse(characters);

let houses = fs.readFileSync(path.resolve(__dirname, "../data/houses.json"));
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
  let {
    culture,
    race,
    father,
    mother,
    spouse,
    issues,
    royalHouse,
    allegiances
  } = character;

  if (culture) {
    properties.culture = culture ? culture.value : null;
  }

  if (race) {
    properties.race = race ? race.value : null;
  }

  if (father) {
    properties.father = pick(findCharacterByHref(father.href), [
      "key",
      "name",
      "imageUrl"
    ]);
  } else {
    const parents = characters.filter(currentCharacter => {
      return (
        currentCharacter.issues &&
        currentCharacter.issues.find(child => child.href === character.url)
      );
    });
  }

  if (mother) {
    properties.mother = pick(findCharacterByHref(mother.href), [
      "key",
      "name",
      "imageUrl"
    ]);
  }

  if (spouse) {
    properties.spouse = pick(findCharacterByHref(spouse.href), [
      "key",
      "name",
      "imageUrl"
    ]);
  }

  if (royalHouse) {
    properties.royalHouse = pick(findHouseByHref(royalHouse.href), [
      "key",
      "name",
      "imageUrl"
    ]);
  }

  if (allegiances) {
    properties.allegiances = allegiances.map(allegiance =>
      pick(findHouseByHref(allegiance.href), ["key", "name", "imageUrl"])
    );
  }

  if (issues) {
    properties.childrens = issues.map(child =>
      pick(findCharacterByHref(child.href), ["key", "name", "imageUrl"])
    );
  }

  return {
    ...characterProperties,
    ...properties
  };
};

const transformHouse = house => {
  let properties = pick(house, Object.keys(houseProperties));
  let { lord, founder } = house;

  if (founder) {
    properties.founder = pick(findCharacterByHref(founder.href), [
      "key",
      "name",
      "imageUrl"
    ]);
  }

  if (lord) {
    properties.lord = pick(findCharacterByHref(lord.href), [
      "key",
      "name",
      "imageUrl"
    ]);
  }

  return {
    ...houseProperties,
    ...properties
  };
};

module.exports = {
  characters,
  houses,
  transformCharacter,
  transformHouse
};
