import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';

const Wall = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/documents/list');
        setDocuments(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch documents');
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Document List</h1>
      <SearchBar setDocuments={setDocuments} />
      <ul>
        {documents.map((document) => (
          <li key={document._id}>
            <p>Filename: {document.filename}</p>
            <p>Author: {document.author}</p>
            <p>Category: {document.category}</p>
            <p>Upload Date: {new Date(document.uploadDate).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wall;
