const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 5000;

// middelwire
app.use(cors());
app.use(express.json());

const pass = process.env.DB_PASS;
const user = process.env.DB_USER;
const uri = `mongodb+srv://${user}:${pass}@cluster0.0y0cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const cetegories = client.db("HatBazar").collection("categories");
    const products = client.db("HatBazar").collection("products");

    // get cetegori data

    app.get("/cetegories", async (req, res) => {
      const result = await cetegories.find().toArray();
      res.status(200).send(result);
    });

    // get products data

    app.get("/products", async (req, res) => {
      const result = await products.find().toArray();
      res.status(200).send(result);
    });

    // add a product

    app.post("/add-product", async (req, res) => {
      const data = req.body.updatedata;
      const result = await products.insertOne(data);
      res.send(result);
    });

    // get one product

    app.get("/products/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await products.findOne(query);
      res.status(200).send(result);
    });

    // product get with category

    app.get("/products/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await products.find(query).toArray();
      res.status(200).send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
