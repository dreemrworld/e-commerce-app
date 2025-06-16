
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from './Button';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4 rounded-lg shadow-xl mb-12">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          A Tecnologia que Você Precisa, à Distância de um Clique!
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
          Descubra os mais recentes gadgets e eletrónicos na AngoTech. Qualidade, confiança e conveniência, com entrega em toda Angola.
        </p>
        <ReactRouterDOM.Link to="/products">
          <Button size="lg" className="bg-accent hover:bg-orange-600 text-white font-semibold">
            Explorar Produtos Agora
          </Button>
        </ReactRouterDOM.Link>
      </div>
    </div>
  );
};

export default HeroSection;