import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllManga, getAllTags } from '../api/mangadexservice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllMangaPage = () => {
  // State untuk daftar manga
  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20); // Manga per halaman
  
  // State untuk filter
  const [filters, setFilters] = useState({
    sortBy: 'followedCount',
    sortOrder: 'desc',
    includedTags: [],
    status: '',
    contentRating: ['safe']
  });
  
  // State untuk tag options (untuk filter)
  const [tagOptions, setTagOptions] = useState({
    genre: [],
    theme: [],
    format: []
  });
  
  // State untuk UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  
  // Load manga list
  useEffect(() => {
    const loadManga = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getAllManga(currentPage, limit, filters);
        
        setMangaList(response.manga);
        setTotalPages(response.pagination.lastPage);
        
      } catch (err) {
        console.error('Error loading manga list:', err);
        setError(err.message || 'Failed to load manga list. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadManga();
  }, [currentPage, limit, filters]);
  
  // Load tag options untuk filter
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        
        setTagOptions({
          genre: tags.genre || [],
          theme: tags.theme || [],
          format: tags.format || []
        });
        
      } catch (err) {
        console.error('Error loading tags:', err);
        // Tidak set error di sini karena tags adalah fitur tambahan saja
      }
    };
    
    loadTags();
  }, []);
  
  // Handle page change
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll ke atas halaman
      window.scrollTo(0, 0);
    }
  };
  
  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Reset ke halaman 1
    setCurrentPage(1);
  };
  
  // Handle tag selection
  const toggleTag = (tagId) => {
    let newSelectedTags;
    
    if (selectedTagIds.includes(tagId)) {
      // Hapus tag jika sudah diselect
      newSelectedTags = selectedTagIds.filter(id => id !== tagId);
    } else {
      // Tambahkan tag
      newSelectedTags = [...selectedTagIds, tagId];
    }
    
    setSelectedTagIds(newSelectedTags);
    
    // Update filters
    handleFilterChange('includedTags', newSelectedTags);
  };
  
  // Generate pagination UI
  const renderPagination = () => {
    // Jika kurang dari 2 halaman, tidak perlu pagination
    if (totalPages <= 1) return null;
    
    const pages = [];
    
    // Selalu tampilkan halaman 1, halaman saat ini, dan halaman terakhir
    // Serta 1 halaman sebelum dan sesudah halaman saat ini
    
    let pageNumbers = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    // Hapus halaman yang tidak valid (< 1 atau > totalPages)
    pageNumbers = [...pageNumbers].filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b);
    
    // Render halaman dengan ellipsis untuk skip yang panjang
    let prevPage = 0;
    
    pageNumbers.forEach(page => {
      if (page - prevPage > 1) {
        pages.push(
          <span key={`ellipsis-${page}`} className="px-3 py-1 text-gray-500">...</span>
        );
      }
      
      pages.push(
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`px-3 py-1 rounded-md ${
            currentPage === page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      );
      
      prevPage = page;
    });
    
    return (
      <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          ← Prev
        </button>
        
        {pages}
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Next →
        </button>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-500">Daftar Manga</h1>
          
          <button 
            onClick={toggleFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
          >
            <span>Filter</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/>
            </svg>
          </button>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-6">
              {/* Sort Options */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-400 mb-2">Urutkan Berdasarkan</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full sm:w-auto bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none"
                >
                  <option value="followedCount">Popularitas</option>
                  <option value="latestUploadedChapter">Update Terbaru</option>
                  <option value="title">Judul</option>
                  <option value="createdAt">Baru Ditambahkan</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-400 mb-2">Arah Urutan</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full sm:w-auto bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none"
                >
                  <option value="desc">Menurun</option>
                  <option value="asc">Menaik</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full sm:w-auto bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none"
                >
                  <option value="">Semua</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {/* Genre/Tag Filters */}
            {tagOptions.genre.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pb-2 pr-2">
                  {tagOptions.genre.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    sortBy: 'followedCount',
                    sortOrder: 'desc',
                    includedTags: [],
                    status: '',
                    contentRating: ['safe']
                  });
                  setSelectedTagIds([]);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 text-red-500 p-6 rounded-lg text-center">
            <p>{error}</p>
            <button
              onClick={() => {
                setCurrentPage(1);
                setFilters({
                  sortBy: 'followedCount',
                  sortOrder: 'desc',
                  includedTags: [],
                  status: '',
                  contentRating: ['safe']
                });
              }}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Manga Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {mangaList.map(manga => (
                <Link
                  key={manga.id}
                  to={`/manga/${manga.id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:translate-y-1 transition-transform duration-300"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={manga.image} 
                      alt={manga.title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="text-sm sm:text-base font-medium truncate">{manga.title}</h3>
                    {manga.status && (
                      <p className="text-xs text-gray-400 capitalize">{manga.status}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Tidak ada hasil */}
            {mangaList.length === 0 && !isLoading && !error && (
              <div className="text-center py-10">
                <p className="text-gray-400">Tidak ada manga yang ditemukan dengan filter yang dipilih.</p>
                <button
                  onClick={() => {
                    setFilters({
                      sortBy: 'followedCount',
                      sortOrder: 'desc',
                      includedTags: [],
                      status: '',
                      contentRating: ['safe']
                    });
                    setSelectedTagIds([]);
                  }}
                  className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white"
                >
                  Reset Filter
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </main>
      
      <Footer />
      
      {/* Back to top button */}
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

export default AllMangaPage;