// src/pages/GenrePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { searchMangaByGenre } from '../api/mangaApi';
import { getGenres } from '../api/genresApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GenrePage = () => {
  const { genreId } = useParams();
  const [mangaList, setMangaList] = useState([]);
  const [genreName, setGenreName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50; // Harus sesuai dengan limit di searchMangaByGenre

  // Ref untuk elemen sentinel (untuk IntersectionObserver)
  const sentinelRef = useRef(null);

  // Fungsi untuk memuat lebih banyak manga
  const loadMoreManga = async () => {
    if (isLoadingMore || !hasMore) return; // Jangan muat jika sedang memuat atau tidak ada lagi data

    try {
      setIsLoadingMore(true);
      const data = await searchMangaByGenre(genreId, limit, offset);
      setMangaList(prev => [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset(prev => prev + limit);
    } catch (err) {
      setError('Gagal memuat lebih banyak manga');
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // useEffect untuk memuat data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Ambil daftar genre untuk mendapatkan nama genre berdasarkan genreId
        const genres = await getGenres();
        const selectedGenre = genres.find(genre => genre.id === genreId);
        setGenreName(selectedGenre ? selectedGenre.name : 'Genre Tidak Diketahui');

        // Ambil manga berdasarkan genre
        const data = await searchMangaByGenre(genreId, limit, 0);
        setMangaList(data);
        setHasMore(data.length === limit);
        setOffset(limit);
        setError(null);
      } catch (err) {
        setError('Gagal memuat manga untuk genre ini');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Scroll ke atas saat halaman dimuat
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetchData();
  }, [genreId]);

  // useEffect untuk mengatur IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreManga();
        }
      },
      { threshold: 0.1 } // Trigger ketika 10% dari sentinel terlihat
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, isLoadingMore, offset, genreId]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-6">Manga - {genreName}</h1>
        {isLoading ? (
          <div className="flex justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 text-red-500 p-4 rounded-lg text-center">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {mangaList.map(manga => (
                <div key={manga.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:translate-y-1 transition-transform duration-300">
                  <a href={`/manga/${manga.id}`} className="block">
                    <div className="h-40 sm:h-48 md:h-52 overflow-hidden">
                      <img src={manga.image} alt={manga.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-medium truncate">{manga.title}</h3>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            {/* Elemen sentinel untuk IntersectionObserver */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-6">
                {isLoadingMore ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                ) : null}
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

export default GenrePage;