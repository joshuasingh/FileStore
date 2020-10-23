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

  console.log("in here", typeData);

  try {
    var { ops } = await insertData(typeData, res);
  } catch (e) {
    res
      .json({ status: "failed", message: "unable to insert Data", report: e })
      .status(400);
  }

  res.json({ status: "success", result: ops }).status(200);
});

module.exports = router;
