const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const cronJobs = require('./cron-tasks/cronjobs');

const app = express();
const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tecinfo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Asegúrate de que `secure` esté en false si estás en un entorno de desarrollo sin HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuración específica de CORS para permitir origen y credenciales
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

require('./config/passport')(passport);

app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);

// Ruta para el inicio de sesión
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, message: 'Login exitoso' });
    });
  })(req, res, next);
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});