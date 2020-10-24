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



const uploadFile = () => {
  fs.readFile("./CsvData/TypeData.csv", (err, data) => {
    if (err) throw err;
    const params = {
      Bucket: "filestoredb", // pass your bucket name
      Key: "contact1.csv", // file will be saved as testBucket/contacts.csv
      Body: data,
    };
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
      console.log(`File uploaded successfully at ${data.Location}`);
    });
  });
};

app.get("/testAws", (req, res) => {
  uploadFile();
  res.send("done");
});

var port = process.env.Port || 8081;

var server = http.createServer(app);

//server is listening
server.listen(port, () => {
  console.log(`File Store server is up and running ${port}`);
});
