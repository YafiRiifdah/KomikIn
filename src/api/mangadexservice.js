const API_BASE_URL = 'https://api.mangadex.org';

// Fungsi helper untuk fetch dengan retry
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Jika 429 (Too Many Requests), tunggu lebih lama
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 5;
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetchWithRetry(url, options, retries, delay);
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying fetch to ${url}. Retries left: ${retries-1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

// Mengambil data manga berdasarkan ID
export const getMangaById = async (mangaId) => {
  try {
    console.log(`Fetching manga with ID: ${mangaId}`);
    const mangaResponse = await fetchWithRetry(
      `${API_BASE_URL}/manga/${mangaId}?includes[]=cover_art`
    );
    
    if (!mangaResponse || !mangaResponse.data) {
      throw new Error('Invalid manga data format');
    }
    
    // Process manga data
    const coverArt = mangaResponse.data.relationships.find(rel => rel.type === 'cover_art');
    const coverFile = coverArt?.attributes?.fileName;
    
    return {
      id: mangaResponse.data.id,
      title: mangaResponse.data.attributes.title.en || Object.values(mangaResponse.data.attributes.title)[0],
      coverArt: coverFile 
        ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFile}.256.jpg` 
        : '/api/placeholder/200/300',
      description: mangaResponse.data.attributes.description?.en || 
                   Object.values(mangaResponse.data.attributes.description || {})[0] || 
                   'Tidak ada deskripsi',
      status: mangaResponse.data.attributes.status,
      year: mangaResponse.data.attributes.year,
      tags: mangaResponse.data.attributes.tags?.map(tag => tag.attributes?.name?.en) || []
    };
  } catch (error) {
    console.error(`Error fetching manga ID ${mangaId}:`, error);
    throw new Error(`Failed to load manga: ${error.message}`);
  }
};

// Mengambil data chapter dan gambar dari at-home server
export const getChapterPages = async (chapterId, quality = 'low') => {
  try {
    console.log(`Fetching at-home server for chapter ID: ${chapterId}`);
    
    // Ambil data dari at-home server
    const atHomeResponse = await fetchWithRetry(`${API_BASE_URL}/at-home/server/${chapterId}`);
    
    if (!atHomeResponse.baseUrl || !atHomeResponse.chapter) {
      throw new Error("Invalid at-home server response");
    }
    
    // Periksa ketersediaan dataSaver
    if (!atHomeResponse.chapter.dataSaver || atHomeResponse.chapter.dataSaver.length === 0) {
      console.warn("dataSaver images not available, falling back to data");
      if (!atHomeResponse.chapter.data || atHomeResponse.chapter.data.length === 0) {
        throw new Error("No image data found in the chapter");
      }
    }
    
    // Get chapter details untuk informasi tambahan
    let chapterDetails = null;
    try {
      const chapterResponse = await fetchWithRetry(`${API_BASE_URL}/chapter/${chapterId}`);
      chapterDetails = chapterResponse.data;
    } catch (error) {
      console.warn("Could not fetch chapter details, using basic info", error);
    }
    
    // Determine quality and path
    let imagePath = 'data'; // Default untuk kualitas tinggi
    let imageFiles = atHomeResponse.chapter.data || [];
    
    if (quality === 'low' || quality === 'medium') {
      // Gunakan dataSaver untuk kualitas rendah dan sedang
      imagePath = 'data-saver';
      imageFiles = atHomeResponse.chapter.dataSaver || atHomeResponse.chapter.data || [];
    }
    
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error("No image data found in the chapter");
    }
    
    // Construct page URLs
    const pageUrls = imageFiles.map(
      filename => `${atHomeResponse.baseUrl}/${imagePath}/${atHomeResponse.chapter.hash}/${filename}`
    );
    
    return {
      id: chapterId,
      title: chapterDetails?.attributes?.title || "",
      chapter: chapterDetails?.attributes?.chapter || "Unknown",
      volume: chapterDetails?.attributes?.volume || null,
      translatedLanguage: chapterDetails?.attributes?.translatedLanguage || 'en',
      hash: atHomeResponse.chapter.hash,
      pages: pageUrls
    };
  } catch (error) {
    console.error(`Error fetching chapter ID ${chapterId}:`, error);
    throw new Error(`Failed to load chapter: ${error.message}`);
  }
};

// Mengambil daftar chapter untuk manga tertentu
export const getMangaChapters = async (mangaId, languages = ['id', 'en']) => {
  try {
    console.log(`Fetching chapters for manga: ${mangaId}`);
    const langParams = languages.map(lang => `translatedLanguage[]=${lang}`).join('&');
    const chaptersResponse = await fetchWithRetry(
      `${API_BASE_URL}/chapter?manga=${mangaId}&${langParams}&order[chapter]=desc&limit=100`
    );
    
    if (!chaptersResponse.data || !Array.isArray(chaptersResponse.data)) {
      throw new Error("Invalid chapters data format");
    }
    
    // Process chapters
    const chapters = chaptersResponse.data.map(chapter => {
      return {
        id: chapter.id,
        chapter: chapter.attributes.chapter,
        title: chapter.attributes.title,
        language: chapter.attributes.translatedLanguage,
        pages: chapter.attributes.pages,
        publishDate: new Date(chapter.attributes.publishAt).toLocaleDateString('id-ID', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        }),
        groups: chapter.relationships
          .filter(rel => rel.type === 'scanlation_group')
          .map(group => group.id)
      };
    });
    
    // Get group names
    const groupIds = [...new Set(chapters.flatMap(ch => ch.groups))];
    const groupPromises = groupIds.map(groupId => 
      fetchWithRetry(`${API_BASE_URL}/group/${groupId}`)
        .then(data => ({ id: groupId, name: data.data.attributes.name }))
        .catch(() => ({ id: groupId, name: 'Unknown Group' }))
    );
    
    const groups = await Promise.all(groupPromises);
    const groupsMap = Object.fromEntries(groups.map(group => [group.id, group.name]));
    
    // Add group names to chapters
    const chaptersWithGroups = chapters.map(chapter => ({
      ...chapter,
      groupNames: chapter.groups.map(groupId => groupsMap[groupId] || 'Unknown Group')
    }));
    
    return chaptersWithGroups;
  } catch (error) {
    console.error(`Error fetching chapters for manga ID ${mangaId}:`, error);
    throw new Error(`Failed to load chapters: ${error.message}`);
  }
};

// Mengambil informasi navigasi chapter (prev/next)
export const getChapterNavigation = async (mangaId, chapterId, languages = ['id', 'en']) => {
  try {
    console.log(`Fetching chapter navigation for manga: ${mangaId}, chapter: ${chapterId}`);
    const langParams = languages.map(lang => `translatedLanguage[]=${lang}`).join('&');
    const chaptersResponse = await fetchWithRetry(
      `${API_BASE_URL}/chapter?manga=${mangaId}&${langParams}&order[chapter]=asc`
    );
    
    if (!chaptersResponse.data || !Array.isArray(chaptersResponse.data)) {
      throw new Error("No chapters available");
    }
    
    // Find current chapter index
    const chapters = chaptersResponse.data;
    const currentIndex = chapters.findIndex(ch => ch.id === chapterId);
    
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }
    
    // Get prev and next chapters
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
    
    return {
      prev: prevChapter ? { 
        id: prevChapter.id,
        chapter: prevChapter.attributes.chapter
      } : null,
      next: nextChapter ? { 
        id: nextChapter.id,
        chapter: nextChapter.attributes.chapter
      } : null
    };
  } catch (error) {
    console.error(`Error fetching chapter navigation for manga ID ${mangaId}:`, error);
    return { prev: null, next: null };
  }
};

// Mencari manga berdasarkan query
export const searchManga = async (query, limit = 10) => {
  try {
    console.log(`Searching manga with query: "${query}", limit: ${limit}`);
    const searchResponse = await fetchWithRetry(
      `${API_BASE_URL}/manga?title=${encodeURIComponent(query)}&limit=${limit}&includes[]=cover_art`
    );
    
    if (!searchResponse.data || !Array.isArray(searchResponse.data)) {
      throw new Error("Invalid search results format");
    }
    
    // Process search results
    return searchResponse.data.map(manga => {
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      const coverFile = coverArt?.attributes?.fileName;
      
      return {
        id: manga.id,
        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
        image: coverFile 
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` 
          : '/api/placeholder/200/280'
      };
    });
  } catch (error) {
    console.error(`Error searching manga with query "${query}":`, error);
    throw new Error(`Failed to search manga: ${error.message}`);
  }
};

