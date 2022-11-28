const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hmhhmh5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
    try{

        const categoryCollection = client.db('readerspick').collection('category');
        const booksCollection = client.db('readerspick').collection('books');
        const usersCollection = client.db('readerspick').collection('users');
        const bookingsCollection = client.db('readerspick').collection('bookings');


        app.get('/category', async (req, res) => {
            const query = {};
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories);
        })
        app.get('/allbooks', async (req, res) => {
            const query = {};
            const allBooks = await booksCollection.find(query).toArray();
            res.send(allBooks);
        })
        app.get('/category/:name', async (req, res) => {
            const pname = req.params.name;
            const filter = {category:pname };
            const result = await booksCollection.find(filter).toArray();
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.get('/bookings', async (req, res) => {
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const query = {
                itemName:booking.itemName,
                email: booking.email,
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already booked ${booking.itemName}`
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

    }
    finally{

    }
}
run().catch(console.log)

app.get('/', async (req, res) => {
    res.send('Readers pick server is running');
})

app.listen(port, () => console.log(`Readers pick running on ${port}`))