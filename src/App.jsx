import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import NotFound from './pages/NotFound';
import MangaDetailPage from './pages/mangadetailpage';
import MangaReaderPage from './pages/mangareaderpage';
import AllPopularPage from './pages/AllPopularpage'; // Pastikan path ini benar


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-popular" element={<AllPopularPage />} />                           {/* route ke halaman Home */}
        <Route path="/manga/:id" element={<MangaDetailPage />} />       {/* route ke detail manga */}
        <Route path="/read/:mangaId/:chapterId" element={<MangaReaderPage />} />  {/* route ke pembaca manga */}
        <Route path="*" element={<NotFound />} />                       {/* route fallback jika tidak ditemukan */}
      </Routes>
    </Router>
  );
}

export default App;