// Mengambil daftar manga populer
export const getPopularManga = async (limit = 10, offset = 0) => {
  try {
    console.log(`Fetching popular manga, limit: ${limit}, offset: ${offset}`);
    const popularResponse = await fetchWithRetry(
      `${API_BASE_URL}/manga?limit=${limit}&offset=${offset}&order[followedCount]=desc&includes[]=cover_art`
    );
    
    if (!popularResponse.data || !Array.isArray(popularResponse.data)) {
      throw new Error("Invalid popular manga data format");
    }
    
    // Process popular manga
    return popularResponse.data.map(manga => {
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      const coverFile = coverArt?.attributes?.fileName;
      
      return {
        id: manga.id,
        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
        image: coverFile 
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` 
          : '/api/placeholder/200/280'
      };
    });
  } catch (error) {
    console.error(`Error fetching popular manga:`, error);
    throw new Error(`Failed to load popular manga: ${error.message}`);
  }
};

// Mengambil daftar manga yang baru diupdate
export const getLatestUpdates = async (limit = 10) => {
  try {
    console.log(`Fetching latest updates, limit: ${limit}`);
    const latestResponse = await fetchWithRetry(
      `${API_BASE_URL}/chapter?limit=${limit}&order[publishAt]=desc&includes[]=manga&includes[]=scanlation_group&translatedLanguage[]=id&translatedLanguage[]=en`
    );
    
    if (!latestResponse.data || !Array.isArray(latestResponse.data)) {
      throw new Error("Invalid latest updates data format");
    }
    
    // Process latest updates
    const updates = [];
    
    for (const chapter of latestResponse.data) {
      // Find manga data
      const manga = chapter.relationships.find(rel => rel.type === 'manga');
      if (!manga) continue;
      
      // We need to fetch manga details to get cover art
      try {
        const mangaData = await fetchWithRetry(`${API_BASE_URL}/manga/${manga.id}?includes[]=cover_art`);
        
        const coverArt = mangaData.data.relationships.find(rel => rel.type === 'cover_art');
        const coverFile = coverArt?.attributes?.fileName;
        
        // Calculate time difference
        const publishDate = new Date(chapter.attributes.publishAt);
        const now = new Date();
        const timeDiff = Math.floor((now - publishDate) / (1000 * 60 * 60)); // Hours
        
        let timeStr;
        if (timeDiff < 1) {
          timeStr = 'Baru saja';
        } else if (timeDiff === 1) {
          timeStr = '1 jam yang lalu';
        } else if (timeDiff < 24) {
          timeStr = `${timeDiff} jam yang lalu`;
        } else {
          timeStr = `${Math.floor(timeDiff / 24)} hari yang lalu`;
        }
        
        updates.push({
          id: chapter.id,
          mangaId: manga.id,
          title: mangaData.data.attributes.title.en || Object.values(mangaData.data.attributes.title)[0],
          chapter: `Chapter ${chapter.attributes.chapter}`,
          time: timeStr,
          image: coverFile 
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` 
            : '/api/placeholder/150/210'
        });
      } catch (error) {
        console.warn(`Could not fetch details for manga ID ${manga.id}:`, error);
      }
    }
    
    return updates;
  } catch (error) {
    console.error(`Error fetching latest updates:`, error);
    throw new Error(`Failed to load latest updates: ${error.message}`);
  }
};

// Mengambil daftar genre
export const getGenres = async () => {
  try {
    console.log('Fetching genres');
    const genresResponse = await fetchWithRetry(`${API_BASE_URL}/manga/tag`);
    
    if (!genresResponse.data || !Array.isArray(genresResponse.data)) {
      throw new Error("Invalid genres data format");
    }
    
    // Filter untuk mendapatkan hanya tag genre
    return genresResponse.data
      .filter(tag => tag.attributes.group === 'genre')
      .map(tag => tag.attributes.name.en);
  } catch (error) {
    console.error(`Error fetching genres:`, error);
    throw new Error(`Failed to load genres: ${error.message}`);
  }
};

// Ekspor semua fungsi API
export default {
  getMangaById,
  getChapterPages,
  getMangaChapters,
  getChapterNavigation,
  searchManga,
  getPopularManga,
  getLatestUpdates,
  getGenres
};