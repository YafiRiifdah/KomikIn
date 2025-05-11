import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMangaById, getChapterPages, getChapterNavigation } from '../api/mangadexservice';

// Reader doesn't need the standard nav and footer components
// We'll create a custom header for the reader

const MangaReaderPage = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [chapterNavigation, setChapterNavigation] = useState({
    prev: null,
    next: null
  });
  const [readerSettings, setReaderSettings] = useState({
    showSettings: false,
    mode: localStorage.getItem('readerMode') || 'vertical', // 'vertical', 'horizontal', 'single'
    direction: localStorage.getItem('readerDirection') || 'rtl', // 'rtl', 'ltr'
    quality: localStorage.getItem('readerQuality') || 'low' // Default ke 'low' untuk mengurangi kegagalan loading
  });
  
  // Save reader settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('readerMode', readerSettings.mode);
    localStorage.setItem('readerDirection', readerSettings.direction);
    localStorage.setItem('readerQuality', readerSettings.quality);
  }, [readerSettings]);
  
  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 1. Load manga data
        const mangaData = await getMangaById(mangaId);
        setManga(mangaData);
        
        // 2. Load chapter pages
        const chapterData = await getChapterPages(chapterId, readerSettings.quality);
        setChapter({
          id: chapterData.id,
          title: chapterData.title,
          chapter: chapterData.chapter,
          volume: chapterData.volume,
          translatedLanguage: chapterData.translatedLanguage,
          hash: chapterData.hash
        });
        setPages(chapterData.pages);
        
        // 3. Load chapter navigation
        const navData = await getChapterNavigation(mangaId, chapterId);
        setChapterNavigation(navData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load chapter. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [mangaId, chapterId, readerSettings.quality]);
  
  // Retry loading
  const retryLoading = () => {
    setIsLoading(true);
    setError(null);
    
    // Retry with lowest quality
    setReaderSettings(prev => ({
      ...prev,
      quality: 'low'
    }));
  };
  
  // Page navigation
  const nextPage = () => {
    if (readerSettings.mode === 'single' && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    } else if (chapterNavigation.next) {
      navigate(`/read/${mangaId}/${chapterNavigation.next.id}`);
    }
  };
  
  const prevPage = () => {
    if (readerSettings.mode === 'single' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    } else if (chapterNavigation.prev) {
      navigate(`/read/${mangaId}/${chapterNavigation.prev.id}`);
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (readerSettings.mode === 'single') {
        if (
          (e.key === 'ArrowRight' && readerSettings.direction === 'ltr') ||
          (e.key === 'ArrowLeft' && readerSettings.direction === 'rtl')
        ) {
          nextPage();
        } else if (
          (e.key === 'ArrowLeft' && readerSettings.direction === 'ltr') ||
          (e.key === 'ArrowRight' && readerSettings.direction === 'rtl')
        ) {
          prevPage();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, readerSettings.mode, readerSettings.direction, chapterNavigation]);
  
  // Update reader settings
  const updateReaderSettings = (key, value) => {
    setReaderSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setReaderSettings(prev => ({
      ...prev,
      showSettings: !prev.showSettings
    }));
  };
  
  // Handle image errors
  const handleImageError = (e, index) => {
    console.log(`Error loading image at index ${index}`);
    const img = e.target;
    
    // Don't retry more than 3 times
    const retryCount = parseInt(img.dataset.retryCount || '0', 10);
    if (retryCount >= 3) {
      img.src = '/api/placeholder/800/1200';
      img.alt = 'Gambar tidak dapat dimuat';
      img.style.minHeight = '300px';
      return;
    }
    
    // Update retry count
    img.dataset.retryCount = (retryCount + 1).toString();
    
    // Try data-saver path if using data path
    const currentSrc = img.src;
    if (currentSrc.includes('/data/')) {
      img.src = currentSrc.replace('/data/', '/data-saver/');
    } else {
      img.src = '/api/placeholder/800/1200';
      img.alt = 'Gambar tidak dapat dimuat';
      img.style.minHeight = '300px';
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-400">Memuat chapter...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-900/20 text-red-500 p-6 rounded-lg text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
            <button 
              className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
              onClick={() => navigate(`/manga/${mangaId}`)}
            >
              Kembali
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={retryLoading}
            >
              Coba Lagi (Kualitas Rendah)
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!manga || !chapter || pages.length === 0) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-900/20 text-yellow-500 p-6 rounded-lg text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Data Tidak Lengkap</h2>
          <p>Terjadi kesalahan dalam memuat data chapter. Data tidak lengkap.</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
            <button 
              className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
              onClick={() => navigate(`/manga/${mangaId}`)}
            >
              Kembali
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={retryLoading}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Custom Reader Header - Responsive */}
      <header className="bg-gray-800/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-md py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => navigate(`/manga/${mangaId}`)} 
                className="text-blue-400 hover:text-blue-500"
                aria-label="Kembali"
              >
                ← <span className="hidden sm:inline">Kembali</span>
              </button>
              
              <div className="hidden sm:block md:block overflow-hidden">
                <h1 className="font-medium truncate text-sm sm:text-base">
                  {manga?.title} - Ch. {chapter?.chapter}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Chapter Navigation - Responsive */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => chapterNavigation.prev && navigate(`/read/${mangaId}/${chapterNavigation.prev.id}`)}
                  className={`p-1 sm:p-2 rounded text-sm sm:text-base ${chapterNavigation.prev ? 'text-blue-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`}
                  disabled={!chapterNavigation.prev}
                  aria-label="Previous Chapter"
                >
                  &#8592; <span className="hidden sm:inline">Prev</span>
                </button>
                
                <button 
                  onClick={() => chapterNavigation.next && navigate(`/read/${mangaId}/${chapterNavigation.next.id}`)}
                  className={`p-1 sm:p-2 rounded text-sm sm:text-base ${chapterNavigation.next ? 'text-blue-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`}
                  disabled={!chapterNavigation.next}
                  aria-label="Next Chapter"
                >
                  <span className="hidden sm:inline">Next</span> &#8594;
                </button>
              </div>
              
              {/* Settings Button */}
              <button 
                onClick={toggleSettings}
                className="p-2 text-blue-400 hover:bg-gray-700 rounded ml-2"
                aria-label="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Settings Panel - Responsive */}
      {readerSettings.showSettings && (
        <div className="fixed top-16 right-4 z-50 bg-gray-800 shadow-lg rounded-lg p-4 w-64 max-w-[calc(100vw-2rem)]">
          <h3 className="text-lg font-medium mb-3">Pengaturan Reader</h3>
          
          <div className="space-y-4">
            {/* Reading Mode */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mode Baca</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => updateReaderSettings('mode', 'vertical')}
                  className={`px-3 py-1 text-sm rounded-full ${readerSettings.mode === 'vertical' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Vertikal
                </button>
                <button 
                  onClick={() => updateReaderSettings('mode', 'horizontal')}
                  className={`px-3 py-1 text-sm rounded-full ${readerSettings.mode === 'horizontal' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Horizontal
                </button>
                <button 
                  onClick={() => updateReaderSettings('mode', 'single')}
                  className={`px-3 py-1 text-sm rounded-full ${readerSettings.mode === 'single' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Single
                </button>
              </div>
            </div>
            
            {/* Reading Direction (for horizontal/single) */}
            {readerSettings.mode !== 'vertical' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Arah Baca</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateReaderSettings('direction', 'rtl')}
                    className={`px-3 py-1 text-sm rounded-full ${readerSettings.direction === 'rtl' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    Kanan-Kiri
                  </button>
                  <button 
                    onClick={() => updateReaderSettings('direction', 'ltr')}
                    className={`px-3 py-1 text-sm rounded-full ${readerSettings.direction === 'ltr' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    Kiri-Kanan
                  </button>
                </div>
              </div>
            )}
            
            {/* Image Quality */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Kualitas Gambar</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateReaderSettings('quality', 'high')}
                  className={`px-3 py-1 text-sm rounded-full ${readerSettings.quality === 'high' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Tinggi
                </button>
                <button 
                  onClick={() => updateReaderSettings('quality', 'medium')}
                  className={`px-3 py-1 text-sm rounded-full ${readerSettings.quality === 'medium' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Sedang
                </button>
                <button 
                  onClick={() => updateReaderSettings('quality', 'low')}
                  className={`px-3 py-1 text-sm rounded-full ${readerSettings.quality === 'low' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Rendah
                </button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={toggleSettings}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
          >
            Tutup
          </button>
        </div>
      )}
      
      {/* Reader Area - Responsive */}
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
                disabled={currentPage === 0 && !chapterNavigation.prev}
              >
                Sebelumnya
              </button>
              
              <button 
                onClick={nextPage}
                className={`px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm ${currentPage < pages.length - 1 || chapterNavigation.next ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                disabled={currentPage === pages.length - 1 && !chapterNavigation.next}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer with Navigation - Responsive */}
      <footer className="bg-gray-800/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 py-2 sm:py-3 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => chapterNavigation.prev && navigate(`/read/${mangaId}/${chapterNavigation.prev.id}`)}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${chapterNavigation.prev ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              disabled={!chapterNavigation.prev}
            >
              <span className="sm:hidden">◀ Prev</span>
              <span className="hidden sm:inline">Chapter Sebelumnya</span>
            </button>
            
            <button 
              onClick={() => chapterNavigation.next && navigate(`/read/${mangaId}/${chapterNavigation.next.id}`)}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${chapterNavigation.next ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              disabled={!chapterNavigation.next}
            >
              <span className="sm:hidden">Next ▶</span>
              <span className="hidden sm:inline">Chapter Selanjutnya</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MangaReaderPage;