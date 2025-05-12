import React from 'react';
import { getCurrentUser } from '../api/authApi';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Bookmarks = () => {
  const currentUser = getCurrentUser();

  // Jika pengguna belum login, redirect ke halaman login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h2 className="text-2xl font-bold text-orange-500 mb-6">Bookmarks</h2>
        <p className="text-gray-300">Ini adalah halaman bookmark untuk pengguna {currentUser}.</p>
        <p className="text-gray-400">Fitur ini belum diimplementasikan. Silakan tambahkan logika untuk menampilkan bookmark pengguna.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Bookmarks;