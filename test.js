const express = require("express");
const bodyparser = require("body-parser");
const { MongoClient } = require("mongodb");

const multer = require("multer");
const upload = multer({ dest: "public/uploads" });
const app = express();
const fs = require("fs");
const path = require("path");

app.use(bodyparser.json());
app.use(express.static("public"));

// app.post("/upload", upload.single("textfile"), (req, res) => {
//   const fileContents = fs.readFileSync(req.file.path, "utf-8");
//   console.log(fileContents);
//   res.send("ok");
// });

const port = 3000;
const client = new MongoClient("mongodb://localhost:27017");

client.connect().then(() => {
  console.log("Connected to MongoDB");
});

app.get("/search", async (req, res) => {
  const term = req.query.q;

  const db = client.db("engine");
  const collection = db.collection("pages");

  const pages = await collection.find({ terms: { $in: [term] } }).toArray();
  res.send(pages);
});

app.listen(port, () => {
  console.log("The server was running on the port:" + port);
});

app.post("/crawl", upload.single("textfile"), async (req, res) => {
  try {
    const title = req.file.originalname;
    const content = fs.readFileSync(req.file.path, "utf-8");

    if (title && content) {
      const db = client.db("engine");
      const collection = db.collection("pages");
      const words = content.split(/\s+/);

      await collection.insertOne({
        title,
        terms: words,
      });

      res.send("File processed and content saved.");
    } else {
      res.status(400).send("Invalid file content or title.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the file.");
  }
});
