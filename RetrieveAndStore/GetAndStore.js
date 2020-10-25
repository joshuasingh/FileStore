var express = require("express");
var router = express.Router();
var withDb = require("../MongoBridge/MongoConnect");
const fs = require("fs");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

//initialize dotenv
dotenv.config();

const GetRoute = router.route("/storeData");

//get all the type data from mongodb
var getData = (types, res) => {
  return new Promise((resolve, reject) => {
    withDb(
      (collection, client) => {
        collection.find({ type: { $in: types } }).toArray((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      },
      res,
      "TypeData"
    );
  });
};

//create csv file of the data
var createCSV = (types, typeData) => {
  return new Promise((resolve, reject) => {
    const fileName =
      "TypeData_" + types.join("_") + "_" + new Date().getTime() + ".csv";

    const storePath = __dirname + "/../CsvData/" + fileName;

    var file = fs.createWriteStream(storePath);
    file.on("error", function (err) {
      reject(err);
    });

    var fileRow = "type,length,breadth,depth\n";
    file.write(fileRow, "utf-8");
    typeData.map((val) => {
      fileRow =
        val.type +
        "," +
        val.length +
        "," +
        val.breadth +
        "," +
        val.depth +
        "\n";
      file.write(fileRow, "utf-8");
    });

    file.end(() => {
      //send the file name
      resolve(fileName);
    });
  });
};

//configuring s3 bucket connection
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

//upload file to AWS s3 bucket
var uploadFile = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile("./CsvData/" + fileName, (err, data) => {
      if (err) {
        reject(err);
      } else {
        //categorize folder according to the date
        var folderName = new Date().toString().slice(0, 10);

        const params = {
          Bucket: "filestoredb", // pass your bucket name
          Key: folderName + "/" + fileName,
          Body: data,
        };
        s3.upload(params, function (Err, data) {
          if (Err) {
            reject(Err);
          } else {
            console.log(`File uploaded successfully at ${data.Location}`);

            //removing the file on  server
            fs.unlinkSync("./CsvData/" + fileName);
            resolve(data.Location);
          }
        });
      }
    });
  });
};

GetRoute.post(async (req, res) => {
  const { types } = req.body;

  try {
    //get data from monog
    const typeData = await getData(types, res);

    //convert to CSV
    const fileName = await createCSV(types, typeData);

    //upload file to AWS s3 bucket
    var fileUri = await uploadFile(fileName);
  } catch (e) {
    res
      .status(500)
      .json({ status: "failed", message: "unable to get Data", report: e });
  }

  res.status(200).json({ status: "success", Uri: fileUri });
});

module.exports = router;
