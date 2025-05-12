import { API_BASE_URL, fetchWithRetry } from './apiClient';

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