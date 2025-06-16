
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

// Helper component for social media icons (simple SVGs)
const SocialIcon: React.FC<{ href: string; path: string; ariaLabel: string }> = ({ href, path, ariaLabel }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className="text-gray-400 hover:text-accent transition-colors">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  </a>
);

const Footer: React.FC = () => {
  const footerLinks = [
    { name: 'Sobre Nós', path: '/about' },
    { name: 'Contacto', path: '/contact' },
    { name: 'Política de Privacidade', path: '/legal/privacy' },
    { name: 'Termos de Serviço', path: '/legal/terms' },
  ];

  return (
    <footer className="bg-textPrimary text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* Logo/Brand Name */}
          <div className="mb-6 md:mb-0">
            <ReactRouterDOM.Link to="/" className="text-2xl font-bold text-white hover:text-accent transition-colors">
              AngoTech
            </ReactRouterDOM.Link>
          </div>

          {/* Essential Links */}
          <nav className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-6 md:mb-0">
            {footerLinks.map(link => (
              <ReactRouterDOM.Link key={link.name} to={link.path} className="text-sm hover:text-white transition-colors">
                {link.name}
              </ReactRouterDOM.Link>
            ))}
          </nav>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <SocialIcon href="#" ariaLabel="Facebook" path="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            <SocialIcon href="#" ariaLabel="Twitter" path="M22.46 6c-.77.35-1.6.58-2.46.67.9-.53 1.59-1.37 1.92-2.38-.84.5-1.78.86-2.79 1.07C18.29 4.41 17.03 4 15.64 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C7.38 9.09 4.26 7.28 2.18 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.54 21 7.8 21c7.21 0 11.17-6 11.17-11.17 0-.17 0-.34-.01-.5A7.95 7.95 0 0 0 22.46 6z" />
            <SocialIcon href="#" ariaLabel="Instagram" path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.081C8.741 1.082 8.31 1.094 7.053 1.15c-3.655.166-6.016 2.543-6.178 6.18C.815 8.38.802 8.81.802 12s.013 3.62.073 4.87c.162 3.635 2.523 6.01 6.178 6.17C8.31 19.088 8.741 19.1 12 19.1s3.69-.012 4.947-.072c3.655-.16 6.016-2.535 6.178-6.17C19.185 15.62 19.198 15.19 19.198 12s-.013-3.62-.073-4.87c-.162-3.63-2.523-6.005-6.178-6.17C15.69 1.094 15.259 1.082 12 1.082zM12 7.082c-2.733 0-4.95 2.217-4.95 4.95s2.217 4.95 4.95 4.95 4.95-2.217 4.95-4.95-2.217-4.95-4.95-4.95zm0 7.917c-1.606 0-2.908-1.302-2.908-2.908s1.302-2.908 2.908-2.908 2.908 1.302 2.908 2.908-1.302 2.908-2.908 2.908zm4.965-7.035c0-.822-.672-1.493-1.495-1.493s-1.495.67-1.495 1.492.67 1.495 1.495 1.495 1.495-.672 1.495-1.495z" />
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AngoTech Store. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;