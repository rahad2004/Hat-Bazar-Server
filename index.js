const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middelwire
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieparser());

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

// middelwire

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: " unaurhorized access" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unathorized access" });
    }

    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const cetegories = client.db("HatBazar").collection("categories");
    const products = client.db("HatBazar").collection("products");

    //  auth releted api

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // services related api

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

    app.post("/add-product", verifyToken, async (req, res) => {
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

    // my add product

    app.get("/myadd-products/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user.email !== email) {
        return res.status(402).send({ message: " tor acces nai ate" });
      }
      const query = { email: email };
      const result = await products.find(query).toArray();
      res.status(200).send(result);
    });

    // delete my adding product

    app.delete("/removeproduct/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await products.deleteOne(query);
      res.send(result);
    });

    // update product

    app.patch("/update-product/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedata = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updatedata,
      };
      const result = await products.updateOne(filter, updateDoc);
      res.send(result);
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
