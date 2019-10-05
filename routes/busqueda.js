const expresss = require('express');
const  app = expresss();
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');


// ==========================================================
//  BUSQUEDA GENERAL
// ==========================================================

app.get('/todo/:busqueda', (req, res, next) => {
    let busqueda = req.params.busqueda;
    let regex = new RegExp( busqueda, 'i' );

    c



});


// ==========================================================
//  BUSQUEDA POR COLECCION
// ==========================================================
app.get('/coleccon/:tabla/:busqueda', (req, res) => {

    let busqueda = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp( busqueda, 'i' );
    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                mensaje: 'Los tipos de busqueda son: usuarios, médicos y hospitales.',
                error: 'La tabla no es valida'
            })
    }

    promesa.then(data => {
       return res.status(200).json({
         ok: true,
         [data]: data
       });
    });


});


function buscarHospitales( busqueda, regex){
    return new Promise((resolve, reject) => {

        Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec(
                 (err, hospitales) => {
                   if (err){
                       reject('Error al cargar hospitales', err);
                   }else{
                       resolve(hospitales);
                   }
        });

    });

}

function buscarMedicos( busqueda, regex){
    return new Promise((resolve, reject) => {

        Medico.find({nombre: regex})
            .populate('usuarios', 'nombre email')
            .populate('hospitales', 'nombre')
            .exec(
                (err, medicos) => {
                    if (err){
                        reject('Error al cargar medicos', err);
                    }else{
                        resolve(medicos);
                    }
        });

    });

}

function buscarUsuarios( busqueda, regex){
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{'nombre':regex}, {'email': regex}])
            .exec((err, usuarios) => {
                if (err){
                    reject('Error al cargar usuarios', err);
                }else{
                    resolve(usuarios);

                }

            });

    });

}






module.exports = app;