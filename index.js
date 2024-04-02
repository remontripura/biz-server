require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpfli06.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        const db = client.db("newsCollection");
        const allNews = db.collection("news");

        app.post('/news', async (req, res) => {
            // const { imageUrl, title1, title2, title3, news1, news2, news3 } = req.body;
            const body = req.body;
            const date = new Date().toDateString();
            // const query = { imageUrl, title1, title2, title3, news1, news2, news3, date: date }
          
            const result = await allNews.insertOne(body);
            res.send(result)
        })

        app.get('/news', async (req, res) => {
            const result = await allNews.find().toArray();
            res.send(result)
        })

        app.get('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allNews.findOne(query);
            res.send(result)
        })

        app.put('/news/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateClass = req.body;
            const classes = {
                $set: {
                    title1: updateClass.title1,
                    title2: updateClass.title2,
                    title3: updateClass.title3,
                    news1: updateClass.news1,
                    news2: updateClass.news2,
                    news3: updateClass.news3,
                },
            };
            const result = await allNews.updateOne(filter, classes, options);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log("api is runnig on ", port);
})







