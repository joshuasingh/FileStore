var http = require("http");
var app = require("express")();
var cors = require("cors");
var bodyParser = require("body-parser");
var insertType = require("./CreateData/InsertData");
var getData = require("./RetrieveAndStore/GetAndStore");
const fs = require("fs");
const AWS = require("aws-sdk");

//middleware layer
app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: false }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use("/putData", insertType);
app.use("/getData", getData);

var port = process.env.PORT || 8081;

var server = http.createServer(app);

//server is listening
server.listen(port, () => {
  console.log(`File Store server is up and running ${port}`);
});
