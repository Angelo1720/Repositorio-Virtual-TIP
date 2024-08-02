const express = require('express');
const cron = require('node-cron');
const User = require('../models/User'); 

// Programar una tarea para que se ejecute cada minuto para pruebas EJEMPLO('* * * * *')
// Programar una tarea para que se ejecute cada día a la medianoche EJEMPLO('0 0 * * *')
cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Eliminar usuarios con códigos de verificación expirados
      const result = await User.deleteMany(
        { verificationCodeExpiresAt: { $lt: now } }
      );
      console.log(`${result.deletedCount} códigos de verificación expirados eliminados.`);
    } catch (error) {
      console.error('Error al eliminar códigos de verificación expirados:', error);
    }
  });
