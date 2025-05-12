import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchManga } from '../api/mangaApi'; // Perbarui impor sesuai struktur baru
import { logout, getCurrentUser } from '../api/authApi';

const Navbar = () => {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAuthenticated = !!currentUser;

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Hide search results when toggling menu
    if (!mobileMenuOpen) {
      setShowSearchResults(false);
    }
    // Pastikan dropdown profil tertutup saat menu mobile dibuka/tutup
    setIsProfileDropdownOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    if (e.target.value.trim() === '') {
      setShowSearchResults(false);
    }
  };

  // Perform search when user types
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim() !== '') {
        try {
          const results = await searchManga(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
        }
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle search submit (for mobile)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      try {
        const results = await searchManga(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  // Close search results and profile dropdown when clicking outside
  const handleClickOutside = () => {
    setShowSearchResults(false);
    setIsProfileDropdownOpen(false);
  };

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setShowSearchResults(false);
    setIsProfileDropdownOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Gagal logout:', err);
    }
  };

  return (
    <>
      <header className="bg-gray-900 sticky top-0 z-50 shadow-md py-3 sm:py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-blue-500 text-xl sm:text-2xl font-bold">
              <div className="bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center">
                <span className="text-blue-500 text-base sm:text-xl">📚</span>
              </div>
              <span>KomikIn</span>
            </Link>
            
            {/* Navigation - Center on Desktop */}
            <nav className="hidden lg:flex items-center">
              <div className="flex gap-6">
                <Link to="/" className="text-blue-400 hover:text-blue-500 transition-colors">Beranda</Link>
                <Link to="/#" className="text-blue-400 hover:text-blue-500 transition-colors">Daftar Manga</Link>
                <Link to="/#" className="text-blue-400 hover:text-blue-500 transition-colors">Terbaru</Link>
                <Link to="/#" className="text-blue-400 hover:text-blue-500 transition-colors">Populer</Link>
                <Link to="/#" className="text-blue-400 hover:text-blue-500 transition-colors">Genre</Link>
              </div>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-2xl text-white"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
            
            {/* Search Box and Profile Icon - Right on Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 w-64 relative">
                <span className="text-blue-400 mr-2">🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari manga..." 
                  className="bg-transparent border-none text-white w-full focus:outline-none"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {searchResults.map(manga => (
                      <Link
                        key={manga.id}
                        to={`/manga/${manga.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <img 
                          src={manga.image} 
                          alt={manga.title} 
                          className="w-10 h-14 object-cover rounded"
                        />
                        <span className="text-sm">{manga.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Ikon Profil dengan Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="text-blue-400 hover:text-blue-500 focus:outline-none"
                  aria-label="Profil Pengguna"
                >
                  🧑‍💼 {/* Emoji sebagai ikon profil */}
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 text-blue-400 border-b border-gray-600">
                          <span className="font-medium">{currentUser}</span>
                        </div>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-blue-400 hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-blue-400 hover:bg-gray-700 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-blue-400 hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-blue-400 hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Menu - Responsive */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 bg-gray-800 rounded-lg p-4 shadow-md">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-700 rounded-full px-4 py-2 mb-4">
                <span className="text-blue-400 mr-2">🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari manga..." 
                  className="bg-transparent border-none text-white w-full focus:outline-none"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
              
              {/* Mobile Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="bg-gray-700 rounded-lg shadow-lg mb-4 max-h-96 overflow-y-auto">
                  {searchResults.map(manga => (
                    <Link
                      key={manga.id}
                      to={`/manga/${manga.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-600 transition-colors"
                      onClick={handleLinkClick}
                    >
                      <img 
                        src={manga.image} 
                        alt={manga.title} 
                        className="w-10 h-14 object-cover rounded"
                      />
                      <span className="text-sm">{manga.title}</span>
                    </Link>
                  ))}
                </div>
              )}
              
              <nav className="flex flex-col gap-2">
                <Link to="/" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Beranda</Link>
                <Link to="/#" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Daftar Manga</Link>
                <Link to="/#" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Terbaru</Link>
                <Link to="/#" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Populer</Link>
                <Link to="/#" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Genre</Link>
                {/* Tambah opsi login/register untuk mobile */}
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Login</Link>
                    <Link to="/register" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Register</Link>
                  </>
                ) : (
                  <>
                    <Link to="/settings" onClick={handleLinkClick} className="text-blue-400 py-2 hover:text-blue-500 transition-colors">Settings</Link>
                    <button
                      onClick={handleLogout}
                      className="text-left text-blue-400 py-2 hover:text-blue-500 transition-colors"
                    >
                      Logout ({currentUser})
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Overlay to close search results and profile dropdown when clicking outside */}
      {(showSearchResults || isProfileDropdownOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={handleClickOutside}
        ></div>
      )}
    </>
  );
};

export default Navbar;