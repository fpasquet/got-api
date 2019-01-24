const url = require("url");
const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const api = require("./api");

const PORT = process.env.PORT || 8080;
const app = express();

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", api(express.Router()));

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
