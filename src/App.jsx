import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import NotFound from './pages/NotFound';
import MangaDetailPage from './pages/mangadetailpage';
import MangaReaderPage from './pages/mangareaderpage';
import AllPopularPage from './pages/AllPopularpage';
import Login from './auth/Login';
import Register from './auth/Register';
import Bookmarks from './pages/Bookmarks';
import History from './pages/History';
import Settings from './pages/Settings';
import LatestUpdatesPage from './pages/LatestUpdates';
import GenrePage from './pages/GenrePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-popular" element={<AllPopularPage />} />
        <Route path="/manga/:id" element={<MangaDetailPage />} />
        <Route path="/read/:mangaId/:chapterId" element={<MangaReaderPage />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/bookmarks' element={<Bookmarks/>} />
        <Route path='/history' element={<History/>} />
        <Route path='/settings' element={<Settings/>} />
        <Route path='/latest-updates' element={<LatestUpdatesPage/>} />
        <Route path="/genre/:genreId" element={<GenrePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;