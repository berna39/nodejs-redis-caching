const app = require('express')();
const dotenv = require('dotenv');
const axios = require('axios');
const redis = require('redis');
const database = require('./database/db');

dotenv.config();

const PORT = process.env.APP_PORT || 3000;
const API_URL = "https://jsonplaceholder.typicode.com/albums/";

const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.connect();

app.get('/', (_, res) => { 
    res.send("Hello from API");
});

app.get('/albums', (_, res) => {
    let startDate = new Date();
    let endDate = new Date();
    try {
        axios.get(`${API_URL}`).then((response) => {
            endDate = new Date();
            const albums = response.data;
            res.status(200).send({
                data: albums,
                time: endDate.getTime() - startDate.getTime()
            });
        });
    } catch (error) {
        res.status(500).send({error: error.message});
    }
});

app.get('/albums/:id', (req, res) => {
    const id = req.params.id;
    let startDate = new Date();
    let endDate = new Date();
    try {
        axios.get(`${API_URL}?id=${id}`).then((response) => {
            endDate = new Date();
            const albums = response.data;
            res.status(200).send({
                data: albums,
                time: endDate.getTime() - startDate.getTime()
            });
        });
    } catch (error) {
        res.status(500).send({error: error.message});
    }
});

app.get('/albums-cached/:id', async (req, res) => {
    const id = req.params.id;
    let startDate = new Date();
    let endDate = new Date();
    try {

        const album = await redisClient.get(id);

        if(album !== null)
        {
            endDate = new Date();
            console.log("Album successfully retrieved from Redis");
            res.status(200).send({
                data: JSON.parse(album),
                time: endDate.getTime() - startDate.getTime()
            });
        }
        else
        {
            axios.get(`${API_URL}?id=${id}`).then((response) => {

                endDate = new Date();
                const album = response.data;
                
                if(response.data.length > 0)
                {
                    redisClient.set(id, JSON.stringify(album), {
                        EX: 60, // 1 minute TTL
                        GET: true
                    });
                    
                    console.log("Album successfully retrieved from the API");
            
                    res.status(200).send({
                        data: album,
                        time: endDate.getTime() - startDate.getTime()
                    });
                }
                else
                {
                    res.status(200).send({
                        data: [],
                        time: endDate.getTime() - startDate.getTime()
                    });
                }
            });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/countries/:name', async (req, res)=>{



});

app.listen(PORT, (err) => {
    if(err) console.log(err);
    else console.log(`Server up and running`);
});