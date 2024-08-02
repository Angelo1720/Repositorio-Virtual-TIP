const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (user) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Contraseña incorrecta', verified: false });
          } else {
            if (!user.verified) { // Verificación de cuenta
              return done(null, user, { message: 'Cuenta no verificada. Por favor verifica tu cuenta.', verified: false });
            } else {
              return done(null, user, {verified: true});
            }
          }
        } else {
          return done(null, false, { message: 'Usuario no encontrado', verified: false });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
