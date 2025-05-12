// Fungsi untuk register pengguna baru
export const register = (username, password) => {
  try {
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username]) {
      throw new Error('Username sudah terdaftar. Silakan gunakan username lain.');
    }

    users[username] = {
      password,
      bookmarks: [],
      history: [],
    };

    localStorage.setItem('users', JSON.stringify(users));
    console.log(`Pengguna ${username} berhasil didaftarkan`);
    return true;
  } catch (error) {
    console.error('Gagal mendaftar:', error);
    throw error;
  }
};

// Fungsi untuk login
export const login = (username, password) => {
  try {
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (!users[username]) {
      throw new Error('Username tidak ditemukan.');
    }
    if (users[username].password !== password) {
      throw new Error('Password salah.');
    }

    localStorage.setItem('currentUser', username);
    console.log(`Pengguna ${username} berhasil login`);
    return true;
  } catch (error) {
    console.error('Gagal login:', error);
    throw error;
  }
};

// Fungsi untuk logout
export const logout = () => {
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      console.log('Tidak ada pengguna yang login');
      return;
    }

    localStorage.removeItem('currentUser');
    console.log(`Pengguna ${currentUser} berhasil logout`);
  } catch (error) {
    console.error('Gagal logout:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pengguna yang sedang login
export const getCurrentUser = () => {
  return localStorage.getItem('currentUser');
};

// Fungsi untuk mendapatkan bookmarks pengguna
export const getBookmarks = () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[currentUser]?.bookmarks || [];
  } catch (error) {
    console.error('Gagal mengambil bookmarks:', error);
    return [];
  }
};

// Fungsi untuk mendapatkan history pengguna
export const getHistory = () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[currentUser]?.history || [];
  } catch (error) {
    console.error('Gagal mengambil history:', error);
    return [];
  }
};

// Fungsi untuk memeriksa apakah manga sudah ada di bookmarks
export const isBookmarked = (mangaId) => {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(bookmark => bookmark.id === mangaId);
  } catch (error) {
    console.error('Gagal memeriksa bookmark:', error);
    return false;
  }
};

// Fungsi untuk menambahkan bookmark
export const addBookmark = (mangaId, mangaTitle) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Pengguna belum login');

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[currentUser];

    if (!user.bookmarks.some(bookmark => bookmark.id === mangaId)) {
      user.bookmarks.push({ id: mangaId, title: mangaTitle });
      users[currentUser] = user;
      localStorage.setItem('users', JSON.stringify(users));
      console.log(`Bookmark ${mangaId} - ${mangaTitle} ditambahkan untuk ${currentUser}`);
    }
  } catch (error) {
    console.error('Gagal menambahkan bookmark:', error);
    throw error;
  }
};

// Fungsi untuk menghapus bookmark
export const removeBookmark = (mangaId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Pengguna belum login');

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[currentUser];

    user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== mangaId);
    users[currentUser] = user;
    localStorage.setItem('users', JSON.stringify(users));
    console.log(`Bookmark ${mangaId} dihapus untuk ${currentUser}`);
  } catch (error) {
    console.error('Gagal menghapus bookmark:', error);
    throw error;
  }
};

// Fungsi untuk menambahkan history
export const addHistory = (mangaId, mangaTitle) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Pengguna belum login');

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[currentUser];

    user.history = user.history.filter(item => item.id !== mangaId);
    user.history.unshift({ id: mangaId, title: mangaTitle });
    if (user.history.length > 10) user.history.pop();
    users[currentUser] = user;
    localStorage.setItem('users', JSON.stringify(users));
    console.log(`History ${mangaId} - ${mangaTitle} ditambahkan untuk ${currentUser}`);
  } catch (error) {
    console.error('Gagal menambahkan history:', error);
    throw error;
  }
};