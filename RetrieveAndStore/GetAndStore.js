var express = require("express");
var router = express.Router();
var withDb = require("../MongoBridge/MongoConnect");
const fs = require("fs");

const GetRoute = router.route("/storeData");

//get all the type data from mongodb
var getData = (types, res) => {
  return new Promise((resolve, reject) => {
    withDb(
      (collection, client) => {
        collection.find({ type: { $in: types } }).toArray((err, result) => {
          console.log("in array", result);
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
      resolve("success");
    });
  });
};

GetRoute.post(async (req, res) => {
  const { types } = req.body;

  try {
    //get data from monog
    var typeData = await getData(types, res);

    //convert to CSV
    var status = await createCSV(types, typeData);
  } catch (e) {
    res
      .json({ status: "failed", message: "unable to insert Data", report: e })
      .status(400);
  }

  res.json({ status: "success", result: status }).status(200);
});

module.exports = router;
