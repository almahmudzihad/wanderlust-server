const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = process.env.MONGODB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();
    const database = client.db("wanderlust");
    const collection = database.collection("destinations");

    app.post('/destinations', async (req, res) => {
        const newDestination = req.body;
        const result = await collection.insertOne(newDestination);
        res.json(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/', (req, res) => 
    res.send('Hello World!')
);