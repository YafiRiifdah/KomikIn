import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMangaById, getChapterPages, getChapterNavigation } from '../api/mangadexservice';
import ReaderHeader from '../components/ReaderHeader';
import SettingsPanel from '../components/SettingsPanel';
import ReaderFooter from '../components/ReaderFooter';
import MainReader from '../components/MainReader';

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
    mode: localStorage.getItem('readerMode') || 'vertical',
    direction: localStorage.getItem('readerDirection') || 'rtl',
    quality: localStorage.getItem('readerQuality') || 'low'
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

        const mangaData = await getMangaById(mangaId);
        setManga(mangaData);

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

    const retryCount = parseInt(img.dataset.retryCount || '0', 10);
    if (retryCount >= 3) {
      img.src = '/api/placeholder/800/1200';
      img.alt = 'Gambar tidak dapat dimuat';
      img.style.minHeight = '300px';
      return;
    }

    img.dataset.retryCount = (retryCount + 1).toString();

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
      <ReaderHeader 
        manga={manga} 
        chapter={chapter} 
        chapterNavigation={chapterNavigation} 
        toggleSettings={toggleSettings} 
        mangaId={mangaId} 
      />
      {readerSettings.showSettings && (
        <SettingsPanel 
          readerSettings={readerSettings} 
          updateReaderSettings={updateReaderSettings} 
          toggleSettings={toggleSettings} 
        />
      )}
      <MainReader 
        readerSettings={readerSettings} 
        pages={pages} 
        currentPage={currentPage} 
        nextPage={nextPage} 
        prevPage={prevPage} 
        handleImageError={handleImageError} 
      />
      <ReaderFooter 
        mangaId={mangaId} 
        chapterNavigation={chapterNavigation} 
      />
    </div>
  );
};

export default MangaReaderPage;