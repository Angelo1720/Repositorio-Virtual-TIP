import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const location = useLocation();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Email:', email, 'Code:', code);

    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/verify', { email, code });
      setMessage(response.data.message);
      if (response.status === 200) {
        navigate('/');
      }
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'Failed to verify');
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/resend-verification-code', { email });
      setResendMessage(response.data.message);
    } catch (error) {
      setResendMessage(error.response ? error.response.data.message : 'Error en el reenvío del código');
    }
  };

  return (
    <div className='container'>
      <h1>Ingrese el código recibido en su correo electrónico</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Codigo de verificación"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-success m-3">Verificar</button>
      </form>
      <button onClick={handleResendCode} className="btn btn-secondary m-3">Reenviar código</button>
      <p><i>* En caso de ocurrir un error con el código de verificación puede presionar en reenviar.</i></p>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Verify;
