import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import PdfThumbnail from './PdfThumbnail';

const Upload = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const onFileChange = (e) => setFile(e.target.files[0]);
  const onAuthorChange = (e) => setAuthor(e.target.value);
  const onCategoryChange = (e) => setCategory(e.target.value);

  const clearAlerts = () => {
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 3000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('author', author);
    formData.append('category', category);

    try {
      const response = await axios.post(`http://127.0.0.1:5000/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      fetchDocuments();
      setFile(null);
      setAuthor('');
      setCategory('');
      document.getElementById('file').value = '';
      clearAlerts();
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'Error al subir el archivo');
      clearAlerts();
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/documents/list');
      setDocuments(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error al listar los archivos');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = async (id, filename) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/documents/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar archivo.', error);
    }
  };

  /*const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/documents/delete/${id}`);
      setMessage('Documento eliminado correctamente');
      fetchDocuments();
      clearAlerts();
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'Error al borrar archivo');
    }
  };*/

  const renderThumbnail = (document) => {
    if (document.filename.endsWith('.pdf')) {
      return <PdfThumbnail documentId={document._id} />;
    } else if (document.filename.endsWith('.zip')) {
      return <img src="/images/folder.png" alt="Folder Icon" width="100" height="100" />;
    } else if (document.filename.match(/\.(jpg|jpeg|png)$/)) {
      const imageURL = `http://127.0.0.1:5000/documents/download/${document._id}`;
      return <img src={imageURL} alt="Image Thumbnail" width="200" height="100" />;
    }
    return null;
  };

  return (
    <div className="container">
      <h1 className="mb-4">Subir Archivo</h1>
      <form onSubmit={onSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="file" className="form-label">Archivo</label>
          <input type="file" id="file" className="form-control" onChange={onFileChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="author" className="form-label">Autor</label>
          <input type="text" id="author" className="form-control" placeholder="Autor" value={author} onChange={onAuthorChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Categoría</label>
          <input type="text" id="category" className="form-control" placeholder="Categoría" value={category} onChange={onCategoryChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Subir Archivo</button>
      </form>
      {message && <p className="alert alert-success">{message}</p>}
      {error && <p className="alert alert-danger">{error}</p>}
      <h2 className="mb-4">Lista de Documentos</h2>
      <SearchBar setDocuments={setDocuments} />
      {loading ? (
        <p>Cargando documentos...</p>
      ) : (
        <ul className="list-group">
          {documents.map((document) => (
            <li key={document._id} className="list-group-item">
              <div className='d-flex'>
                <div className='d-flex col-6 justify-content-center align-items-center'>
                  {renderThumbnail(document)}
                </div>
                <div className='d-flex row col-6 text-center align-items-center'>
                  <p><strong>Nombre Archivo:</strong> {document.filename}</p>
                  <p><strong>Autor:</strong> {document.author}</p>
                  <p><strong>Categoría:</strong> {document.category}</p>
                  <p><strong>Fecha de subida:</strong> {new Date(document.uploadDate).toLocaleString()}</p>
                </div>
              </div>
              <div className='d-flex justify-content-center'>
                <button className="btn btn-success m-3 w-25" onClick={() => handleDownload(document._id, document.filename)}>Descargar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Upload;
