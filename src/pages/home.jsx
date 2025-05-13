// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularManga, searchManga } from '../api/mangaApi';
import { getLatestUpdates } from '../api/updatesApi';
import { getGenres } from '../api/genresApi';
import LatestUpdatesPage from './LatestUpdatespage';

// Import components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [popularManga, setPopularManga] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [genres, setGenres] = useState([]);

  const [isLoading, setIsLoading] = useState({
    popular: true,
    latest: true,
    genres: true
  });
  const [error, setError] = useState({
    popular: null,
    latest: null,
    genres: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, popular: true }));
        const popularData = await getPopularManga(7);
        setPopularManga(popularData);
        setError(prev => ({ ...prev, popular: null }));
      } catch (err) {
        setError(prev => ({ ...prev, popular: 'Gagal memuat manga populer' }));
        console.error(err);
      } finally {
        setIsLoading(prev => ({ ...prev, popular: false }));
      }

      try {
        setIsLoading(prev => ({ ...prev, latest: true }));
        const latestData = await getLatestUpdates(8);
        setLatestUpdates(latestData);
        setError(prev => ({ ...prev, latest: null }));
      } catch (err) {
        setError(prev => ({ ...prev, latest: 'Gagal memuat update terbaru' }));
        console.error(err);
      } finally {
        setIsLoading(prev => ({ ...prev, latest: false }));
      }

      try {
        setIsLoading(prev => ({ ...prev, genres: true }));
        const genresData = await getGenres();
        setGenres(genresData);
        setError(prev => ({ ...prev, genres: null }));
      } catch (err) {
        setError(prev => ({ ...prev, genres: 'Gagal memuat genre' }));
        console.error(err);
      } finally {
        setIsLoading(prev => ({ ...prev, genres: false }));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setIsLoading(prev => ({ ...prev, latest: true }));
        const data = await getLatestUpdates(8);
        setLatestUpdates(data);
        setError(prev => ({ ...prev, latest: null }));
      } catch (err) {
        setError(prev => ({ ...prev, latest: 'Gagal memuat update terbaru' }));
        console.error(err);
      } finally {
        setIsLoading(prev => ({ ...prev, latest: false }));
      }
    };

    fetchLatest();
    const intervalId = setInterval(fetchLatest, 300000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <section className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-orange-500">Manga Populer</h2>
            <Link to="/all-popular" className="text-gray-400 text-xs sm:text-sm hover:text-orange-500">Lihat Semua</Link>
          </div>
          {isLoading.popular ? (
            <div className="flex justify-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error.popular ? (
            <div className="bg-red-900/20 text-red-500 p-4 rounded-lg text-center">
              {error.popular}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 scrollbar-hide">
              {popularManga.map(manga => (
                <div key={manga.id} className="flex-none w-32 sm:w-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:translate-y-1 sm:hover:translate-y-2 transition-transform duration-300">
                  <Link to={`/manga/${manga.id}`} className="block">
                    <div className="h-44 sm:h-56 overflow-hidden">
                      <img src={manga.image} alt={manga.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-sm sm:text-base font-medium truncate">{manga.title}</h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-orange-500">Update Terbaru</h2>
            <Link to="/latest-updates" className="text-gray-400 text-xs sm:text-sm hover:text-orange-500">Lihat Semua</Link>
          </div>
          {isLoading.latest ? (
            <div className="flex justify-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error.latest ? (
            <div className="bg-red-900/20 text-red-500 p-4 rounded-lg text-center">
              {error.latest}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {latestUpdates.map(manga => (
                <div key={manga.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:translate-y-1 transition-transform duration-300">
                  <Link to={`/manga/${manga.mangaId}`} className="block">
                    <div className="h-40 sm:h-48 md:h-52 overflow-hidden">
                      <img src={manga.image} alt={manga.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-medium truncate">{manga.title}</h3>
                      <p className="text-xs">
                        <span className="text-orange-500 font-medium">{manga.chapter}</span>
                      </p>
                      <p className="text-xs text-gray-400">{manga.time}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-orange-500">Genre</h2>
            <a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-orange-500">Lihat Semua</a>
          </div>
          {isLoading.genres ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error.genres ? (
            <div className="bg-red-900/20 text-red-500 p-4 rounded-lg text-center">
              {error.genres}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.id}`}
                  className="bg-gray-800 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-orange-500 transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          )}
        </section>
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

export default Home;