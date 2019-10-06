const expresss = require('express');
const  app = expresss();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');


// ======================================================================
// Autentificación de Google
// ======================================================================
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}


app.post('/google', async (req, res) => {
   let token = req.body.token;
   let googleUser = await verify(token).catch( e => {
           return res.status(403).json({
               ok: false,
               mensaje: 'Token no válido'
           });
       });


   Usuario.findOne({email: googleUser.email }, (err, usuarioDB) => {
      if (err){
          return res.status(500).json({
              ok: false,
              mensaje: 'Usuario no valido'
          });
      }

      if ( usuarioDB ){
          if (usuarioDB.google === false){
              return res.status(500).json({
                  ok: false,
                  mensaje: 'Debes iniciar manualmente'
              });
          }else {
              var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});

              usuarioDB.password = ':D';
              return res.status(200).json({
                  ok: true,
                  usuario: usuarioDB,
                  token: token
              });
          }
      }else{
          let usuario = new Usuario();
          usuario.nombre = googleUser.nombre;
          usuario.email = googleUser.email;
          usuario.img = googleUser.img;
          usuario.google = true;
          usuario.password = ':D';

          usuario.save((err, usuarioDB) => {
              if (err){
                  return res.status(500).json({
                      ok: false,
                      mensaje: 'Fallo al crear usuario'
                  });
              }

              var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});

              return res.status(200).json({
                  ok: true,
                  usuario: usuarioDB,
                  token: token,
                  id: usuarioDB._idsss
              });



          });
      }

   });

});




// ======================================================================
// Autentificación normal
// ======================================================================
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