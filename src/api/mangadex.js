// api/mangadex.js - File untuk menangani panggilan API MangaDex

// URL dasar untuk API MangaDex
const API_BASE_URL = 'https://api.mangadex.org';

// Fungsi helper untuk melakukan fetch dengan retry logic
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
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

// Function to fetch popular manga
export const fetchPopularManga = async (limit = 7) => {
  try {
    console.log(`Fetching popular manga, limit: ${limit}`);
    // Get popular manga based on follows
    const data = await fetchWithRetry(
      `${API_BASE_URL}/manga?limit=${limit}&order[followedCount]=desc&includes[]=cover_art`
    );
    
    // Process the data to match our component's format
    const processedData = data.data.map(manga => {
      // Find cover art
      const coverFile = manga.relationships.find(
        rel => rel.type === 'cover_art'
      )?.attributes?.fileName;
      
      return {
        id: manga.id,
        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
        chapter: "", // We'll fetch the latest chapter separately
        image: coverFile 
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` 
          : '/api/placeholder/200/280'
      };
    });
    
    console.log(`Successfully fetched ${processedData.length} popular manga`);
    return processedData;
  } catch (error) {
    console.error('Error fetching popular manga:', error);
    throw error;
  }
};

// Function to fetch latest manga updates
export const fetchLatestUpdates = async (limit = 8) => {
  try {
    console.log(`Fetching latest updates, limit: ${limit}`);
    // Get latest chapter updates
    const data = await fetchWithRetry(
      `${API_BASE_URL}/chapter?limit=${limit}&order[publishAt]=desc&includes[]=manga&includes[]=scanlation_group&translatedLanguage[]=id&translatedLanguage[]=en`
    );
    
    // Process the data to match our component's format
    const updates = [];
    
    for (const chapter of data.data) {
      // Find manga data
      const manga = chapter.relationships.find(rel => rel.type === 'manga');
      if (!manga) continue;
      
      // We need to fetch manga details to get cover art
      console.log(`Fetching details for manga ID: ${manga.id}`);
      const mangaData = await fetchWithRetry(`${API_BASE_URL}/manga/${manga.id}?includes[]=cover_art`);
      
      // Find cover art
      const coverFile = mangaData.data.relationships.find(
        rel => rel.type === 'cover_art'
      )?.attributes?.fileName;
      
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
    }
    
    console.log(`Successfully fetched ${updates.length} latest updates`);
    return updates;
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    throw error;
  }
};

// Function to fetch available genres
export const fetchGenres = async () => {
  try {
    console.log('Fetching genres');
    const data = await fetchWithRetry(`${API_BASE_URL}/manga/tag`);
    
    // Filter to get only genre tags
    const genres = data.data
      .filter(tag => tag.attributes.group === 'genre')
      .map(tag => tag.attributes.name.en);
    
    console.log(`Successfully fetched ${genres.length} genres`);
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

// Function to search manga
export const searchManga = async (query, limit = 10) => {
  try {
    console.log(`Searching for: "${query}", limit: ${limit}`);
    const data = await fetchWithRetry(
      `${API_BASE_URL}/manga?limit=${limit}&title=${encodeURIComponent(query)}&includes[]=cover_art`
    );
    
    // Process the data to match our component's format
    const results = data.data.map(manga => {
      // Find cover art
      const coverFile = manga.relationships.find(
        rel => rel.type === 'cover_art'
      )?.attributes?.fileName;
      
      return {
        id: manga.id,
        title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
        image: coverFile 
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg` 
          : '/api/placeholder/200/280'
      };
    });
    
    console.log(`Search returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Error searching manga:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan detail manga berdasarkan ID
export const fetchMangaById = async (mangaId) => {
  try {
    console.log(`Fetching manga details for ID: ${mangaId}`);
    const data = await fetchWithRetry(
      `${API_BASE_URL}/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    
    // Find cover art
    const coverArt = data.data.relationships.find(rel => rel.type === 'cover_art');
    const coverFile = coverArt?.attributes?.fileName;
    
    // Find author and artist
    const author = data.data.relationships.find(rel => rel.type === 'author');
    const artist = data.data.relationships.find(rel => rel.type === 'artist');
    
    // Process manga details
    const mangaDetails = {
      id: data.data.id,
      title: data.data.attributes.title.en || Object.values(data.data.attributes.title)[0],
      description: data.data.attributes.description.en || Object.values(data.data.attributes.description)[0] || 'No description available',
      status: data.data.attributes.status,
      year: data.data.attributes.year,
      tags: data.data.attributes.tags.map(tag => tag.attributes.name.en),
      coverArt: coverFile ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFile}.512.jpg` : null,
      authorId: author?.id,
      artistId: artist?.id,
      author: null,
      artist: null,
    };
    
    // Fetch author details if available
    if (author) {
      try {
        const authorData = await fetchWithRetry(`${API_BASE_URL}/author/${author.id}`);
        mangaDetails.author = authorData.data.attributes.name;
      } catch (error) {
        console.error(`Failed to fetch author details for ID: ${author.id}`, error);
      }
    }
    
    // Fetch artist details if available and different from author
    if (artist && artist.id !== author?.id) {
      try {
        const artistData = await fetchWithRetry(`${API_BASE_URL}/author/${artist.id}`);
        mangaDetails.artist = artistData.data.attributes.name;
      } catch (error) {
        console.error(`Failed to fetch artist details for ID: ${artist.id}`, error);
      }
    }
    
    console.log(`Successfully fetched details for manga: ${mangaDetails.title}`);
    return mangaDetails;
  } catch (error) {
    console.error(`Error fetching manga details for ID: ${mangaId}:`, error);
    throw error;
  }
};

// Fungsi untuk mendapatkan daftar chapter untuk manga tertentu
export const fetchChapters = async (mangaId, language = ['id', 'en']) => {
  try {
    console.log(`Fetching chapters for manga ID: ${mangaId}`);
    const langParams = language.map(lang => `translatedLanguage[]=${lang}`).join('&');
    const data = await fetchWithRetry(
      `${API_BASE_URL}/chapter?manga=${mangaId}&${langParams}&order[chapter]=desc&limit=100`
    );
    
    // Process chapters
    const chapters = data.data.map(chapter => {
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
    
    console.log(`Successfully fetched ${chaptersWithGroups.length} chapters`);
    return chaptersWithGroups;
  } catch (error) {
    console.error(`Error fetching chapters for manga ID: ${mangaId}:`, error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data halaman untuk chapter tertentu
export const fetchChapterPages = async (chapterId, quality = 'high') => {
  try {
    console.log(`Fetching pages for chapter ID: ${chapterId}`);
    // Fetch chapter data
    const chapterData = await fetchWithRetry(`${API_BASE_URL}/chapter/${chapterId}`);
    
    // Fetch MangaDex@Home base URL
    const mdAtHomeData = await fetchWithRetry(`${API_BASE_URL}/at-home/server/${chapterId}`);
    const baseUrl = mdAtHomeData.baseUrl;
    
    // Determine quality suffix
    let qualitySuffix = '';
    if (quality === 'low') {
      qualitySuffix = '.512.jpg';
    } else if (quality === 'medium') {
      qualitySuffix = '.1024.jpg';
    } else {
      qualitySuffix = '.2048.jpg'; // high quality
    }
    
    // Construct page URLs
    const hash = chapterData.data.attributes.hash;
    const pageFilenames = chapterData.data.attributes.data;
    
    const pageUrls = pageFilenames.map(
      filename => `${baseUrl}/data/${hash}/${filename}${qualitySuffix}`
    );
    
    console.log(`Successfully generated ${pageUrls.length} page URLs`);
    return {
      id: chapterData.data.id,
      hash: hash,
      pages: pageUrls,
      chapter: chapterData.data.attributes.chapter,
      title: chapterData.data.attributes.title,
      translatedLanguage: chapterData.data.attributes.translatedLanguage
    };
  } catch (error) {
    console.error(`Error fetching pages for chapter ID: ${chapterId}:`, error);
    throw error;
  }
};

export default {
  fetchPopularManga,
  fetchLatestUpdates,
  fetchGenres,
  searchManga,
  fetchMangaById,
  fetchChapters,
  fetchChapterPages
};