import { API_BASE_URL, fetchWithRetry } from './apiClient';

// Mengambil data chapter dan gambar dari at-home server
export const getChapterPages = async (chapterId, quality = 'low') => {
  try {
    console.log(`Fetching at-home server for chapter ID: ${chapterId}`);
    const atHomeResponse = await fetchWithRetry(`${API_BASE_URL}/at-home/server/${chapterId}`);
    
    if (!atHomeResponse.baseUrl || !atHomeResponse.chapter) {
      throw new Error("Invalid at-home server response");
    }
    
    if (!atHomeResponse.chapter.dataSaver || atHomeResponse.chapter.dataSaver.length === 0) {
      console.warn("dataSaver images not available, falling back to data");
      if (!atHomeResponse.chapter.data || atHomeResponse.chapter.data.length === 0) {
        throw new Error("No image data found in the chapter");
      }
    }
    
    let chapterDetails = null;
    try {
      const chapterResponse = await fetchWithRetry(`${API_BASE_URL}/chapter/${chapterId}`);
      chapterDetails = chapterResponse.data;
    } catch (error) {
      console.warn("Could not fetch chapter details, using basic info", error);
    }
    
    let imagePath = 'data';
    let imageFiles = atHomeResponse.chapter.data || [];
    
    if (quality === 'low' || quality === 'medium') {
      imagePath = 'data-saver';
      imageFiles = atHomeResponse.chapter.dataSaver || atHomeResponse.chapter.data || [];
    }
    
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error("No image data found in the chapter");
    }
    
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
    
    const groupIds = [...new Set(chapters.flatMap(ch => ch.groups))];
    const groupPromises = groupIds.map(groupId => 
      fetchWithRetry(`${API_BASE_URL}/group/${groupId}`)
        .then(data => ({ id: groupId, name: data.data.attributes.name }))
        .catch(() => ({ id: groupId, name: 'Unknown Group' }))
    );
    
    const groups = await Promise.all(groupPromises);
    const groupsMap = Object.fromEntries(groups.map(group => [group.id, group.name]));
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
    
    const chapters = chaptersResponse.data;
    const currentIndex = chapters.findIndex(ch => ch.id === chapterId);
    
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }
    
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
    
    return {
      prev: prevChapter ? { id: prevChapter.id, chapter: prevChapter.attributes.chapter } : null,
      next: nextChapter ? { id: nextChapter.id, chapter: nextChapter.attributes.chapter } : null
    };
  } catch (error) {
    console.error(`Error fetching chapter navigation for manga ID ${mangaId}:`, error);
    return { prev: null, next: null };
  }
};