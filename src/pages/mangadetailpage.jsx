import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMangaById, getMangaChapters } from '../api/mangadexservice';
import { addBookmark, addHistory, isBookmarked, removeBookmark } from '../api/authApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';

const MangaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isMangaBookmarked, setIsMangaBookmarked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching details for manga ID: ${id}`);
        
        const mangaData = await getMangaById(id);
        setManga(mangaData);
        
        const chaptersData = await getMangaChapters(id);
        setChapters(chaptersData);
        
        addHistory(id, mangaData.title);
        setIsMangaBookmarked(isBookmarked(id));
        
        console.log(`Successfully loaded manga details and ${chaptersData.length} chapters`);
      } catch (err) {
        console.error('Error fetching manga details:', err);
        setError('Failed to load manga. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMangaDetails();
  }, [id]);

  const retryLoading = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      fetchMangaDetails();
    }, 1000);
  };
  
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isMangaBookmarked) {
        removeBookmark(id);
        setIsMangaBookmarked(false);
        setModalMessage(`Manga ${manga.title} telah dihapus dari bookmark!`);
      } else {
        addBookmark(id, manga.title);
        setIsMangaBookmarked(true);
        setModalMessage(`Manga ${manga.title} telah ditambahkan ke bookmark!`);
      }
      setIsSuccess(true);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Gagal mengelola bookmark:', err);
      setModalMessage('Gagal mengelola bookmark. Silakan coba lagi.');
      setIsSuccess(false);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-400">Memuat detail manga...</p>
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
              onClick={() => navigate('/')}
            >
              Kembali ke Beranda
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
  
  if (!manga) {
    return null;
  }
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-blue-400 hover:text-blue-500"
            >
              ← Kembali
            </button>
            <h1 className="text-lg sm:text-xl font-bold truncate">{manga.title}</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex md:hidden mb-4 border-b border-gray-700">
          <button 
            onClick={() => toggleTab('info')}
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'info' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Informasi
          </button>
          <button 
            onClick={() => toggleTab('chapters')}
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'chapters' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Chapter {chapters.length > 0 && `(${chapters.length})`}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {(activeTab === 'info' || window.innerWidth >= 768) && (
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={manga.coverArt || 'https://via.placeholder.com/400x600'} 
                  alt={manga.title} 
                  className="w-full h-auto object-cover"
                />
              </div>
              <button
                onClick={handleBookmarkToggle}
                className={`mt-4 w-full py-2 rounded text-white transition-colors ${
                  isMangaBookmarked ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isMangaBookmarked ? 'Hapus dari Bookmark' : 'Tambah ke Bookmark'}
              </button>
            </div>
          )}
          
          <div className="w-full md:w-2/3 lg:w-3/4">
            {(activeTab === 'info' || window.innerWidth >= 768) && (
              <div className="mb-8 md:mb-10">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:hidden">
                  {manga.title}
                </h1>
                
                <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                  {manga.tags && manga.tags.slice(0, 8).map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 md:mb-6">
                  {manga.author && (
                    <div>
                      <span className="text-gray-400 text-sm">Penulis:</span>
                      <p>{manga.author}</p>
                    </div>
                  )}
                  
                  {manga.artist && manga.artist !== manga.author && (
                    <div>
                      <span className="text-gray-400 text-sm">Ilustrator:</span>
                      <p>{manga.artist}</p>
                    </div>
                  )}
                  
                  {manga.status && (
                    <div>
                      <span className="text-gray-400 text-sm">Status:</span>
                      <p className="capitalize">{manga.status}</p>
                    </div>
                  )}
                  
                  {manga.year && (
                    <div>
                      <span className="text-gray-400 text-sm">Tahun:</span>
                      <p>{manga.year}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Sinopsis</h2>
                  <p className="text-gray-300 leading-relaxed">{manga.description}</p>
                </div>
              </div>
            )}
            
            {(activeTab === 'chapters' || window.innerWidth >= 768) && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-2 border-b border-gray-700">
                  <h2 className="text-lg md:text-xl font-bold text-orange-500">Daftar Chapter</h2>
                  <div className="text-sm text-gray-400">
                    {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                  </div>
                </div>
                
                {chapters.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p>Belum ada chapter tersedia.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-8">
                    {chapters.map(chapter => (
                      <Link
                        key={chapter.id} 
                        to={`/read/${manga.id}/${chapter.id}`}
                        className="block bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-700 transition-colors"
                        onClick={() => console.log(`Navigating to chapter ${chapter.chapter}, ID: ${chapter.id}`)}
                      >
                        <div className="flex justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-medium text-sm sm:text-base">
                              Chapter {chapter.chapter}
                              {chapter.title && ` - ${chapter.title}`}
                            </span>
                            <div className="text-xs sm:text-sm text-gray-400 mt-1">
                              {chapter.groupNames && chapter.groupNames.join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400">
                              {chapter.publishDate}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {chapter.language && chapter.language.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Modal
        isOpen={isModalOpen}
        message={modalMessage}
        isSuccess={isSuccess}
        onClose={closeModal}
      />
      
      <Footer />
    </div>
  );
};

export default MangaDetailPage;