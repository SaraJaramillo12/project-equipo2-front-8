import React from 'react';
import logoCorreo from '../../assets/3d mail.svg'; 
import logoImage from '../../assets/SKILLMATE-21.png';
import logoFacebook from '../../assets/facebook-app-symbol (2).png';
import logoInstagram from '../../assets/Instagram.svg';
import logoWhatsapp from '../../assets/Whatsapp.svg';
import { Link } from 'react-router-dom';

const Footer = () => { 
  return (
    <div className="bg-color-1 py-12 text-center" id="top">
      
      <div className="flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-20 lg:space-x-64 max-w-screen-lg mx-auto"> 
        
      <div className="flex flex-col items-center">
        <Link 
          to="/about" 
          className="flex flex-col items-center"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="font-dosis font-semibold text-white mb-4">Acerca de nosotros</span>
          <img src={logoImage} alt="Acerca de nosotros" className="h-16 mb-4" />
        </Link>
      </div>
        
        <div className="flex flex-col items-center">
          <span className="font-dosis font-semibold text-white mb-4">Contáctanos</span>
          <img src={logoCorreo} alt="Contáctanos" className="h-16 mb-4" />
        </div>
        
        <div className="flex flex-col items-center">
          <span className="font-dosis font-semibold text-white mb-4">Nuestras redes</span>
          <div className="flex space-x-4 mb-4">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={logoFacebook} alt="Facebook" className="h-12" />
            </a>
            <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
              <img src={logoWhatsapp} alt="Whatsapp" className="h-12" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <img src={logoInstagram} alt="Instagram" className="h-12" />
            </a>
          </div>
        </div>
      </div>
      <p className="text-white mt-12 font-dosis font-semibold">© 2024 SkillMate - Todos los derechos reservados.</p>
    </div>
  );
}

export default Footer;
