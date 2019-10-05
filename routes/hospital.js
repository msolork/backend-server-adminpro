const expresss = require('express');
const app = expresss();

var middlewareAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

// ==========================================================
//  Obtener todos los hospitales
// ==========================================================
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });


            }
        );
});


// ==========================================================
//  Crear hospital
// ==========================================================
app.post('/', middlewareAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});


// ==========================================================
//  Actualizar hospital
// ==========================================================
app.put('/:id', middlewareAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {message: 'No existe un hospital con ese id'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario =  req.usuario._id;
        hospital.save( (err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});


// ==========================================================
//  Borrar un hospital por el id
// ==========================================================
app.delete('/:id', middlewareAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }

        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id'}
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});


module.exports = app;