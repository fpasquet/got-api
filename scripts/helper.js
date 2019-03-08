const fs = require("fs");
const crypto = require("crypto");
const cliProgress = require("cli-progress");
const $ = require("cheerio");
const axios = require("axios");
const { mkdirSync } = require("./fs");

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

const generateKey = value => Buffer.from(value).toString("base64");
const decodeKey = key => Buffer.from(key, "base64").toString("ascii");

module.exports = {
  Scraping,
  generateKey,
  decodeKey
};
