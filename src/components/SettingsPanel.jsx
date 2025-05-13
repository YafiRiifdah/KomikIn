import React from 'react';

const SettingsPanel = ({ readerSettings, updateReaderSettings, toggleSettings }) => {
  return (
    <div className={`fixed top-16 sm:top-14 right-2 sm:right-4 z-50 bg-gray-800 shadow-lg rounded-lg p-2 sm:p-4 w-[90%] sm:w-64 max-w-[calc(100vw-1rem)] transition-all duration-300 transform origin-top-right 
      ${readerSettings.showSettings ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
      <h3 className="text-sm sm:text-lg font-medium mb-2 sm:mb-3">Pengaturan Reader</h3>
      <div className="space-y-2 sm:space-y-4">
        {/* Reading Mode */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Mode Baca</label>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button 
              onClick={() => updateReaderSettings('mode', 'vertical')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${readerSettings.mode === 'vertical' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Vertikal
            </button>
            <button 
              onClick={() => updateReaderSettings('mode', 'horizontal')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${readerSettings.mode === 'horizontal' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Horizontal
            </button>
            <button 
              onClick={() => updateReaderSettings('mode', 'single')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${readerSettings.mode === 'single' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Single
            </button>
          </div>
        </div>

        {/* Reading Direction (for horizontal/single) */}
        {readerSettings.mode !== 'vertical' && (
          <div>
            <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Arah Baca</label>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button 
                onClick={() => updateReaderSettings('direction', 'rtl')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${readerSettings.direction === 'rtl' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Kanan-Kiri
              </button>
              <button 
                onClick={() => updateReaderSettings('direction', 'ltr')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${readerSettings.direction === 'ltr' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Kiri-Kanan
              </button>
            </div>
          </div>
        )}

        {/* Image Quality - Perbaikan Responsivitas */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Kualitas Gambar</label>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button 
              onClick={() => updateReaderSettings('quality', 'high')}
              className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full ${readerSettings.quality === 'high' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Tinggi
            </button>
            <button 
              onClick={() => updateReaderSettings('quality', 'medium')}
              className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full ${readerSettings.quality === 'medium' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Sedang
            </button>
            <button 
              onClick={() => updateReaderSettings('quality', 'low')}
              className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full ${readerSettings.quality === 'low' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Rendah
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={toggleSettings}
        className="mt-2 sm:mt-4 bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 sm:px-3 rounded text-xs sm:text-sm w-full"
      >
        Tutup
      </button>
    </div>
  );
};

export default SettingsPanel;