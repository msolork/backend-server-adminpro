const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');

// default options
app.use(fileUpload());

var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res, next) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Tipos de coleccion
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion no valida',
            errors: {message: 'Debe de ser una coleccion valida' + tiposValidos.join(', ')}
        });
    }


    if (!req.files){

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccino imagen',
            errors: {message: 'Debe seleccionar una imagen'}
        });

    }


    // Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCorto = archivo.name.split('.');
    let extensionArchivo = nombreCorto[nombreCorto.length-1];

    // Solo esta extensiones son validas
    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: {message: 'Las extensiones validas son ' + extensionesValidas.join(', ')}
        });
    }

    // Nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo a un path en especifico
    let path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, err => {
       if (err){
           return res.status(500).json({
               ok: false,
               mensaje: 'Error al mover el archivo',
               errors: err
           });
       }

        subirPorTipo(tipo, id, nombreArchivo, res);

        res.status(200).json({
            ok: true,
            mensaje: 'Archivo movido'
        });

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res){
    if (tipo == 'usuarios'){
        Usuario.findById(id, (err, usuario) => {

            // Elimina la imagen vieja
            let pathViejo = './uploads/usuarios' + usuario.img;
            if (fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {



                usuarioActualizado.password = ':D';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuarioActualizado: usuarioActualizado
                });
            });


        });

    }else if (tipo == 'medicos'){
        Medico.findById(id, (err, medico) => {

            // Elimina la imagen vieja
            let pathViejo = './uploads/medicos' + medico.img;
            if (fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = ':D';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medicoActualizado: medicoActualizado
                });
            });


        });

    }else if(tipo == 'hospitales'){
        Hospital.findById(id, (err, hospital) => {

            // Elimina la imagen vieja
            let pathViejo = './uploads/hospitals' + hospital.img;
            if (fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                hospitalActualizado.password = ':D';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospitalActualizado: hospitalActualizado
                });
            });


        });
    }
}





module.exports = app;