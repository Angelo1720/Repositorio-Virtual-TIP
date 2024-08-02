const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@(utec\.edu\.uy|estudiantes\.utec\.edu\.uy)$/i;
  return regex.test(email);
};

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'repotiputec@gmail.com',
    pass: 'xiiaeuqliuuylmof',
  },
});

const logoPath = path.resolve(__dirname, '..', '..', 'frontend','public', 'images', 'tip.png');
const logo = fs.readFileSync(logoPath);

// Registro de usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!validateEmail(email)) {
    setMessage('Correo electrónico no válido. Debe terminar en @utec.edu.uy o @estudiantes.utec.edu.uy');
    return;
  }

  const verificationCode = crypto.randomBytes(3).toString('hex');
  //const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas desde ahora
  const verificationCodeExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email ya se encuentra registrado' });
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt,
      verified: false,
    });
    await newUser.save();

    // Enviar correo con el código de verificación
    const mailOptions = {
      from: 'repotiputec@gmail.com',
      to: email,
      subject: 'Verificación TIP repositorio',
      text: `Tu código de verificación es: ${verificationCode}`,
      html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 150px;
          }
          .content {
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:universityLogo" alt="Logo de la Universidad" />
          </div>
          <div class="content">
            <h1>Verificación de Correo</h1>
            <p>Tu código de verificación es:</p>
            <h2>${verificationCode}</h2>
            <p>Por favor, ingrésalo en la aplicación para completar el proceso de verificación.</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'tip.png',
        path: logoPath,
        cid: 'universityLogo' // ID para la referencia en el HTML
      }
    ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
      }
      return res.status(200).json({ message: 'Correo de verificación enviado' });
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    return res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// Ruta para verificar el código de verificación
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'El usuario se ha eliminado por seguridad, vuelva a registrarse. Por favor' });
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      user.verificationCode = null;
      user.verificationCodeExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: 'El código de verificación ha expirado' });
    }

    if (user.verificationCode === code) {
      user.verified = true;
      user.verificationCode = null;
      user.verificationCodeExpiresAt = null;
      await user.save();
      return res.status(200).json({ message: 'Correo verificado exitosamente' });
    } else {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }
  } catch (err) {
    console.error('Error al verificar usuario:', err);
    res.status(500).json({ message: 'Error al verificar usuario', error: err.message });
  }
});

// Ruta para reenviar el código de verificación
router.post('/resend-verification-code', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'El usuario no existe' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'El usuario ya está verificado' });
    }

    const verificationCode = crypto.randomBytes(3).toString('hex');
    const verificationCodeExpiresAt = new Date(Date.now() + 20 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiresAt = verificationCodeExpiresAt;
    await user.save();

    // Enviar correo con el nuevo código de verificación
    const mailOptions = {
      from: 'repotiputec@gmail.com',
      to: email,
      subject: 'Nuevo código de verificación',
      text: `Tu nuevo código de verificación es: ${verificationCode}`,
      html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 150px;
          }
          .content {
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:universityLogo" alt="Logo de la Universidad" />
          </div>
          <div class="content">
            <h1>Verificación de Correo</h1>
            <p>Tu nuevo código de verificación es:</p>
            <h2>${verificationCode}</h2>
            <p>Por favor, ingrésalo en la aplicación para completar el proceso de verificación.</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'tip.png',
        path: logoPath,
        cid: 'universityLogo' // ID para la referencia en el HTML
      }
    ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
      }
      return res.status(200).json({ message: 'Nuevo código de verificación enviado' });
    });
  } catch (err) {
    console.error('Error al reenviar el código de verificación:', err);
    return res.status(500).json({ message: 'Error al reenviar el código de verificación', error: err.message });
  }
});

// Inicio de sesión
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    if (!user) {
      return res.status(400).json({ success: false, message: info.message, verified: info.verified });
    }
    req.logIn(user, (err) => {
      if (!info.verified) {
        return res.status(200).json({ success: true, verified: false });
      }
      return res.status(200).json({ success: true, verified: user.verified });
    });
  })(req, res, next);
});

// Verificación de autenticación
router.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Cierre de sesión
router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;

