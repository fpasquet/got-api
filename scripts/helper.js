const fs = require("fs");
const crypto = require("crypto");
const cliProgress = require("cli-progress");
const $ = require("cheerio");
const axios = require("axios");
const {  reject, isEmpty } = require("lodash");
const uniqid = require('uniqid');
const { mkdirSync } = require("./fs");

const generateKey = value => Buffer.from(value).toString("base64");
const decodeKey = key => Buffer.from(key, "base64").toString("ascii");
const clearStringToElement = el => {
  return el
    .text()
    .replace(/\[\d+\]/g, "")
    .replace(/\([\S\s]+\)/g, "")
    .replace(/[nN]one,/g, "")
    .replace(/([\w]+:)/g, "")
    .trim();
};

class Model {
  constructor({ info, html }) {
    this.attrs = {};
    this.attrs.key = uniqid();
    this.attrs.name = info.name;
    this.attrs.url = info.url;
    this.html = html;
  }

  setAttr(attrValue, attrName, hasHref = false) {
    let parent = this.html(`table.infobox th:contains("${attrValue}")`);
    if (parent.text().trim() !== attrValue) {
      return this;
    }
    let el = this.html(`table.infobox th:contains("${attrValue}") + td a`);
    if (el.length > 0) {
      if (hasHref) {
        const href = el.attr("href");
        if (!href.match(/[\S\s]+#[\S\s]+|#[\S\s]+/)) {
          this.attrs[attrName] = {
            href,
            value: clearStringToElement(el)
          };
        }
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

  setAttrs(attrValue, attrName, hasHref = false) {
    let els = this.html(`table.infobox th:contains("${attrValue}") + td`);
    if (els.length > 0) {
      if (hasHref) {
        this.attrs[attrName] = els
          .find("a")
          .toArray()
          .reduce((acc, el) => {
            const href = $(el).attr("href");
            if (!href.match(/[\S\s]+#[\S\s]+|#[\S\s]+/)) {
              acc.push({
                href,
                value: clearStringToElement($(el))
              });
            }
            return acc;
          }, []);
      } else {
        this.attrs[attrName] = reject(
          els
            .html()
            .split(/<br>|\s\|\s/)
            .map(html => clearStringToElement($(html))),
          isEmpty
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
}

class Scraping {
  constructor() {
    this.endpoint_website = "https://awoiaf.westeros.org";
    this.progress = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
  }

  getBase64({ data, secret = "secret" }) {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    return hash;
  }

  async getHtmlByUrl(url) {
    const folderName = this.constructor.name;

    const folderAbsolutePath = `${process.cwd()}/temp/${folderName}`;
    const key = this.getBase64({
      data: JSON.stringify({ url }),
      secret: folderAbsolutePath
    });
    const filePath = `${folderAbsolutePath}/${key}.html`;

    if (!fs.existsSync(folderAbsolutePath)) mkdirSync(folderAbsolutePath);

    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, "utf8");
      return $.load(html);
    }

    try {
      const html = await axios
        .get(`${this.endpoint_website}${url}`)
        .then(({ data }) => data);

      fs.writeFileSync(filePath, html, "utf8");
      return $.load(html);
    } catch (error) {
      if (error.response && error.response.status === 200) {
        return this.getHtmlByUrl(url);
      }
      console.log(`Url: ${url}, statusCode: ${error.response.status}`);
      return;
    }
  }
}

module.exports = {
  Scraping,
  Model,
  generateKey,
  decodeKey,
  clearStringToElement
};
