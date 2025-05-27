const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud.k64iglw.mongodb.net/?retryWrites=true&w=majority&appName=simple-crud`;

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
    await client.connect();
    // Send a ping to confirm a successful connection

    const coffeeCollection = client.db("coffeeDB").collection("coffee");

    app.get("/", (req, res) => {
      res.send("Hello from the server!");
    });

    app.get("/coffees",async(req,res)=>{
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post("/coffee/create", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      const insertedCoffee = await coffeeCollection.findOne({
        _id: result.insertedId,
      });
      res.send(insertedCoffee);
    });

    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      if (coffee) {
        res.send(coffee);
      } else {
        res.status(404).send({ message: "Coffee not found" });
      }
    });

    app.put("/coffee/update/:id", async (req, res) => {
      const id = req.params.id;
      const updateCoffee = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateCoffeeData = {
        $set: {
          name: updateCoffee.name,
          quantity: updateCoffee.quantity,
          supplier: updateCoffee.supplier,
          taste: updateCoffee.taste,
          category: updateCoffee.category,
          details: updateCoffee.details,
          photoUrl: updateCoffee.photoUrl,
        },
      };
      const result = await coffeeCollection.updateOne(query,updateCoffeeData, options)
        if (result.modifiedCount > 0) {
            const updatedCoffee = await coffeeCollection.findOne(query);
            res.send(updatedCoffee);
        } else {
            res.status(404).send({ message: "Coffee not found or no changes made" });
        }
    });

    app.delete("/coffee/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await coffeeCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send({ message: "Coffee deleted successfully", result: result });
      } else {
        res.status(404).send({ message: "Coffee not found" });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
  //   finally {
  //     // Ensures that the client will close when you finish/error
  //     await client.close();
  //   }
}
run().catch(console.dir);
