import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const onUsernameChange = (e) => setUsername(e.target.value);
  const onEmailChange = (e) => setEmail(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);
  const onConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@(utec\.edu\.uy|estudiantes\.utec\.edu\.uy)$/i;
    return regex.test(email);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden. Por favor reingresarlas');
      return;
    }
    if (!validateEmail(email)) {
      setMessage('Correo electrónico no válido. Debe terminar en @utec.edu.uy o @estudiantes.utec.edu.uy');
      return;
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/register', {
        username,
        email,
        password,
      });
      if (response.status === 200) {
        setMessage('Usuario registrado con éxito');
        navigate('/verify', { state: { email } });
      } else {
        setMessage(response.data.message || 'Registro fallido');
      }
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'Registro fallido');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center">Registro</h1>
              <form onSubmit={onSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="username">Nombre</label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    placeholder="Nombre"
                    value={username}
                    onChange={onUsernameChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={onEmailChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Contraseña"
                    value={password}
                    onChange={onPasswordChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Confirmar Contraseña"
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Guardar</button>
              </form>
              {message && <p className="mt-3 text-danger">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
