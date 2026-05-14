const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

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
const JWKS = createRemoteJWKSet(new URL('http://localhost:3001/api/auth/jwks'));
const verifyToken = async (req, res, next) => {
    const authheader = req?.headers.authorization;
    if (!authheader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authheader.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    
    try {
        const { payload } = await jwtVerify(token, JWKS);
        console.log(token);
        next();
    } catch (error) {
        return res.status(401).send({ message: 'unauthorized access user' });
    }
    
}
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
    app.get('/destinations/:id', verifyToken, async (req, res) => {
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
    app.delete('/destinations/:id' , async (req, res) => {
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
    app.get('/bookings/:userId', async (req, res) => {
        const {userId} = req.params;
        const query = { userId: userId };
        const cursor = bookingCollection.find(query);
        const result = await cursor.toArray();
        res.json(result);
    })
    app.delete('/bookings/:id', async (req, res) => {
        const {id} = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await bookingCollection.deleteOne(query);
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