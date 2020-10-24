var express = require("express");
var router = express.Router();
var withDb = require("../MongoBridge/MongoConnect");
const fs = require("fs");
const path = require("path");
const { resolve } = require("path");

const GetRoute = router.route("/storeData");

//get all the type data from mongodb
var getData = (res) => {
  return new Promise((resolve, reject) => {
    withDb(
      (collection, client) => {
        collection.find({}).toArray((err, result) => {
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
var createCSV = (typeData) => {
  return new Promise((resolve, reject) => {
    const storePath = __dirname + "/../CsvData/TypeData.csv";

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
      resolve("success");
    });
  });
};

GetRoute.get(async (req, res) => {
  try {
    //get data from monog
    var typeData = await getData(res);

    //convert to CSV
    var status = await createCSV(typeData);
  } catch (e) {
    res
      .json({ status: "failed", message: "unable to insert Data", report: e })
      .status(400);
  }

  res.json({ status: "success", result: status }).status(200);
});

module.exports = router;
