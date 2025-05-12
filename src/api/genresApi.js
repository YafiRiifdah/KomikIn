import { API_BASE_URL, fetchWithRetry } from './apiClient';

// Mengambil daftar genre
export const getGenres = async () => {
  try {
    console.log('Fetching genres');
    const genresResponse = await fetchWithRetry(`${API_BASE_URL}/manga/tag`);
    
    if (!genresResponse.data || !Array.isArray(genresResponse.data)) {
      throw new Error("Invalid genres data format");
    }
    
    return genresResponse.data
      .filter(tag => tag.attributes.group === 'genre')
      .map(tag => tag.attributes.name.en);
  } catch (error) {
    console.error(`Error fetching genres:`, error);
    throw new Error(`Failed to load genres: ${error.message}`);
  }
};