const app = require('express')();
const dotenv = require('dotenv');
const axios = require('axios');
const redis = require('redis');

dotenv.config();

const PORT = process.env.APP_PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const API_URL = "https://jsonplaceholder.typicode.com/albums/";

const redisClient = redis.createClient(REDIS_PORT);

app.get('/', (_, res) => { 
    res.send("Hello from API");
});

app.get('/albums', (_, res) => {
    try {
        axios.get(`${API_URL}`).then((response) => {

            const albums = response.data;
            console.log("Albums successfully retrieved from the API");
            res.status(200).send(albums);

        });
    } catch (error) {
        res.status(500).send({error: error.message});
    }
});

app.listen(PORT, () => console.log(`Server up and running`));