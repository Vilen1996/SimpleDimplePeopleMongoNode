const express = require("express");
const bodyparser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
app.use(bodyparser.json());

const port = 3000;
const client = new MongoClient("mongodb://localhost:27017");

client.connect().then(() => {
  console.log("Connected to MongoDB");
});

app.get("/search", async (req, res) => {
  const terms = req.query.q;

  const db = client.db("engine");
  const collection = db.collection("pages");

  const pages = await collection.find({ terms: terms }).toArray();

  return res.send(pages);
});

app.listen(port, () => {
  console.log("The server was running on the port:" + port);
});

app.post("/crawl", async (req, res) => {
  const { title, content } = req.body;
  if (title && content) {
    const db = client.db("engine");
    const collection = db.collection("pages");

    await collection.insertOne({
      title,
      terms: content.split(" "),
    });
    res.send("done");
  }
});
