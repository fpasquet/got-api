const { compact } = require("lodash");
const $ = require("cheerio");
const { Scraping, generateKey } = require("./helper");

class Character {
  constructor({ characterInfo, html }) {
    this.attrs = {};
    this.attrs.key = characterInfo.key;
    this.attrs.url = characterInfo.url;
    this.attrs.name = characterInfo.name;
    this.html = html;
  }

  setAttr(attrValue, attrName, isKey = false) {
    let el = this.html(`table.infobox th:contains("${attrValue}") + td a`);
    if (el.length > 0) {
      if (isKey) {
        this.attrs[attrName] = generateKey(el.attr("href"));
      } else {
        this.attrs[attrName] = el
          .text()
          .replace(/\[\d+\]/g, "")
          .replace(/\([\S\s]+\)/g, "")
          .replace(/[nN]one,/g, "")
          .trim();
      }
    }
    return this;
  }

  setAttrs(attrValue, attrName, isKey = false) {
    let els = this.html(`table.infobox th:contains("${attrValue}") + td`);
    if (els.length > 0) {
      if (isKey) {
        this.attrs[attrName] = els.find("a").toArray().reduce((acc, el) => {
          const href = generateKey($(el).attr("href"));
          if (!href.match(/[\S\s]+#[\S\s]+|#[\S\s]+/)) {
            acc.push(href);
          }
          return acc;
        }, []);
      } else {
        this.attrs[attrName] = els.html().split("<br>").map(html =>
          $(html)
            .text()
            .replace(/\[\d+\]/g, "")
            .replace(/\([\S\s]+\)/g, "")
            .replace(/[nN]one,/g, "")
            .trim()
        );
      }
    }

    return this;
  }

  initImage(websiteUrl) {
    let imageUrl = this.html("table.infobox .infobox-image img").attr("src");
    if (imageUrl) {
      this.attrs.imageUrl = `${websiteUrl}${imageUrl}`;
    }
    return this;
  }

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
    const $html = await this.getHtml(characterInfo.url);
    if (!$html) {
      return;
    }

    let character = new Character({ characterInfo, html: $html });

    character
      .initImage(this.endpoint_website)
      // .initBorn()
      // .initDeath()
      .setAttr("Culture", "culture")
      .setAttr("Race", "race")
      .setAttrs("Other Titles", "titles")
      .setAttr("Royal House", "royalHouseKey", true)
      .setAttrs("Allegiance", "allegiancesKey", true)
      .setAttr("Father", "fatherKey", true)
      .setAttr("Mother", "motherKey", true)
      .setAttr("Spouse", "spouseKey", true)
      .setAttr("Queen", "queenKey", true)
      .setAttrs("Issue", "childrensKey", true)
      .setAttrs("Heir", "heirsKey", true);

    if (character.attrs.royalHouse) {
      character.attrs.royalHouse = character.attrs.royalHouse
        .replace("House", "")
        .trim();
    }

    if (character.attrs.spouse) {
      character.attrs.spouse = character.attrs.spouse
        .replace("House", "")
        .trim();
    }

    if (character.attrs.allegiances) {
      character.attrs.allegiances = character.attrs.allegiances.map(
        allegiance => allegiance.replace("House", "").trim()
      );
    }

    return character.attrs;
  }

  async getCharacters() {
    const $html = await this.getHtml("/index.php/List_of_characters");

    const charactersInfo = $html(".mw-parser-output li").toArray().map(el => {
      el = $(el).find("a:first-child");
      return {
        key: generateKey(el.attr("href")),
        name: el.text(),
        url: el.attr("href")
      }
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
