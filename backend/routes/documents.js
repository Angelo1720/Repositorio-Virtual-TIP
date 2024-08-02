const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');

// Ruta para subir documentos
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido el archivo' });
    }

    try {
      const newDocument = new Document({
        filename: req.file.originalname,
        author: req.body.author,
        category: req.body.category,
        uploadDate: new Date(),
      });

      await newDocument.save();

      res.status(200).json({
        message: 'Archivo almacenado correctamente',
        file: req.file,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al almacenar la información del archivo en la base de datos', error });
    }
  });
});

// Ruta para listar documentos
router.get('/list', async (req, res) => {
  try {
    const documents = await Document.find().sort({ uploadDate: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error listar los archivos', error });
  }
});

// Ruta para buscar documentos
router.get('/search', async (req, res) => {
  const { author, filename, category, uploadDate } = req.query;

  try {
    const query = {};

    if (author) {
      query.author = new RegExp(author, 'i');
    }
    if (filename) {
      query.filename = new RegExp(filename, 'i');
    }
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    if(uploadDate){
      // Validamos el formato de la fecha (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(uploadDate)) {
        return res.status(400).json({ message: 'Formato de fecha incorrecto. Use YYYY-MM-DD.' });
      }

      const startDate = new Date(uploadDate);
      const endDate = new Date(uploadDate);
      endDate.setDate(endDate.getDate() + 1);
      query.uploadDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const documents = await Document.find(query).sort({uploadDate: -1});
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar documento', error });
  }
});

// Ruta para descargar documentos
router.get('/download/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'El documento no fue encontrado' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.filename);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error al descargar el archivo', error });
  }
});

/*router.delete('/delete/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al eliminar el archivo del sistema de archivos', err });
      }
      res.json({ message: 'Documento eliminado correctamente' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el documento', error });
  }
});*/

module.exports = router;
