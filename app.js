const usuarios = require('./routes/usuarios');
const config = require('config');
const cursos = require('./routes/cursos');
const auth = require('./routes/auth');
const express = require('express');
const mongoose = require('mongoose');

//Conectarnos a nuestra base de datos
mongoose.connect(config.get('configDB.HOST'))
    .then(() => console.log('Conectado a la BD'))
    .catch((err) => console.log('No se pudo conectar con MongoDB', err));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/usuarios', usuarios);
app.use('/api/cursos', cursos);
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("api RESTFul ok, y ejecutandose...", port)
})