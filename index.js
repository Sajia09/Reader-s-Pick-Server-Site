const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hmhhmh5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run(){
    try{

        const categoryCollection = client.db('readerspick').collection('category');
        const booksCollection = client.db('readerspick').collection('books');
        const usersCollection = client.db('readerspick').collection('users');
        const bookingsCollection = client.db('readerspick').collection('bookings');
        
       

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

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
        app.get('/myproducts/:seller', async (req, res) => {
            const pseller = req.params.seller;
            const filter = {seller:pseller};
            const books = await booksCollection.find(filter).toArray();
            res.send(books);
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
        app.get('/users/:role', async (req, res) => {
            const prole = req.params.role;
            const query = {role:prole};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.delete('/users/:role/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

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
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const seller = await usersCollection.findOne(query);
            res.send({ isSeller: seller?.role === 'seller' });
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