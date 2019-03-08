const { compact } = require("lodash");
const $ = require("cheerio");

const { Scraping, generateKey } = require("./helper");

class House {
  constructor({ houseInfo, html }) {
    this.attrs = {};
    this.attrs.key = houseInfo.key;
    this.attrs.name = houseInfo.name;
    this.attrs.url = houseInfo.url;
    this.html = html;
  }

  initImage(websiteUrl) {
    let imageUrl = this.html("table.infobox .infobox-image img").attr("src");
    if (imageUrl) {
      this.attrs.imageUrl = `${websiteUrl}${imageUrl}`;
    }
    return this;
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
}

class HouseScraping extends Scraping {
  constructor() {
    super();
  }

  async getHouse(houseInfo) {
    const $html = await this.getHtmlByUrl(houseInfo.url);

    let house = new House({ houseInfo, html: $html });

    house
      .initImage(this.endpoint_website)
      .setAttrs("Seat", "seats")
      .setAttr("Founder", "founder")
      .setAttr("Founded", "founded")
      .setAttr("Region", "region")
      .setAttr("Lord", "lordKey", true)
      .setAttrs("Heir", "heirsKey", true);
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
