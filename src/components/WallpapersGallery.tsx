import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Home, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Wallpaper {
  id: string;
  url: string;
  name: string;
  likes: number;
  downloads: number;
  createdAt: string;
}

function WallpapersGallery() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState<Wallpaper | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [likedWallpapers, setLikedWallpapers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadWallpapers();
    loadLikedWallpapers();
  }, []);

  const loadWallpapers = async () => {
    try {
      const response = await fetch('/api/wallpapers');
      const data = await response.json();
      setWallpapers(data.wallpapers || []);
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedWallpapers = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('wallpaper_likes') || '{}');
      setLikedWallpapers(new Set(Object.keys(stored)));
    } catch {
      setLikedWallpapers(new Set());
    }
  };

  const openLightbox = (wallpaper: Wallpaper) => {
    const index = wallpapers.findIndex(w => w.id === wallpaper.id);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxPhoto(wallpaper);
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
  };

  const nextPhoto = () => {
    const next = (lightboxIndex + 1) % wallpapers.length;
    setLightboxIndex(next);
    setLightboxPhoto(wallpapers[next]);
  };

  const prevPhoto = () => {
    const prev = (lightboxIndex - 1 + wallpapers.length) % wallpapers.length;
    setLightboxIndex(prev);
    setLightboxPhoto(wallpapers[prev]);
  };

  const handleAction = async (action: string, wallpaper: Wallpaper) => {
    switch (action) {
      case 'like':
        await handleLike(wallpaper);
        break;
      case 'share':
        await navigator.clipboard.writeText(`${window.location.origin}/wallpapers#${wallpaper.id}`);
        alert('Ссылка скопирована!');
        break;
      case 'download':
        await handleDownload(wallpaper);
        break;
    }
  };

  const handleLike = async (wallpaper: Wallpaper) => {
    const newSet = new Set(likedWallpapers);
    const isLiked = !newSet.has(wallpaper.id);
    
    if (isLiked) {
      newSet.add(wallpaper.id);
    } else {
      newSet.delete(wallpaper.id);
    }
    
    setLikedWallpapers(newSet);
    
    const stored = JSON.parse(localStorage.getItem('wallpaper_likes') || '{}');
    if (isLiked) {
      stored[wallpaper.id] = true;
    } else {
      delete stored[wallpaper.id];
    }
    localStorage.setItem('wallpaper_likes', JSON.stringify(stored));

    // Update wallpaper likes on server
    try {
      await fetch(`/api/wallpapers/${wallpaper.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: isLiked })
      });
      
      // Update local state
      setWallpapers(prev => prev.map(w => 
        w.id === wallpaper.id 
          ? { ...w, likes: isLiked ? w.likes + 1 : Math.max(w.likes - 1, 0) }
          : w
      ));
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDownload = async (wallpaper: Wallpaper) => {
    const filename = wallpaper.url.split('/').pop();
    if (!filename) return;
    
    window.open(`/api/download/wallpaper/${filename}`, '_blank');
    
    try {
      await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: 'POST'
      });
      
      setWallpapers(prev => prev.map(w => 
        w.id === wallpaper.id 
          ? { ...w, downloads: w.downloads + 1 }
          : w
      ));
    } catch (error) {
      console.error('Error updating downloads:', error);
    }
  };

  const handleDownloadAll = () => {
    window.open('/api/download/wallpapers/all', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-lg">Загрузка обоев...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-20">
      {/* Floating Navigation */}
      <motion.div
        className="fixed top-24 left-6 z-40 space-y-4"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-700 p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Home className="w-6 h-6 text-white" />
        </motion.button>
        
        <motion.button
          onClick={handleDownloadAll}
          className="bg-green-600 hover:bg-green-700 p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Download className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl md:text-6xl font-black text-white text-center mb-8 uppercase tracking-wider"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            textShadow: '0 0 20px rgba(255,69,0,0.8), 0 0 40px rgba(255,69,0,0.4)'
          }}
        >
          Обои
        </motion.h1>
      </div>

      {/* Masonry Gallery */}
      <div className="container mx-auto px-4 pb-20">
        {wallpapers.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {wallpapers.map((wallpaper, index) => (
              <motion.div
                key={wallpaper.id}
                className="mb-4 break-inside-avoid relative group overflow-hidden border-2 border-red-600/30 hover:border-red-500 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => openLightbox(wallpaper)}
              >
                <img
                  src={wallpaper.url}
                  alt={wallpaper.name}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('like', wallpaper);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        likedWallpapers.has(wallpaper.id)
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-red-500/50 hover:bg-red-600'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedWallpapers.has(wallpaper.id)
                            ? 'fill-current text-white'
                            : 'text-white'
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('share', wallpaper);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('download', wallpaper);
                      }}
                      className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Обоев пока нет</p>
          </div>
        )}
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
                alt={lightboxPhoto.name}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              <motion.button
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
              
              <motion.button
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </motion.button>
              
              <motion.button
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </motion.button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleAction('like', lightboxPhoto); }}
                  className={`p-3 rounded-full ${
                    likedWallpapers.has(lightboxPhoto.id)
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-500/50 hover:bg-red-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedWallpapers.has(lightboxPhoto.id)
                        ? 'fill-current text-white'
                        : 'text-white'
                    }`}
                  />
                </motion.button>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleAction('share', lightboxPhoto); }}
                  className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleAction('download', lightboxPhoto); }}
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

export default WallpapersGallery;