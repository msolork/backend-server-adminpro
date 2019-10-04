const expresss = require('express');
const  app = expresss();


app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});





module.exports = app;