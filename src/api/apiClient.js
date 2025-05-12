const API_BASE_URL = 'https://api.mangadex.org';

// Fungsi helper untuk fetch dengan retry
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Tangani 429 (Too Many Requests)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 5;
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        if (retries > 0) {
          return fetchWithRetry(url, options, retries, delay);
        }
        throw new Error(`Rate limit exceeded after ${retries} retries`);
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

export { API_BASE_URL, fetchWithRetry };