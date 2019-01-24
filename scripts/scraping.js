const fs = require("fs");

const CharacterScraping = require("./character");
const HouseScraping = require("./house");

(async () => {
  let characters = await CharacterScraping.getCharacters();
  characters = JSON.stringify(characters, null, 2);
  fs.writeFileSync(`${process.cwd()}/data/characters.json`, characters, "utf8");

  let houses = await HouseScraping.getHouses();
  houses = JSON.stringify(houses, null, 2);
  fs.writeFileSync(`${process.cwd()}/data/houses.json`, houses, "utf8");
})();
