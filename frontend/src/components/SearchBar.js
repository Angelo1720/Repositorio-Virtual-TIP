import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ setDocuments }) => {
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState('filename');

  const onSearch = async (e) => {
    e.preventDefault();
    try {
      let searchUrl = `http://127.0.0.1:5000/documents/search?${searchBy}=${query}`;
      if (searchBy === 'uploadDate') {
        // Validamos el formato de la fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(query)) {
          setError('Formato de fecha incorrecto. Use YYYY-MM-DD.');
          return;
        }

        // Convertimos la fecha al formato YYYY-MM-DD
        const formattedDate = new Date(query).toISOString().split('T')[0];
        searchUrl = `http://127.0.0.1:5000/documents/search?${searchBy}=${formattedDate}`;
      }

      const response = await axios.get(searchUrl);
      setDocuments(response.data);
    } catch (error) {
      console.error('Falló la busqueda de los archivos.', error);
    }
  };

  return (
    <form onSubmit={onSearch} className="d-flex mb-3">
      <input
        type="text"
        className="form-control me-2"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className='d-flex w-100'>
        <div className=' d-flex w-50'>
          <select className="form-select me-2" onChange={(e) => setSearchBy(e.target.value)} value={searchBy}>
            <option value="filename">Nombre Archivo</option>
            <option value="author">Autor</option>
            <option value="category">Categoría</option>
            <option value="uploadDate">Fecha Formato YYYY-MM-DD</option>
          </select>
        </div>
        <div className=' d-flex w-75'>
          <button type="submit" className="btn btn-primary w-100">Buscar</button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
