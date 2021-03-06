const url = require("url");
const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const api = require("./api");
const flatCacheMiddleware = require("./middlewares/flatCacheMiddleware");

const PORT = process.env.PORT || 8080;
const app = express();

app.use("/api", api(express.Router()));
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(swaggerSpec));

const createServerInfo = server => {
  let serverInfo = ({ address, port } = server.address());
  let hostForUrl = serverInfo.address;
  if (serverInfo.address === "" || serverInfo.address === "::") {
    hostForUrl = "localhost";
  }

  serverInfo.url = url.format({
    protocol: "http",
    hostname: hostForUrl,
    port: serverInfo.port
  });

  return serverInfo;
};

const server = app.listen(PORT, () => {
  const serverInfo = createServerInfo(server);
  console.log(`🚀 Server ready at ${serverInfo.url}`);
});

module.exports = server;