import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-6 sm:py-8 text-gray-400">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">MangaKu</h3>
            <p className="text-xs sm:text-sm">Tempat membaca manga online terlengkap dan terupdate dalam bahasa Indonesia.</p>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Navigasi</h3>
            <div className="flex flex-col gap-1 sm:gap-2">
              <Link to="/" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Beranda</Link>
              <Link to="/#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Daftar Manga</Link>
              <Link to="/#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Terbaru</Link>
              <Link to="/#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Populer</Link>
              <Link to="/#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Genre</Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Info</h3>
            <div className="flex flex-col gap-1 sm:gap-2">
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Tentang Kami</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Ketentuan Layanan</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Kebijakan Privasi</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">DMCA</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">FAQ</a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Hubungi Kami</h3>
            <div className="flex flex-col gap-1 sm:gap-2">
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Discord</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Twitter</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Facebook</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Instagram</a>
              <a href="#" className="text-xs sm:text-sm hover:text-orange-500 transition-colors">Email</a>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 sm:mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} KommikIn. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;