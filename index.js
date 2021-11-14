const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjzgz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("timeLux");
    const productCollection = database.collection("products");
    const clientReviewCollection = database.collection("clientReviews");
    const orderCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    console.log("database connected successfully");

    // Order POST API
    app.post("/orders", async (req, res) => {
      const order = req.body;

      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // orders GET API
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (email) {
        let query = { email: email };
        const cursor = orderCollection.find(query);
        const products = await cursor.toArray();
        res.json(products);
      } else {
        const cursor = orderCollection.find({});
        const products = await cursor.toArray();
        res.json(products);
      }
    });

    // order DELETE API
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // product add POST API
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    // proucts GET API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // product DELETE API
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // single product GET API
    app.get("/purchage/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // client reviews POST API
    app.post("/client-reviews", async (req, res) => {
      const reviews = req.body;
      const result = await clientReviewCollection.insertOne(reviews);
      res.json(result);
    });

    // client reviews GET API
    app.get("/client-reviews", async (req, res) => {
      const cursor = clientReviewCollection.find({});
      const clientReviews = await cursor.toArray();
      res.send(clientReviews);
    });

    //  saved users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // users upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // admin email get

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Doctors portal!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
