const { compact } = require("lodash");
const $ = require("cheerio");
const { Scraping, Model, generateKey } = require("./helper");

class House extends Model {}

class HouseScraping extends Scraping {
  constructor() {
    super();
  }

  async getHouse(houseInfo) {
    const $html = await this.getHtmlByUrl(houseInfo.url);

    let house = new House({ info: houseInfo, html: $html });

    house
      .initImage(this.endpoint_website)
      .setAttrs("Seat", "seats")
      .setAttr("Founder", "founder", true)
      .setAttr("Founded", "founded")
      .setAttr("Region", "region")
      .setAttr("Lord", "lord", true)
      .setAttrs("Heir", "heirs", true);
    // .setAttr("Coat of arms", "coatOfArms", false)
    // .setAttr("Words", "words", false)
    // .setAttrs("Cadet Branch", "cadetBranches")
    // .setAttrs("Overlord", "overlords")
    // .setAttrs("Ancestral Weapon", "ancestralWeapons");

    return house.attrs;
  }

  async getHouses() {
    const $html = await this.getHtmlByUrl("/index.php/Houses_of_Westeros");

    let housesInfo = [];
    let $liList = $html("#mw-content-text .navbox-list li").toArray();
    for (let key in $liList) {
      const el = $($liList[key]).find("a");
      const houseInfo = {
        key: generateKey(el.attr("href")),
        url: el.attr("href"),
        name: el.text()
      };
      if (!housesInfo.find(currentHouseInfo => currentHouseInfo.key === houseInfo.key)) {
        housesInfo.push(houseInfo);
      }
    }

    let houses = [];
    this.progress.start(housesInfo.length, 0);
    let housesCurrent = [];
    for (let key in housesInfo) {
      let houseInfo = housesInfo[key];
      const house = this.getHouse(houseInfo);
      housesCurrent.push(house);
      this.progress.increment();
      if (housesCurrent.length % 50 === 49) {
        housesCurrent = await Promise.all(housesCurrent);
        houses = [...houses, ...housesCurrent];
        housesCurrent = [];
      }
    }

    this.progress.stop();

    return compact(houses);
  }
}

module.exports = new HouseScraping();
