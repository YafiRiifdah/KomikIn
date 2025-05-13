import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReaderFooter = ({ mangaId, chapterNavigation }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ReaderFooter;