const express = require("express");
const bodyparser = require("body-parser");
const app = express();
app.use(bodyparser.json());
const port = 3001;
const multer = require("multer");
const upload = multer({ dest: "public/uploads" });
const fs = require("fs");
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

app.post("/parse", upload.single("textfile"), async (req, res) => {
  const context = fs.readFileSync(req.file.path, "utf-8");
  const db = client.db("search");
  const collection = db.collection("pages");

  for (i = 0; i < context.split(",").length; i++) {
    await collection.insertOne({
      names: context.split(",")[i],
    });
  }
});

app.get("/search", async (req, res) => {
  const word = req.query.q;
  const db = client.db("search");
  const collection = db.collection("pages");
  const pages = await collection
    .find({
      names: { $regex: new RegExp(word, "i") },
    })
    .toArray();

  res.send(pages);
});

app.listen(port, () => {
  console.log("server");
});
