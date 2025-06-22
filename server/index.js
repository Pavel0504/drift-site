import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Data file paths
const DATA_DIR = path.join(__dirname, '../src/data');
const ALBUMS_DIR = path.join(DATA_DIR, 'albums');
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
const IMAGES_DIR = path.join(__dirname, '../public/images');

// Ensure data directories exist
await fs.ensureDir(DATA_DIR);
await fs.ensureDir(ALBUMS_DIR);
await fs.ensureDir(UPLOADS_DIR);
await fs.ensureDir(IMAGES_DIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Helper functions
const readJSONFile = async (filePath) => {
  try {
    return await fs.readJSON(filePath);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

const writeJSONFile = async (filePath, data) => {
  try {
    await fs.writeJSON(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
   
    const fileUrl = `/images/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Multiple file upload endpoint
app.post('/api/upload/multiple', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
   
    const uploadedFiles = req.files.map(file => ({
      url: `/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
   
    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Download single image
app.get('/api/download/image/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(IMAGES_DIR, filename);
   
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: 'File not found' });
    }
   
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Download wallpaper
app.get('/api/download/wallpaper/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(IMAGES_DIR, filename);
   
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: 'File not found' });
    }
   
    res.download(filePath);
  } catch (error) {
    console.error('Download wallpaper error:', error);
    res.status(500).json({ error: 'Failed to download wallpaper' });
  }
});

// Download all wallpapers as ZIP
app.get('/api/download/wallpapers/all', async (req, res) => {
  try {
    const wallpapersData = await readJSONFile(path.join(DATA_DIR, 'wallpapers.json'));
   
    if (!wallpapersData || !wallpapersData.wallpapers) {
      return res.status(404).json({ error: 'No wallpapers found' });
    }
   
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
   
    res.attachment('wallpapers.zip');
    archive.pipe(res);
   
    // Add all wallpapers to archive
    for (const wallpaper of wallpapersData.wallpapers) {
      const wallpaperPath = path.join(IMAGES_DIR, path.basename(wallpaper.url));
      if (await fs.pathExists(wallpaperPath)) {
        archive.file(wallpaperPath, { name: path.basename(wallpaper.url) });
      }
    }
   
    await archive.finalize();
  } catch (error) {
    console.error('Wallpapers download error:', error);
    res.status(500).json({ error: 'Failed to download wallpapers' });
  }
});

// Download album as ZIP
app.get('/api/download/album/:albumId', async (req, res) => {
  try {
    const albumId = req.params.albumId;
    const albumDetails = await readJSONFile(path.join(ALBUMS_DIR, `${albumId}.json`));
   
    if (!albumDetails) {
      return res.status(404).json({ error: 'Album not found' });
    }
   
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
   
    res.attachment(`${albumDetails.name}.zip`);
    archive.pipe(res);
   
    // Add all photos from all stages
    if (Array.isArray(albumDetails.stages)) {
      for (const stage of albumDetails.stages) {
        for (const photo of stage.photos) {
          const photoPath = path.join(IMAGES_DIR, path.basename(photo.url));
          if (await fs.pathExists(photoPath)) {
            archive.file(photoPath, { name: `${stage.name}/${path.basename(photo.url)}` });
          }
        }
      }
    }
    // Add photos from root album (если есть)
    if (Array.isArray(albumDetails.photos)) {
      for (const photo of albumDetails.photos) {
        const photoPath = path.join(IMAGES_DIR, path.basename(photo.url));
        if (await fs.pathExists(photoPath)) {
          archive.file(photoPath, { name: `album/${path.basename(photo.url)}` });
        }
      }
    }
   
    await archive.finalize();
  } catch (error) {
    console.error('Album download error:', error);
    res.status(500).json({ error: 'Failed to download album' });
  }
});

// Delete file endpoint
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(IMAGES_DIR, filename);
   
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
   
    res.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Albums
