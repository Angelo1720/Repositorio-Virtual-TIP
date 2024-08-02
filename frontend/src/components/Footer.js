import React from 'react';
import '../assets/Footer.css';

const Footer = () => {
  return (
    <footer className="text-white text-center">
      <div className="d-flex flex-wrap divImagen justify-content-evenly align-items-center">
        <div>
          <img src="/images/tip.png" alt="Logo 1" className="footer-image" />
        </div>
        <div>
          <img src="/images/LOGO-ANEP.png" alt="Logo 2" className="footer-image" />
        </div>
        <div>
          <img src="/images/logoUTEC.png" alt="Logo 3" className="footer-image" />
        </div>
        <div>
          <img src="/images/udelar.png" alt="Logo 3" className="footer-image" />
        </div>
      </div>
      <div>
          <p>© {new Date().getFullYear()} UTEC. Todos los derechos reservados.</p>
        </div>
    </footer>
  );
};

export default Footer;