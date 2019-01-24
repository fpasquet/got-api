const cliProgress = require("cli-progress");
const $ = require("cheerio");
const axios = require("axios");

class Scraping {
    constructor() {
        this.endpoint_website = "https://awoiaf.westeros.org";
        this.progress = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
    }

    async getHtml(url) {
        try {
            const html = await axios.get(`${this.endpoint_website}${url}`).then(({ data }) => data);
            return $.load(html);
        } catch (error) {
            if (error.response && error.response.status === 200) {
                return this.getHtml(url);
            }
            return;
        }
    };
}

const generateKey = (value) => Buffer.from(value).toString("base64");
const decodeKey = (key) => Buffer.from(key, "base64").toString("ascii");

module.exports = {
    Scraping,
    generateKey,
    decodeKey
};