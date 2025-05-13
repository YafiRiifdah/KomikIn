import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReaderHeader = ({ manga, chapter, chapterNavigation, toggleSettings, mangaId }) => {
  const navigate = useNavigate();

  return (
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
            <div className="flex items-center gap-1">
              <button 
                onClick={() => chapterNavigation.prev && navigate(`/read/${mangaId}/${chapterNavigation.prev.id}`)}
                className={`p-1 sm:p-2 rounded text-sm sm:text-base ${chapterNavigation.prev ? 'text-blue-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`}
                disabled={!chapterNavigation.prev}
                aria-label="Previous Chapter"
              >
                ← <span className="hidden sm:inline">Prev</span>
              </button>
              <button 
                onClick={() => chapterNavigation.next && navigate(`/read/${mangaId}/${chapterNavigation.next.id}`)}
                className={`p-1 sm:p-2 rounded text-sm sm:text-base ${chapterNavigation.next ? 'text-blue-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`}
                disabled={!chapterNavigation.next}
                aria-label="Next Chapter"
              >
                <span className="hidden sm:inline">Next</span> →
              </button>
            </div>
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
  );
};

export default ReaderHeader;