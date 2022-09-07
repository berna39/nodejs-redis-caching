const app = require('express')();
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.APP_PORT || 3000;

app.get('/', (_, res) => { 
    res.send("Hello from API");
 });

 app.listen(PORT, () => console.log(`Server up and running`));