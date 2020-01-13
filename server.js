process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const app = require("./app");
const server = app.listen(3000, function() {
  console.log("Server runing on port 3000");
});
