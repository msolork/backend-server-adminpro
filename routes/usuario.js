const expresss = require('express');
const app = expresss();
var bcrypt = require('bcryptjs');

var middlewareAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');

// ==========================================================
//  Obtener todos los usuarios
// ==========================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            }
        );
});


// ==========================================================
//  Crear usuario
// ==========================================================
app.post('/', middlewareAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});


// ==========================================================
//  Actualizar usuario
// ==========================================================
app.put('/:id', middlewareAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: {message: 'No existe un usuario con ese id'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save( (err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});


// ==========================================================
//  Borrar un usuario por el id
// ==========================================================
app.delete('/:id', middlewareAutenticacion.verificaToken, (req, res) => {
  let id = req.params.id;
  Usuario.findByIdAndRemove(id, (err, usuarioEleminado) => {
      if (err) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al eliminar usuario',
              errors: err
          });
      }

      if (!usuarioEleminado) {
          return res.status(400).json({
              ok: false,
              mensaje: 'No existe un usuario con ese id',
              errors: { message: 'No existe un usuario con ese id'}
          });
      }

      return res.status(200).json({
          ok: true,
          usuario: usuarioEleminado
      });
  });
});


module.exports = app;