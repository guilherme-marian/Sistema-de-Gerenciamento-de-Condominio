import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import apartamentoRouter from './routes/apartamentos.js'
import blocoRouter from './routes/blocos.js';
import moradorRouter from './routes/moradores.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const connection = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio'
});

app.use(apartamentoRouter(connection));
app.use(blocoRouter(connection));
app.use(moradorRouter(connection));

connection.connect (function(err) {
    if(err) {
        console.error("Error: ", err);
        return;
    }
    else {
        console.log("Ok Connection");
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


app.listen(3000, () => {
    console.log('Server running http://localhost:3000');
});
