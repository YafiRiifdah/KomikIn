import React from 'react';

const MainReader = ({ readerSettings, pages, currentPage, nextPage, prevPage, handleImageError }) => {
  return (
    <main className="pt-16 pb-16">
      {/* Vertical Reader */}
      {readerSettings.mode === 'vertical' && (
        <div className="mx-auto px-2 sm:px-4 py-6 space-y-4 max-w-full sm:max-w-3xl">
          {pages.map((pageUrl, index) => (
            <div key={index} className="flex justify-center">
              <img 
                src={pageUrl} 
                alt={`Halaman ${index + 1}`} 
                className="max-w-full h-auto"
                loading="lazy"
                data-retry-count="0"
                onError={(e) => handleImageError(e, index)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Reader */}
      {readerSettings.mode === 'horizontal' && (
        <div className={`flex overflow-x-auto py-4 ${readerSettings.direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
          {pages.map((pageUrl, index) => (
            <div key={index} className="flex-shrink-0 px-1 sm:px-2">
              <img 
                src={pageUrl} 
                alt={`Halaman ${index + 1}`} 
                className="h-auto max-h-[calc(100vh-8rem)]"
                loading="lazy"
                data-retry-count="0"
                onError={(e) => handleImageError(e, index)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Single Page Reader */}
      {readerSettings.mode === 'single' && (
        <div className="max-w-full sm:max-w-3xl mx-auto px-2 sm:px-4 py-6">
          <div className="relative">
            {/* Page Counter */}
            <div className="absolute top-2 right-2 bg-gray-800/80 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {currentPage + 1} / {pages.length}
            </div>
            
            {/* Current Page */}
            <div className="flex justify-center">
              <img 
                src={pages[currentPage]} 
                alt={`Halaman ${currentPage + 1}`} 
                className="max-w-full h-auto"
                data-retry-count="0"
                onError={(e) => handleImageError(e, currentPage)}
              />
            </div>
            
            {/* Navigation Overlays */}
            <div className="absolute inset-0 flex">
              <div 
                className="w-1/2 h-full cursor-pointer"
                onClick={readerSettings.direction === 'rtl' ? nextPage : prevPage}
              ></div>
              <div 
                className="w-1/2 h-full cursor-pointer"
                onClick={readerSettings.direction === 'rtl' ? prevPage : nextPage}
              ></div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4">
            <button 
              onClick={prevPage}
              className={`px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm ${currentPage > 0 ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              disabled={currentPage === 0}
            >
              Sebelumnya
            </button>
            <button 
              onClick={nextPage}
              className={`px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm ${currentPage < pages.length - 1 ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              disabled={currentPage === pages.length - 1}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainReader;