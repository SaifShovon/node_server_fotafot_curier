const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// const uri = "mongodb+srv://fotafot_curier:Ehl99yNeQhz1q29J@cluster0.w8by6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w8by6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("fotafot_curier_db");
        const orderCollection = database.collection("orders");
        const serviceCollection = database.collection("services");
        //get api
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            console.log('user id', id)
            res.send(order)
        })

        app.get('/myorders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = await orderCollection.find(query);
            const orders = await cursor.toArray();
            console.log('email', email)
            res.send(orders)
        })


        //post api
        // create a document to insert
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            console.log('got new Order', req.body);
            console.log('added Order', result);
            res.json(result)
        })
        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            console.log('got new Service', req.body);
            console.log('added Service', result);
            res.json(result)
        })

        //Update API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateOrder.name,
                    billing_address: updateOrder.billing_address,
                    shipping_address: updateOrder.shipping_address,
                    date: updateOrder.date,
                    quantity: updateOrder.quantity
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            console.log('update', updateDoc);
            res.json(result);
        })
        app.put('/approve_orders/:id', async (req, res) => {
            const id = req.params.id;
            const statusInfo = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    status: statusInfo.status
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            console.log('update', updateDoc);
            res.json(result);
        })

        //delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            console.log('delete', id)
            res.json(result);
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running');
})
app.listen(port, () => {
    console.log('Server Running!!n', port)
})