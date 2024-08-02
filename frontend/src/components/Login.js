import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const onEmailChange = (e) => setEmail(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login', { email, password });
      if (response.data.success) {
        if (!response.data.verified) {
          navigate('/verify', { state: { email } });
        } else {
          setIsAuthenticated(true);
          navigate('/upload');
        }
      } else {
        setMessage(response.data.message || 'Credenciales invalidas');
        if (!response.data.verified) {
          navigate('/verify', { state: { email } });
        }
      }
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'Cuenta no existente.');
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container mt-5">
      <div className='text-center m-5' >
        <h1 className='titulo'>Bienvenidos al Repositorio Virtual TIP</h1>
        <h4>¡ Donde la educación y la tecnología se encuentran !</h4>
        <p>El lugar donde estudiantes y docentes pueden almacenar, compartir y acceder a recursos educativos en cualquier momento y lugar.</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center">Iniciar Sesión</h1>
              <form onSubmit={onSubmit}>
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
                <button type="submit" className="btn btn-primary w-100">Ingresar</button>
              </form>
              {message && <p className="mt-3 text-danger">{message}</p>}
              <button onClick={goToRegister} className="btn btn-light mt-3 w-50">Registrarme</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



