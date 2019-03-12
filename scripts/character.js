const { compact } = require("lodash");
const $ = require("cheerio");
const { Scraping, Model } = require("./helper");

class Character extends Model {

  initBorn() {
    let bornIn = this.html('table.infobox th:contains("Born in") + td')
      .text()
      .replace(/\[\d+\]/g, "")
      .trim();
    let born = this.html('table.infobox th:contains("Born") + td');

    if (bornIn.length > 0) {
      const matches = bornIn.match(/([\S\s]+), at( [\S\s]+)/);
      if (matches) {
        const [all, dateOfBirth, placeOfBirth] = matches;
        if (placeOfBirth) {
          this.attrs.dateOfBirth = dateOfBirth;
          this.attrs.placeOfBirth = placeOfBirth;
        } else {
          this.attrs.dateOfBirth = all;
        }
      } else {
        this.attrs.dateOfBirth = bornIn;
      }
    } else if (born.length > 0) {
      this.attrs.dateOfBirth = $(born)
        .find("a:first-child")
        .text()
        .trim()
        .replace(/\[\d+\]/g, "");
    }

    return this;
  }

  initDeath() {
    let diedIn = this.html('table.infobox th:contains("Died in") + td')
      .text()
      .replace(/\[\d+\]/g, "")
      .trim();
    let died = this.html('table.infobox th:contains("Died") + td');

    if (diedIn.length > 0) {
      const matches = diedIn.match(/([\S\s]+), at( [\S\s]+)/);
      if (matches) {
        let [all, dateOfDeath, placeOfDeath] = matches;
        if (placeOfDeath) {
          this.attrs.dateOfDeath = dateOfDeath;
          this.attrs.placeOfDeath = placeOfDeath;
        } else {
          this.attrs.dateOfDeath = all;
        }
      } else {
        this.attrs.dateOfDeath = diedIn;
      }
    } else if (died.length > 0) {
      this.attrs.dateOfDeath = $(died)
        .find("a:first-child")
        .text()
        .trim()
        .replace(/\[\d+\]/g, "");
    }

    return this;
  }
}

class CharacterScraping extends Scraping {
  constructor() {
    super();
  }

  async getCharacter(characterInfo) {
    const $html = await this.getHtmlByUrl(characterInfo.url);
    if (!$html) {
      return;
    }

    let character = new Character({ info: characterInfo, html: $html });
    const name = $html("table.infobox caption")
      .text()
      .trim();
    character.attrs.name =
      name && character.attrs.name !== name ? name : character.attrs.name;

    character
      .initImage(this.endpoint_website)
      // .initBorn()
      // .initDeath()
      .setAttr("Culture", "culture", true)
      .setAttr("Race", "race", true)
      .setAttr("Full Name", "fullName")
      .setAttrs("Title", "titles")
      .setAttrs("Alias", "alias")
      .setAttrs("Other Titles", "otherTitles")
      .setAttr("Royal House", "royalHouse", true)
      .setAttrs("Allegiance", "allegiances", true)
      .setAttr("Father", "father", true)
      .setAttr("Mother", "mother", true)
      .setAttr("Spouse", "spouse", true)
      .setAttrs("Consort", "consorts", true)
      .setAttr("Queen", "queen", true)
      .setAttrs("Issue", "issues", true)
      .setAttrs("Heir", "heirs", true)
      .setAttrs("Book", "books")
      .setAttrs("Played by", "playedBy")
      .setAttrs("TV series", "tvSeries");

    // if (character.attrs.royalHouse) {
    //   character.attrs.royalHouse = character.attrs.royalHouse
    //     .replace("House", "")
    //     .trim();
    // }

    // if (character.attrs.spouse) {
    //   character.attrs.spouse = character.attrs.spouse
    //     .replace("House", "")
    //     .trim();
    // }

    // if (character.attrs.allegiances) {
    //   character.attrs.allegiances = character.attrs.allegiances.map(
    //     allegiance => allegiance.replace("House", "").trim()
    //   );
    // }

    return character.attrs;
  }

  async getCharacters() {
    const $html = await this.getHtmlByUrl("/index.php/List_of_characters");

    const charactersInfo = $html(".mw-parser-output li")
      .toArray()
      .map(el => {
        el = $(el).find("a:first-child");
        return {
          name: el.text(),
          url: el.attr("href")
        };
      });

    let characters = [];
    this.progress.start(charactersInfo.length, 0);
    let charactersCurrent = [];
    for (let key in charactersInfo) {
      const characterInfo = charactersInfo[key];
      const character = this.getCharacter(characterInfo);
      charactersCurrent.push(character);
      this.progress.increment();
      if (charactersCurrent.length % 50 === 49) {
        charactersCurrent = await Promise.all(charactersCurrent);
        characters = [...characters, ...charactersCurrent];
        charactersCurrent = [];
      }
    }

    this.progress.stop();

    return compact(characters);
  }
}

module.exports = new CharacterScraping();
