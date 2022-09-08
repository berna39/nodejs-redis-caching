const app = require('express')();
const dotenv = require('dotenv');
const axios = require('axios');
const redis = require('redis');

dotenv.config();

const PORT = process.env.APP_PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const API_URL = "https://jsonplaceholder.typicode.com/albums/";

const redisClient = redis.createClient(REDIS_PORT);
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
        console.log(album);

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

                const album = response.data;
                redisClient.set(id, JSON.stringify(album));
                endDate = new Date();

                console.log("Album successfully retrieved from the API");
        
                res.status(200).send({
                    data: album,
                    time: endDate.getTime() - startDate.getTime()
                });
            });
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server up and running`));