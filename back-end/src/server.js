import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

async function start() {
  const url = `mongodb+srv://nickselvitelli:${process.env.MONGO_PASS}@nicks-cluster.heazn9d.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(url);

  await client.connect();
  const db = client.db('fsv-db');

  const app = express();
  app.use(express.json());
  app.use('/images', express.static(path.join(__dirname, '../assets')));

  app.use(express.static(
    path.resolve(__dirname, '../dist'),
    { maxAge: '1y', etag: false}
  ));

  app.get('/api/products', async (req, res) => {
    const products = await db.collection('products').find({}).toArray();
    res.json(products);
  });

  async function populateCartIds(ids) {
    return Promise.all(ids.map(id => db.collection('products').findOne({ id: id })));
  }

  app.get('/api/users/:userId/cart', async (req, res) => {
    const user = await db.collection('users').findOne({ id: req.params.userId });
    const cart = await populateCartIds(user?.cartItems || []);
    res.json(cart);
  });

  app.get('/api/products/:productId', async (req, res) => {
    const productId = req.params.productId;
    const product = await db.collection('products').findOne({ id: productId });
    res.json(product);
  });

  app.post('/api/users/:userId/cart', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.id;

    const existingUser = await db.collection('users').findOne({ id: userId });
    if (!existingUser) {
      await db.collection('users').insertOne({ id: userId, cartItems: [] });
    }

    await db.collection('users').updateOne({ id: userId }, {
      $addToSet: { cartItems: productId }
    })

    const user = await db.collection('users').findOne({ id: userId });
    const cart = await populateCartIds(user?.cartitems || []);
    res.json(cart);
  });

  app.delete('/api/users/:userId/cart/:productId', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    await db.collection('users').updateOne({ id: userId }, {
      $pull: { cartItems: productId }
    })

    const user = await db.collection('users').findOne({ id: userId });
    const cart = await populateCartIds(user?.cartitems || []);
    res.json(cart);
  });


  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  const port = process.env.port || 8000;

  app.listen(port, () => {
    console.log('Server is listening on port ' + port);
  });
}

start();