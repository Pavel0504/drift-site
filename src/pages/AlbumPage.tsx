import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  Share2,
  Download,
  Home,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Album, Photo } from '../types';

function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { albums, getAlbumDetails, updateAlbum, updateStatistics } = useData();

  const [album, setAlbum] = useState<Album | null>(null);
  const [albumDetails, setAlbumDetails] = useState<any>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentStagePhotos, setCurrentStagePhotos] = useState<Photo[]>([]);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [albumDownloaded, setAlbumDownloaded] = useState(false);

  // Load album summary and details
  useEffect(() => {
    if (!id) return;
    const found = albums.find(a => a.id === id) || null;
    setAlbum(found);
    if (found) {
      getAlbumDetails(found.id).then(details => {
        setAlbumDetails(details);
      });
    } else {
      setAlbumDetails(null);
    }
  }, [id, albums, getAlbumDetails]);

  // Sticky header on scroll
  useEffect(() => {
    const onScroll = () => {
      setIsHeaderSticky(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Restore likes from localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`album_likes_${id}`) || '{}');
      setLikedPhotos(new Set(Object.keys(stored)));
    } catch {
      setLikedPhotos(new Set());
    }
  }, [id]);

  // Lightbox handlers
  const openLightbox = (photo: Photo, photos: Photo[]) => {
    setCurrentStagePhotos(photos);
    const idx = photos.findIndex(p => p.id === photo.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxPhoto(photo);
  };
  const closeLightbox = () => {
    setLightboxPhoto(null);
    setCurrentStagePhotos([]);
  };
  const nextPhoto = () => {
    if (!currentStagePhotos.length) return;
    const next = (lightboxIndex + 1) % currentStagePhotos.length;
    setLightboxIndex(next);
    setLightboxPhoto(currentStagePhotos[next]);
  };
  const prevPhoto = () => {
    if (!currentStagePhotos.length) return;
    const prev = (lightboxIndex - 1 + currentStagePhotos.length) % currentStagePhotos.length;
    setLightboxIndex(prev);
    setLightboxPhoto(currentStagePhotos[prev]);
  };

  // Share album link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка успешно скопирована!');
  };

  // Download all photos in album
  const handleDownloadAll = async () => {
    if (!id || albumDownloaded) return;
    window.open(`${(window as any).API_BASE_URL || '/api'}/download/album/${id}`, '_blank');
    setAlbumDownloaded(true);

    if (albumDetails) {
      const updated = { ...albumDetails };
      const prevCount = typeof updated.downloads === 'number' ? updated.downloads : 0;
      updated.downloads = prevCount + 1;
      setAlbumDetails(updated);
      try {
        await updateAlbum(id, { downloads: updated.downloads });
      } catch (err) {
        console.error('Ошибка обновления скачиваний альбома:', err);
      }
    }

    try {
      const resp = await fetch('/api/statistics');
      const stats = await resp.json();
      const newTotal = (stats.totalDownloads || 0) + 1;
      await updateStatistics({ ...stats, totalDownloads: newTotal });
    } catch (err) {
      console.error('Ошибка обновления глобальной статистики:', err);
    }
  };

  // Photo actions: like, share, download
  const handlePhotoAction = async (action: string, photo: Photo) => {
    if (!id || !albumDetails) return;
    switch (action) {
      case 'like': {
        const newSet = new Set(likedPhotos);
        const isNow = !newSet.has(photo.id);
        if (isNow) newSet.add(photo.id);
        else newSet.delete(photo.id);
        setLikedPhotos(newSet);
        const key = `album_likes_${id}`;
        const stored: Record<string, boolean> = JSON.parse(localStorage.getItem(key) || '{}');
        if (isNow) stored[photo.id] = true;
        else delete stored[photo.id];
        localStorage.setItem(key, JSON.stringify(stored));

        // Update likes in details
        const updated = { ...albumDetails };
        const updateLikes = (list: Photo[]) => {
          list.forEach(p => {
            if (p.id === photo.id) {
              p.likes = isNow ? (p.likes || 0) + 1 : Math.max((p.likes || 1) - 1, 0);
            }
          });
        };
        if (Array.isArray(updated.stages)) {
          updated.stages = updated.stages.map((stage: any) => {
            if (Array.isArray(stage.photos)) updateLikes(stage.photos);
            return stage;
          });
        }
        if (Array.isArray(updated.photos)) {
          updateLikes(updated.photos);
        }
        setAlbumDetails(updated);

        try {
          await updateAlbum(id, updated);
        } catch (err) {
          console.error('Ошибка обновления лайков на сервере:', err);
        }

        try {
          const resp = await fetch('/api/statistics');
          const stats = await resp.json();
          let newLikes = (stats.totalLikes || 0) + (isNow ? 1 : -1);
          if (newLikes < 0) newLikes = 0;
          await updateStatistics({ ...stats, totalLikes: newLikes });
        } catch (err) {
          console.error('Ошибка обновления общей статистики лайков:', err);
        }
        break;
      }
      case 'share':
        navigator.clipboard.writeText(`${window.location.href}#photo-${photo.id}`);
        alert('Ссылка на фото скопирована!');
        break;
      case 'download': {
        const filename = photo.url.split('/').pop();
        if (!filename) return;
        window.open(`${(window as any).API_BASE_URL || '/api'}/download/image/${filename}`, '_blank');

        const updated = { ...albumDetails };
        const updateDownloads = (list: Photo[]) => {
          list.forEach(p => {
            if (p.id === photo.id) {
              p.downloads = (p.downloads || 0) + 1;
            }
          });
        };
        if (Array.isArray(updated.stages)) {
          updated.stages = updated.stages.map((stage: any) => {
            if (Array.isArray(stage.photos)) updateDownloads(stage.photos);
            return stage;
          });
        }
        if (Array.isArray(updated.photos)) {
          updateDownloads(updated.photos);
        }
        setAlbumDetails(updated);

        try {
          await updateAlbum(id, updated);
        } catch (err) {
          console.error('Ошибка обновления скачиваний фото на сервере:', err);
        }

        try {
          const resp = await fetch('/api/statistics');
          const stats = await resp.json();
          const newTotal = (stats.totalDownloads || 0) + 1;
          await updateStatistics({ ...stats, totalDownloads: newTotal });
        } catch (err) {
          console.error('Ошибка обновления статистики скачиваний:', err);
        }
        break;
      }
      default:
        break;
    }
  };

  // Upload new photos if album has no stages
  const handleAlbumPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !albumDetails) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const form = new FormData();
      files.forEach(file => form.append('files', file));
      const uploadResp = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: form
      });
      const result = await uploadResp.json();
      if (!result.success) return;
      const newPhotos: Photo[] = result.files.map((f: any, i: number) => ({
        id: `photo-${Date.now()}-${i}`,
        url: f.url,
        likes: 0,
        downloads: 0
      }));
      const merged = Array.isArray(albumDetails.photos)
        ? [...albumDetails.photos, ...newPhotos]
        : newPhotos;
      const updated = { ...albumDetails, photos: merged };
      setAlbumDetails(updated);
      await updateAlbum(id, updated);
    } catch (err) {
      console.error('Ошибка загрузки файлов в альбом:', err);
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Альбом не найден</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 font-bold uppercase tracking-wider"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {album.mediaType === 'video' ? (
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            src={album.coverMedia}
          />
        ) : (
          <img
            src={album.coverMedia}
            alt={album.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center text-white px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-4xl md:text-6xl lg:text-8xl font-black mb-4 uppercase tracking-wider"
              style={{
                textShadow:
                  '0 0 20px rgba(255,69,0,0.8), 0 0 40px rgba(255,69,0,0.4)'
              }}
            >
              {album.name}
            </h1>
            <p
              className="text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wider"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            >
              {new Date(album.date).toLocaleDateString('ru-RU')}
            </p>
          </motion.div>
        </div>
        <motion.button
          onClick={() =>
            document
              .getElementById('gallery')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-12 h-12" />
        </motion.button>
      </div>

      {/* Sticky Header with controls */}
      <motion.div
        className={`${
          isHeaderSticky ? 'fixed top-0 left-0 right-0 z-50' : 'relative'
        } bg-black/95 backdrop-blur-md border-b-2 border-red-600/30 transition-all duration-300`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <motion.button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 md:px-4 py-2 transition-colors font-bold uppercase text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              <span className="hidden sm:inline text-white">Поделиться</span>
            </motion.button>
            <motion.button
              onClick={handleDownloadAll}
              className={`flex items-center space-x-2 ${
                albumDownloaded
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } px-3 md:px-4 py-2 transition-colors font-bold uppercase text-sm md:text-base`}
              whileHover={albumDownloaded ? {} : { scale: 1.05 }}
              whileTap={albumDownloaded ? {} : { scale: 0.95 }}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
              disabled={albumDownloaded}
            >
              <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
              <span className="hidden sm:inline text-white">
                {albumDownloaded ? 'Скачано' : 'Скачать все'}
              </span>
            </motion.button>
          </div>
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 md:px-4 py-2 transition-colors font-bold uppercase text-sm md:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
          >
            <Home className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span className="hidden sm:inline text-white">На главную</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Gallery Section */}
      <div id="gallery" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          {albumDetails?.stages && albumDetails.stages.length > 0 ? (
            albumDetails.stages.map((stage: any) => (
              <div
                key={stage.id}
                className="bg-zinc-900 border-2 border-red-600/30 hover:border-red-500 overflow-hidden shadow-xl transition-all duration-300"
                style={{
                  clipPath:
                    'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
                }}
              >
                <motion.div
                  className="p-4 md:p-6 cursor-pointer hover:bg-red-900/10 transition-colors"
                  onClick={() =>
                    setExpandedStage(expandedStage === stage.id ? null : stage.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-wider">
                        {stage.name}
                      </h3>
                      <p className="text-gray-300 font-bold">
                        {new Date(stage.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-300 font-bold text-sm md:text-base">
                        {stage.photos?.length || 0} фото
                      </span>
                      {expandedStage === stage.id ? (
                        <ChevronUp className="w-6 h-6 text-white" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                </motion.div>
                <AnimatePresence>
                  {expandedStage === stage.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-red-600/30 p-4 md:p-6 bg-black/20"
                    >
                      {stage.photos && stage.photos.length > 0 ? (
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                          {stage.photos.map((photo: Photo) => (
                            <div
                              key={photo.id}
                              className="mb-4 break-inside-avoid relative group overflow-hidden border-2 border-red-600/30 hover:border-red-500"
                              onClick={() => openLightbox(photo, stage.photos)}
                            >
                              <img
                                src={photo.url}
                                alt={`${stage.name} - фото`}
                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <div className="flex space-x-2">
                                  <motion.button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handlePhotoAction('like', photo);
                                    }}
                                    className={`p-2 rounded-full transition-colors ${
                                      likedPhotos.has(photo.id)
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-red-500/50 hover:bg-red-600'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Heart
                                      className={`w-4 h-4 ${
                                        likedPhotos.has(photo.id)
                                          ? 'fill-current text-white'
                                          : 'text-white'
                                      }`}
                                    />
                                  </motion.button>
                                  <motion.button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handlePhotoAction('share', photo);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Share2 className="w-4 h-4 text-white" />
                                  </motion.button>
                                  <motion.button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handlePhotoAction('download', photo);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Download className="w-4 h-4 text-white" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-400 text-lg">
                            В этом этапе пока нет фотографий
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div
              className="bg-zinc-900 border-2 border-red-600/30 overflow-hidden shadow-xl transition-all duration-300"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <div className="p-6 text-center">
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">
                  Фотографии альбома
                </h3>
              </div>
              <div className="p-4 md:p-6">
                {albumDetails?.photos && albumDetails.photos.length > 0 ? (
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                    {albumDetails.photos.map((photo: Photo) => (
                      <div
                        key={photo.id}
                        className="mb-4 break-inside-avoid relative group overflow-hidden border-2 border-red-600/30 hover:border-red-500"
                        onClick={() => openLightbox(photo, albumDetails.photos)}
                      >
                        <img
                          src={photo.url}
                          alt="Фото альбома"
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={e => {
                                e.stopPropagation();
                                handlePhotoAction('like', photo);
                              }}
                              className={`p-2 rounded-full transition-colors ${
                                likedPhotos.has(photo.id)
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-red-500/50 hover:bg-red-600'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  likedPhotos.has(photo.id)
                                    ? 'fill-current text-white'
                                    : 'text-white'
                                }`}
                              />
                            </motion.button>
                            <motion.button
                              onClick={e => {
                                e.stopPropagation();
                                handlePhotoAction('share', photo);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Share2 className="w-4 h-4 text-white" />
                            </motion.button>
                            <motion.button
                              onClick={e => {
                                e.stopPropagation();
                                handlePhotoAction('download', photo);
                              }}
                              className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Download className="w-4 h-4 text-white" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                      В альбоме пока нет фотографий
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-screen-lg max-h-screen-lg w-full h-full flex items-center justify-center">
              <img
                src={lightboxPhoto.url}
                alt="Фото"
                className="max-w-full max-h-full object-contain"
                onClick={e => e.stopPropagation()}
              />
              <motion.button
                onClick={e => { e.stopPropagation(); closeLightbox(); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                onClick={e => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </motion.button>
              <motion.button
                onClick={e => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </motion.button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <motion.button
                  onClick={e => { e.stopPropagation(); handlePhotoAction('like', lightboxPhoto); }}
                  className={`p-3 rounded-full ${
                    likedPhotos.has(lightboxPhoto.id)
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-500/50 hover:bg-red-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedPhotos.has(lightboxPhoto.id)
                        ? 'fill-current text-white'
                        : 'text-white'
                    }`}
                  />
                </motion.button>
                <motion.button
                  onClick={e => { e.stopPropagation(); handlePhotoAction('share', lightboxPhoto); }}
                  className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  onClick={e => { e.stopPropagation(); handlePhotoAction('download', lightboxPhoto); }}
                  className="bg-green-500 hover:bg-green-600 p-3 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AlbumPage;
