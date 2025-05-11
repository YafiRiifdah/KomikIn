import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularManga } from '../api/mangadexservice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllPopularPage = () => {
  const [popularManga, setPopularManga] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPopularManga = async () => {
      try {
        setIsLoading(true);
        console.log(`Mengambil data manga populer untuk halaman ${page}...`);
        const data = await getPopularManga(20, (page - 1) * 20); // Gunakan offset
        console.log('Data dari API:', data);

        if (Array.isArray(data)) {
          setPopularManga(prev => (page === 1 ? data : [...prev, ...data]));
          setHasMore(data.length === 20 && page < 5); // Batasi hingga 5 halaman (100 manga)
          setError(null);
        } else {
          throw new Error('Data dari API bukan array');
        }
      } catch (err) {
        setError('Gagal memuat manga populer');
        console.error('Error saat mengambil data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularManga();
  }, [page]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      console.log('Memuat lebih banyak data...');
      setPage(prev => prev + 1);
    }
  };

  console.log('Manga yang ditampilkan:', popularManga);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-orange-500 mb-6 sm:mb-8">
          Semua Manga Populer
        </h1>

        {error ? (
          <div className="bg-red-900/20 text-red-500 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
          <>
            {popularManga.length === 0 && !isLoading ? (
              <div className="text-center text-gray-400 py-10">
                Tidak ada manga yang ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {popularManga.map(manga => (
                  <div
                    key={manga.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:translate-y-1 transition-transform duration-300"
                  >
                    <Link to={`/manga/${manga.id}`} className="block">
                      <div className="h-40 sm:h-48 md:h-52 overflow-hidden">
                        <img
                          src={manga.image}
                          alt={manga.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 sm:p-3">
                        <h3 className="text-xs sm:text-sm font-medium truncate">
                          {manga.title}
                        </h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
              </div>
            )}

            {hasMore && !isLoading && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm sm:text-base"
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default AllPopularPage;