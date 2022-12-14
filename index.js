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
                album = response.data;
                
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

app.get('/countries', async (_, res) => {
    const countries = await database.fetchAllCountries();
    res.send(countries);
});

app.get('/countries/:name', async (req, res)=>{

    const name = req.params.name;
    let startDate = new Date(); // For metrics
    let endDate = new Date(); // For metrics

    try {
        let country = await redisClient.get(name);
        if(country !== null)
        {
            endDate = new Date();
            console.log("Country successfully retrieved from Redis");
            res.status(200).send({
                data: JSON.parse(country),
                time: endDate.getTime() - startDate.getTime()
            });
        } else {
            country = await database.findCountry(name);
            endDate.getTime();

            redisClient.set(name, JSON.stringify(country), {
                EX: 60, // 1 minute TTL
                GET: true
            });

            console.log("Country successfully retrieved from the Database");
            res.status(200).send({
                data: country[0],
                time: endDate.getTime() - startDate.getTime()
            });
        }
    } catch (error) {
        res.status(500).send({error: error.message});
    }

});

app.listen(PORT, (err) => {
    if(err) console.log(err);
    else console.log(`Server up and running`);
});