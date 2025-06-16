
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CATEGORIES } from '../constants';

const CategorySidebar: React.FC = () => {
  const { category: activeCategory } = ReactRouterDOM.useParams<{ category?: string }>();

  return (
    <aside className="w-full md:w-64 bg-surface p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-textPrimary mb-4">Categorias</h3>
      <ul className="space-y-2">
        <li>
          <ReactRouterDOM.Link
            to="/products"
            className={`block px-3 py-2 rounded-md text-textSecondary hover:bg-gray-100 hover:text-primary transition-colors ${
              !activeCategory ? 'bg-primary bg-opacity-10 text-primary font-medium' : '' // Using bg-opacity for light primary shade
            }`}
          >
            Todas
          </ReactRouterDOM.Link>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category}>
            <ReactRouterDOM.Link
              to={`/products/${encodeURIComponent(category.toLowerCase())}`}
              className={`block px-3 py-2 rounded-md text-textSecondary hover:bg-gray-100 hover:text-primary transition-colors ${
                activeCategory === category.toLowerCase() ? 'bg-primary bg-opacity-10 text-primary font-medium' : '' // Using bg-opacity
              }`}
            >
              {category}
            </ReactRouterDOM.Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;