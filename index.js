var http = require("http");
var app = require("express")();
var cors = require("cors");
var bodyParser = require("body-parser");
var insertType = require("./CreateData/InsertData");

//middleware layer
app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: false }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use("/data", insertType);

var port = process.env.Port || 8081;

var server = http.createServer(app);

//server is listening
server.listen(port, () => {
  console.log(`File Store server is up and running ${port}`);
});
