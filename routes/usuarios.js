// @ts-nocheck

const express = require('express');
const ruta = express.Router();

const Usuario = require('../models/usuario_model');

ruta.get('/', (req,res) => {
    res.json('Listo el GET de usuarios');
})

ruta.post('/', (req, res) => {
    let body = req.body;
    let resultado = crearUsuario(body);

    resultado.then( (user) => {
        res.json({
            valor: user
        })
    }).catch(err => {
        res.status(400).json({
            error: err
        })
    })
})

ruta.put('/:email', (req, res) => {
    let resultado = actualizarUsuario(req.params.email, req.body)
    resultado.then(valor => {
        res.json({
            valor: valor
        })
    }).catch(err => {
        res.status(400).json({
            error: err
        })
    })
})

ruta.delete('/:email',(req,res) => {
    let resultado = desactivarUsuario(req.params.email);
    resultado.then(valor => {
        res.json({
            usuario: valor
        })
    }).catch(err => {
        res.status(400).json({
            error: err
        })
    })
})

async function crearUsuario(body){
    let usuario = new Usuario({
        email: body.email,
        nombre: body.nombre,
        password: body.password
    })
    return await usuario.save();
}

async function actualizarUsuario(email, body){
    let usuario = await Usuario.findOneAndUpdate({email: email}, {
        $set: {
            nombre: body.nombre,
            password: body.password,
        }
    }, { new: true })
    return usuario
}

async function desactivarUsuario(email){
    let usuario = await Usuario.findOneAndUpdate({email:email}, {
        $set: {
            estado: false
        }
    }, { new: true })
    return usuario
}

module.exports = ruta