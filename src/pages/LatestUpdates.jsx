import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLatestUpdates } from '../api/updatesApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InfiniteScroll from 'react-infinite-scroll-component';

const LatestUpdatesPage = () => {
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // Jumlah item per halaman
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchLatestUpdates = async () => {
      setIsLoading(true);
      try {
        const offset = (page - 1) * limit;
        const newUpdates = await getLatestUpdates(limit, offset);

        if (newUpdates.length < limit) {
          setHasMore(false);
        }

        setLatestUpdates(prev => [...prev, ...newUpdates]);
        setError(null);
      } catch (err) {
        setError('Gagal memuat update terbaru');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUpdates();
  }, [page, limit]);

  const fetchMoreData = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const retryFetch = () => {
    setError(null);
    setPage(1);
    setLatestUpdates([]);
    setHasMore(true);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-6">Semua Update Terbaru</h1>
        {error ? (
          <div className="bg-red-900/20 text-red-500 p-4 rounded-lg text-center">
            {error}
            <button
              onClick={retryFetch}
              className="ml-2 bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        ) : isLoading && latestUpdates.length === 0 ? (
          <div className="flex justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={latestUpdates.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
              </div>
            }
            endMessage={
              <p className="text-center text-gray-400 py-4">Tidak ada pembaruan lagi</p>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {latestUpdates.map(update => (
                <div key={`${update.mangaId}-${update.chapter}`} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:translate-y-1 transition-transform duration-300">
                  <Link to={`/manga/${update.mangaId}`} className="block">
                    <div className="h-40 sm:h-48 md:h-52 overflow-hidden">
                      <img src={update.image} alt={update.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-medium truncate">{update.title}</h3>
                      <p className="text-xs">
                        <span className="text-orange-500 font-medium">{update.chapter}</span>
                      </p>
                      <p className="text-xs text-gray-400">{update.time}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </InfiniteScroll>
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

export default LatestUpdatesPage;