import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PdfThumbnail = ({ documentId }) => {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const fetchPdfThumbnail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/documents/download/${documentId}`, {
          responseType: 'blob',
        });
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const pdf = await pdfjsLib.getDocument(fileURL).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        setThumbnail(canvas.toDataURL());
      } catch (error) {
        console.error('Error al renderizar la miniatura del PDF.', error);
      }
    };

    fetchPdfThumbnail();
  }, [documentId]);

  return thumbnail ? <img src={thumbnail} alt="Miniatura PDF" width="200" height="200" /> : <p>Cargando miniatura...</p>;
};

export default PdfThumbnail;