app.get('/api/albums', async (req, res) => {
  try {
    const albumsData = await readJSONFile(path.join(DATA_DIR, 'albums.json'));
    res.json(albumsData || { albums: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

app.get('/api/albums/:id', async (req, res) => {
  try {
    const albumData = await readJSONFile(path.join(ALBUMS_DIR, `${req.params.id}.json`));
    if (!albumData) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(albumData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch album details' });
  }
});

app.post('/api/albums', async (req, res) => {
  try {
    const albumData = req.body;
    const albumId = `album-${Date.now()}`;
   
    // Create album summary
    const albumsData = await readJSONFile(path.join(DATA_DIR, 'albums.json')) || { albums: [] };
    const newAlbumSummary = {
      id: albumId,
      name: albumData.name,
      date: albumData.date,
      previewImage: albumData.previewImage,
      coverMedia: albumData.coverMedia,
      mediaType: albumData.mediaType,
      likes: albumData.likes || 0,
      downloads: albumData.downloads || 0
    };
   
    albumsData.albums.push(newAlbumSummary);
    await writeJSONFile(path.join(DATA_DIR, 'albums.json'), albumsData);
   
    // Create album detail file
    const albumDetail = {
      ...newAlbumSummary,
      stages: albumData.stages || [],
      photos: albumData.photos || []
    };
    await writeJSONFile(path.join(ALBUMS_DIR, `${albumId}.json`), albumDetail);
   
    res.json({ success: true, id: albumId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

app.put('/api/albums/:id', async (req, res) => {
  try {
    const albumId = req.params.id;
    const albumData = req.body;

    // Читаем общий файл
    const albumsData = await readJSONFile(path.join(DATA_DIR, 'albums.json')) || { albums: [] };
    const albumIndex = albumsData.albums.findIndex(a => a.id === albumId);
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Album not found' });
    }
    // Читаем старый detail
    const detailPath = path.join(ALBUMS_DIR, `${albumId}.json`);
    const oldDetail = await readJSONFile(detailPath) || {};

    // Сливаем detail: сохраняем старые поля и перезаписываем теми, что пришли
    const mergedDetail = {
      id: albumId,
      name: albumData.name ?? oldDetail.name,
      date: albumData.date ?? oldDetail.date,
      previewImage: albumData.previewImage ?? oldDetail.previewImage,
      coverMedia: albumData.coverMedia ?? oldDetail.coverMedia,
      mediaType: albumData.mediaType ?? oldDetail.mediaType,
      // Сливаем массивы:
      stages: Array.isArray(albumData.stages) ? albumData.stages : oldDetail.stages || [],
      photos: Array.isArray(albumData.photos) ? albumData.photos : oldDetail.photos || []
    };

    // Функция суммирования поля field ('likes' или 'downloads') в массиве фото
    const sumField = (items, field) => {
      if (!Array.isArray(items)) return 0;
      return items.reduce((sum, p) => sum + (typeof p[field] === 'number' ? p[field] : 0), 0);
    };

    // Пересчитываем summary
    let totalLikes = 0;
    let totalDownloads = 0;
    // корневые фото
    totalLikes += sumField(mergedDetail.photos, 'likes');
    totalDownloads += sumField(mergedDetail.photos, 'downloads');
    // стадии
    if (Array.isArray(mergedDetail.stages)) {
      for (const stage of mergedDetail.stages) {
        if (Array.isArray(stage.photos)) {
          totalLikes += sumField(stage.photos, 'likes');
          totalDownloads += sumField(stage.photos, 'downloads');
        }
      }
    }
    // Записываем в detail
    mergedDetail.likes = totalLikes;
    mergedDetail.downloads = totalDownloads;

    // Обновляем запись summary в albums.json
    albumsData.albums[albumIndex] = {
      ...albumsData.albums[albumIndex],
      name: mergedDetail.name,
      date: mergedDetail.date,
      previewImage: mergedDetail.previewImage,
      coverMedia: mergedDetail.coverMedia,
      mediaType: mergedDetail.mediaType,
      likes: totalLikes,
      downloads: totalDownloads
    };

    // Сохраняем оба файла
    await writeJSONFile(path.join(DATA_DIR, 'albums.json'), albumsData);
    await writeJSONFile(detailPath, mergedDetail);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update album:', error);
    res.status(500).json({ error: 'Failed to update album' });
  }
});

app.delete('/api/albums/:id', async (req, res) => {
  try {
    const albumId = req.params.id;
   
    // Delete associated images
    const albumDetails = await readJSONFile(path.join(ALBUMS_DIR, `${albumId}.json`));
    if (albumDetails) {
      if (Array.isArray(albumDetails.stages)) {
        for (const stage of albumDetails.stages) {
          for (const photo of stage.photos) {
            const imagePath = path.join(IMAGES_DIR, path.basename(photo.url));
            if (await fs.pathExists(imagePath)) {
              await fs.remove(imagePath);
            }
          }
        }
      }
      if (Array.isArray(albumDetails.photos)) {
        for (const photo of albumDetails.photos) {
          const imagePath = path.join(IMAGES_DIR, path.basename(photo.url));
          if (await fs.pathExists(imagePath)) {
            await fs.remove(imagePath);
          }
        }
      }
    }
   
    // Remove from summary
    const albumsData = await readJSONFile(path.join(DATA_DIR, 'albums.json')) || { albums: [] };
    albumsData.albums = albumsData.albums.filter(a => a.id !== albumId);
    await writeJSONFile(path.join(DATA_DIR, 'albums.json'), albumsData);
   
    // Remove detail file
    const albumFile = path.join(ALBUMS_DIR, `${albumId}.json`);
    if (await fs.pathExists(albumFile)) {
      await fs.remove(albumFile);
    }
   
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete album' });
  }
});

// Events
app.get('/api/events', async (req, res) => {
  try {
    const eventsData = await readJSONFile(path.join(DATA_DIR, 'events.json'));
    res.json(eventsData || { events: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const eventData = req.body;
    const eventsData = await readJSONFile(path.join(DATA_DIR, 'events.json')) || { events: [] };
   
    const newEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      isCompleted: false
    };
   
    eventsData.events.push(newEvent);
    await writeJSONFile(path.join(DATA_DIR, 'events.json'), eventsData);
   
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventData = req.body;
   
    const eventsData = await readJSONFile(path.join(DATA_DIR, 'events.json')) || { events: [] };
    const eventIndex = eventsData.events.findIndex(event => event.id === eventId);
   
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
   
    eventsData.events[eventIndex] = { ...eventsData.events[eventIndex], ...eventData };
    await writeJSONFile(path.join(DATA_DIR, 'events.json'), eventsData);
   
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
   
    const eventsData = await readJSONFile(path.join(DATA_DIR, 'events.json')) || { events: [] };
    eventsData.events = eventsData.events.filter(event => event.id !== eventId);
    await writeJSONFile(path.join(DATA_DIR, 'events.json'), eventsData);
   
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviewsData = await readJSONFile(path.join(DATA_DIR, 'reviews.json'));
    res.json(reviewsData || { reviews: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const reviewData = req.body;
    const reviewsData = await readJSONFile(path.join(DATA_DIR, 'reviews.json')) || { reviews: [] };
   
    const newReview = {
      id: `review-${Date.now()}`,
      ...reviewData,
      date: new Date().toISOString().split('T')[0]
    };
   
    reviewsData.reviews.push(newReview);
    await writeJSONFile(path.join(DATA_DIR, 'reviews.json'), reviewsData);
   
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settingsData = await readJSONFile(path.join(DATA_DIR, 'settings.json'));
    res.json(settingsData || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settingsData = req.body;
    await writeJSONFile(path.join(DATA_DIR, 'settings.json'), settingsData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const statisticsData = await readJSONFile(path.join(DATA_DIR, 'statistics.json'));
    res.json(statisticsData || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.put('/api/statistics', async (req, res) => {
  try {
    const statisticsData = req.body;
    await writeJSONFile(path.join(DATA_DIR, 'statistics.json'), statisticsData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update statistics' });
  }
});

// Wallpapers endpoints
app.get('/api/wallpapers', async (req, res) => {
  try {
    const wallpapersData = await readJSONFile(path.join(DATA_DIR, 'wallpapers.json'));
    res.json(wallpapersData || { wallpapers: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallpapers' });
  }
});

app.post('/api/wallpapers', async (req, res) => {
  try {
    const { wallpapers } = req.body;
    const wallpapersData = await readJSONFile(path.join(DATA_DIR, 'wallpapers.json')) || { wallpapers: [] };
   
    const newWallpapers = wallpapers.map(wallpaper => ({
      id: `wallpaper-${Date.now()}-${Math.random()}`,
      name: wallpaper.name,
      url: wallpaper.url,
      likes: 0,
      downloads: 0,
      createdAt: new Date().toISOString()
    }));
   
    wallpapersData.wallpapers.push(...newWallpapers);
    await writeJSONFile(path.join(DATA_DIR, 'wallpapers.json'), wallpapersData);
   
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to create wallpapers:', error);
    res.status(500).json({ error: 'Failed to create wallpapers' });
  }
});

app.post('/api/wallpapers/:id/like', async (req, res) => {
  try {
    const wallpaperId = req.params.id;
    const { increment } = req.body;
    
    const wallpapersData = await readJSONFile(path.join(DATA_DIR, 'wallpapers.json')) || { wallpapers: [] };
    const wallpaperIndex = wallpapersData.wallpapers.findIndex(w => w.id === wallpaperId);
    
    if (wallpaperIndex === -1) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }
    
    if (increment) {
      wallpapersData.wallpapers[wallpaperIndex].likes += 1;
    } else {
      wallpapersData.wallpapers[wallpaperIndex].likes = Math.max(wallpapersData.wallpapers[wallpaperIndex].likes - 1, 0);
    }
    
    await writeJSONFile(path.join(DATA_DIR, 'wallpapers.json'), wallpapersData);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update wallpaper likes:', error);
    res.status(500).json({ error: 'Failed to update likes' });
  }
});

app.post('/api/wallpapers/:id/download', async (req, res) => {
  try {
    const wallpaperId = req.params.id;
    
    const wallpapersData = await readJSONFile(path.join(DATA_DIR, 'wallpapers.json')) || { wallpapers: [] };
    const wallpaperIndex = wallpapersData.wallpapers.findIndex(w => w.id === wallpaperId);
    
    if (wallpaperIndex === -1) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }
    
    wallpapersData.wallpapers[wallpaperIndex].downloads += 1;
    
    await writeJSONFile(path.join(DATA_DIR, 'wallpapers.json'), wallpapersData);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update wallpaper downloads:', error);
    res.status(500).json({ error: 'Failed to update downloads' });
  }
});

app.delete('/api/wallpapers/:id', async (req, res) => {
  try {
    const wallpaperId = req.params.id;
    
    const wallpapersData = await readJSONFile(path.join(DATA_DIR, 'wallpapers.json')) || { wallpapers: [] };
    const wallpaper = wallpapersData.wallpapers.find(w => w.id === wallpaperId);
    
    if (!wallpaper) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }
    
    // Delete the image file
    const imagePath = path.join(IMAGES_DIR, path.basename(wallpaper.url));
    if (await fs.pathExists(imagePath)) {
      await fs.remove(imagePath);
    }
    
    // Remove from wallpapers array
    wallpapersData.wallpapers = wallpapersData.wallpapers.filter(w => w.id !== wallpaperId);
    await writeJSONFile(path.join(DATA_DIR, 'wallpapers.json'), wallpapersData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete wallpaper:', error);
    res.status(500).json({ error: 'Failed to delete wallpaper' });
  }
});

// Стриминг видео по пути /video
app.get('/video', (req, res) => {
  const videoPath = path.join(__dirname, 'task.mp4');

  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send('Video not found');
    }

    const range = req.headers.range;
    const fileSize = stats.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});