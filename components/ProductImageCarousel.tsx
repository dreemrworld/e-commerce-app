import React, { useState, useEffect } from 'react';

interface ProductImageCarouselProps {
  imageUrls: string[];
  altText: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ imageUrls, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0); // Reset to first image if imageUrls array changes
  }, [imageUrls]);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-200 rounded-lg">
        <span className="text-textSecondary">Sem imagem disponível</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
  };
  
  // currentImageUrl will be undefined if imageUrls[currentIndex] is not valid.
  // The img tag's src will handle this by showing a broken image icon.
  const currentImageUrl = imageUrls[currentIndex];


  return (
    <div className="relative w-full">
      {/* Main Image */}
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 mb-4 bg-white flex items-center justify-center">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={`${altText} - Imagem ${currentIndex + 1}`}
            className="w-full h-full object-contain max-h-[500px]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-textSecondary">Imagem indisponível</span>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-2 -translate-y-1/2 transform bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full z-10 focus:outline-none"
            aria-label="Imagem anterior"
            style={{ marginTop: '-2rem' }} // Adjust to vertically center on main image, considering thumbnail height
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full z-10 focus:outline-none"
            aria-label="Próxima imagem"
            style={{ marginTop: '-2rem' }} // Adjust as above
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </>
      )}

      {/* Thumbnails */}
      {imageUrls.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto p-1 justify-center">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 focus:outline-none transition-all duration-150 ease-in-out
                          ${currentIndex === index ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-gray-400'}`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              {url ? (
                <img
                  src={url}
                  alt={`${altText} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-textSecondary text-xs">X</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;