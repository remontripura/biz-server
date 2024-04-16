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
        const allCategory = db.collection("category");

        app.get('/', async (req, res) => {
            const result = 'api is runnig on 5000'
            res.send(result)
        })

        app.post('/news', async (req, res) => {
            // const { imageUrl, title1, title2, title3, news1, news2, news3 } = req.body;
            const { title, imageUrl, content, category, deleteApi } = req.body;
            const monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];
            const today = new Date()
            const date = today.getDate();
            const month = today.getMonth();
            const monthName = monthNames[month]
            const year = today.getFullYear();
            const query = { title, imageUrl, content, category, deleteApi, date: { date, monthName, year } }
            const result = await allNews.insertOne(query);
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
                    img: updateClass.imageUrl,
                    content: updateClass.content,
                    title: updateClass.title,
                    category: updateClass.category,
                },
            };
            const result = await allNews.updateOne(filter, classes, options);
            res.send(result)
        })
        app.delete('/news/:id', async (req, res) => {
            const itemId = req.params.id;
            const result = await allNews.deleteOne({ _id: new ObjectId(itemId) });
            res.send(result)
            // try {
            //     const result = await allNews.deleteOne({ _id: new ObjectId(itemId) });
            //     if (result.deletedCount === 1) {
            //         res.status(200).json({ message: 'Item deleted successfully' });
            //     } else {
            //         res.status(404).json({ message: 'Item not found' });
            //     }
            // } catch (error) {
            //     res.status(500).json({ message: 'Internal server error' });
            // }
        });
        // add Category
        // app.post('/category', async (req, res) => {
        //     const { categoryName } = req.body;
        //     const query = { categoryName }
        //     const result = await allCategory.insertOne(query)
        //     res.send(result)
        // })

        app.patch('/news/:id', async (req, res) => {
            const userId = req.params.id;
            const updatedUserData = req.body;
            
            // Validate userId
            if (!ObjectId.isValid(userId)) {
                return res.status(400).json({ error: 'Invalid userId' });
            }
        
            try {
                const filter = { _id: new ObjectId(userId) };
                const updateDoc = { $set: updatedUserData };
        
                const result = await allNews.updateOne(filter, updateDoc);
        
                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: 'News not found' });
                }
        
                // Get the updated news data
                const updatedNews = await allNews.findOne(filter);
                res.json({ message: 'News data updated successfully', updatedNews });
            } catch (error) {
                console.error('Error updating news:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        
        app.get("/category-group", async (req, res) => {
            const pipeline = [
                {
                    $group: {
                        _id: "$category",
                        category: { $first: "$category" },
                        count: { $sum: 1 },
                    },
                },
            ];
            const result = await allNews.aggregate(pipeline).toArray();
            res.send(result);
        });
        app.post('/category', async (req, res) => {
            try {
                const { categoryName } = req.body;
                const existing = await allCategory.findOne({ categoryName })
                if (existing) {
                    return res.status(400).json({ error: 'category already exist' })
                }
                const result = await allCategory.insertOne({ categoryName })
                res.status(201).json(result)
            } catch (error) {
                res.status(500).json({ error })
            }
        })
        app.get('/category', async (req, res) => {
            const result = await allCategory.find().toArray();
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







