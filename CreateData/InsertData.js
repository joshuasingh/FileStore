var express = require("express");
var router = express.Router();
var withDb = require("../MongoBridge/MongoConnect");

const insertRoute = router.route("/insert");

var insertData = (typeData, res) => {
  return new Promise((resolve, reject) => {
    withDb(
      (client) => {
        client.insertMany(typeData).then((result, err) => {
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

insertRoute.post(async (req, res) => {
  const typeData = req.body.data;

  try {
    var { insertedCount } = await insertData(typeData, res);
  } catch (e) {
    res
      .status(500)
      .json({ status: "failed", message: "unable to insert Data", report: e });
  }

  res.status(200).json({ status: "success", result: insertedCount });
});

module.exports = router;
