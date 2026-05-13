const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = process.env.MONGODB_URI;

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
    const bookingCollection = database.collection("bookings");

    app.post('/destinations', async (req, res) => {
        const newDestination = req.body;
        const result = await collection.insertOne(newDestination);
        res.json(result);
    })

    app.get('/destinations', async (req, res) => {
        const cursor = collection.find({});
        const result = await cursor.toArray();
        res.json(result);
    })
    app.get('/destinations/:id', async (req, res) => {
        const {id} = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await collection.findOne(query);
        res.json(result);
    })
    app.patch('/destinations/:id', async (req, res) => {
        const {id} = req.params;
        const update = req.body;
        const query = { _id: new ObjectId(id) };
        const result = await collection.updateOne(query, {
            $set: update
        });
        res.json(result);
    })
    app.delete('/destinations/:id', async (req, res) => {
        const {id} = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await collection.deleteOne(query);
        res.json(result);
    })
    app.post('/bookings', async (req, res) => {
        const newBooking = req.body;
        const result = await bookingCollection.insertOne(newBooking);
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
    res.send('Wanderlust Server is running!')
);