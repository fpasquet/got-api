const swaggerJSDoc = require("swagger-jsdoc");
const components = require("./components");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Game Of Throne",
      description: "Scraping data from the site https://awoiaf.westeros.org",
      version: "0.5.0"
    },
    servers: [
      {
        url: "http://localhost:8080/api",
        description: "Dev server (uses test data)"
      },
      {
        url: "https://game-of-throne-api.appspot.com/api",
        description: "Sandbox server (uses test data)"
      },
    ],
    components
  },
  apis: ["./swagger/*.yaml"]
};

module.exports = swaggerJSDoc(options);
