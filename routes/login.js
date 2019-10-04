const expresss = require('express');
const  app = expresss();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        // Generar TOKEN
        var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});


        usuarioDB.password = ':D';
        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });

    });
});

module.exports = app;