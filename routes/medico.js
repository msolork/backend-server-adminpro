const expresss = require('express');
const app = expresss();

var middlewareAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

// ==========================================================
//  Obtener todos los medicos
// ==========================================================
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre emailss')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });


            }
        );
});


// ==========================================================
//  Crear medico
// ==========================================================
app.post('/', middlewareAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});


// ==========================================================
//  Actualizar medico
// ==========================================================
app.put('/:id', middlewareAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: {message: 'No existe un medico con ese id'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario =  req.usuario._id;
        medico.hospital = body.hospital;
        medico.save( (err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });

});


// ==========================================================
//  Borrar un medico por el id
// ==========================================================
app.delete('/:id', middlewareAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        }

        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id'}
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    });
});


module.exports = app;