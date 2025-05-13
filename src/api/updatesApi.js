import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';

// Fungsi untuk mengambil update terbaru
export const getLatestUpdates = async (limit = 10, offset = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/chapter`, {
      params: {
        limit: limit,
        offset: offset,
        order: { readableAt: 'desc' },
        includes: ['manga'],
      },
    });

    const chapters = response.data.data;

    // Ambil ID manga dari setiap chapter
    const mangaIds = chapters
      .map(ch => ch.relationships.find(r => r.type === 'manga')?.id)
      .filter(Boolean);

    // Fetch data manga secara paralel
    const mangaResponses = await Promise.all(
      mangaIds.map(id => axios.get(`${BASE_URL}/manga/${id}`))
    );

    const mangaMap = {};
    mangaResponses.forEach((res, i) => {
      const manga = res.data.data;
      mangaMap[manga.id] = {
        id: manga.id,
        title:
          manga.attributes.title.en ||
          manga.attributes.title.id ||
          'Tanpa Judul',
        coverId: manga.relationships.find(rel => rel.type === 'cover_art')?.id,
      };
    });

    // Ambil URL cover dari MangaDex API
    const covers = await Promise.all(
      Object.values(mangaMap).map(async manga => {
        if (!manga.coverId) return null;
        try {
          const coverRes = await axios.get(
            `${BASE_URL}/cover/${manga.coverId}`
          );
          const fileName = coverRes.data.data.attributes.fileName;
          return {
            mangaId: manga.id,
            image: `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`,
          };
        } catch {
          return null;
        }
      })
    );

    const imageMap = {};
    covers.forEach(cover => {
      if (cover) {
        imageMap[cover.mangaId] = cover.image;
      }
    });

    // Gabungkan data chapter dengan manga dan cover
    const updates = chapters.map(ch => {
      const mangaRel = ch.relationships.find(r => r.type === 'manga');
      const mangaId = mangaRel?.id;
      const manga = mangaMap[mangaId];

      return {
        mangaId,
        title: manga?.title || 'Tanpa Judul',
        chapter: ch.attributes.chapter
          ? `Chapter ${ch.attributes.chapter}`
          : 'Chapter Tidak Diketahui',
        time: new Date(ch.attributes.readableAt).toLocaleString('id-ID'),
        image:
          imageMap[mangaId] ||
          '/default-cover.jpg', // fallback lokal jika tidak ada
      };
    });

    return updates;
  } catch (error) {
    console.error('Gagal mengambil update terbaru:', error.message);
    return [];
  }
};