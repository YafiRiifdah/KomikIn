import React, { useState, useEffect } from 'react';
import { getCurrentUser, getBookmarks, getHistory } from '../api/authApi';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Settings = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const bookmarksData = getBookmarks();
    const historyData = getHistory();
    console.log('Bookmarks data:', bookmarksData);
    console.log('History data:', historyData);
    setBookmarks(bookmarksData);
    setHistory(historyData);
  }, []);

  // Filter hanya item dengan title yang valid
  const validBookmarks = bookmarks.filter(bookmark => bookmark.title && bookmark.title.trim() !== '');
  const validHistory = history.filter(item => item.title && item.title.trim() !== '');

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h2 className="text-2xl font-bold text-orange-500 mb-6">Settings</h2>
        <div className="space-y-8">
          {/* Section Bookmarks */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-orange-500 mb-4">Bookmarks</h3>
            {validBookmarks.length > 0 ? (
              <ul className="space-y-2">
                {validBookmarks.map((bookmark, index) => (
                  <li key={index} className="p-2 bg-gray-700 rounded flex justify-between items-center">
                    <Link to={`/manga/${bookmark.id}`} className="text-blue-400 hover:underline">
                      {bookmark.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Belum ada bookmark.</p>
            )}
          </div>

          {/* Section History */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-orange-500 mb-4">History</h3>
            {validHistory.length > 0 ? (
              <ul className="space-y-2">
                {validHistory.map((item, index) => (
                  <li key={index} className="p-2 bg-gray-700 rounded flex justify-between items-center">
                    <Link to={`/manga/${item.id}`} className="text-blue-400 hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Belum ada history.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;