const express = require('express');
const ruta = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const verificarToken = require('../middlewares/auth')
const Usuario = require('../models/usuario_model');

const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(30)
        .required(),

    password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{3,30}$/),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})


ruta.get('/', verificarToken, (req, res) => {
    let resultado = listarUsuariosActivos()
    resultado.then(usuarios => {
        res.json(usuarios)
    }).catch(err => {
        res.status(400).json({
            error: err
        })
    })
})

ruta.post('/', (req, res) => {
    let body  = req.body;
    const {user, err } = Usuario.findOne(body.email)
    if (err) {
        return res.status(400).json({ error: "Server error" })
    }
    if (user) {
        //Usuario si existe
        return res.status(400).json({
            msj: "El usuario ya existe"
        })
    }
    const { error, value } = schema.validate({ nombre: body.nombre, email: body.email })
    if (!error) {
        let resultado = crearUsuario(body);

        resultado.then((user) => {
            res.json({
                nombre: user.nombre,
                email: user.email
            })
        }).catch(err => {
            res.status(400).json({
                error: err
            })
        })
    } else {
        res.status(400).json({
            error: error
        })
    }

})

ruta.put('/:email',verificarToken , (req, res) => {
    const { error, value } = schema.validate({ nombre: req.body.nombre })
    if (!error) {
        let resultado = actualizarUsuario(req.params.email, req.body)
        resultado.then(valor => {
            res.json({
                nombre: valor.nombre,
                email: valor.email
            })
        }).catch(err => {
            res.status(400).json({
                err
            })
        })
    } else {
        res.status(400).json({
            error
        })
    }

})

ruta.delete('/:email',verificarToken ,(req, res) => {
    let resultado = desactivarUsuario(req.params.email);
    resultado.then(valor => {
        res.json({
            nombre: valor.nombre,
            email: valor.email
        })
    }).catch(err => {
        res.status(400).json({
            error: err
        })
    })
})

async function crearUsuario(body) {
    let usuario = new Usuario({
        email: body.email,
        nombre: body.nombre,
        password: bcrypt.hashSync(body.password, 10)
    })
    return await usuario.save();
}

async function listarUsuariosActivos() {
    let usuarios = await Usuario.find({ "estado": true })
        .select({ nombre: 1, email: 1 })
    return usuarios
}

async function actualizarUsuario(email, body) {
    let usuario = await Usuario.findOneAndUpdate({ email: email }, {
        $set: {
            nombre: body.nombre,
            password: body.password,
        }
    }, { new: true })
    return usuario
}

async function desactivarUsuario(email) {
    let usuario = await Usuario.findOneAndUpdate({ email: email }, {
        $set: {
            estado: false
        }
    }, { new: true })
    return usuario
}

module.exports = ruta