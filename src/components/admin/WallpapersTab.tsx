import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import apiService from '../../services/api';

interface Wallpaper {
  id: string;
  url: string;
  name: string;
  likes: number;
  downloads: number;
  createdAt: string;
}

function WallpapersTab() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadWallpapers();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      const result = await apiService.uploadMultipleFiles(files);
      
      if (result.success) {
        const newWallpapers = result.files.map((file: any) => ({
          name: file.originalName,
          url: file.url
        }));

        await fetch('/api/wallpapers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallpapers: newWallpapers })
        });

        await loadWallpapers();
        alert('Обои успешно загружены!');
      }
    } catch (error) {
      console.error('Error uploading wallpapers:', error);
      alert('Ошибка при загрузке обоев');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteWallpaper = async (wallpaperId: string) => {
    try {
      await fetch(`/api/wallpapers/${wallpaperId}`, {
        method: 'DELETE'
      });
      
      await loadWallpapers();
      setShowDeleteConfirm(null);
      alert('Обои удалены!');
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
      alert('Ошибка при удалении обоев');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h2
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Обои
        </motion.h2>
        
        <div className="flex items-center space-x-4">
          <motion.label
            className="flex items-center bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-medium">
              {uploading ? 'Загрузка...' : 'Загрузить обои'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </motion.label>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Всего обоев</p>
              <p className="text-3xl font-bold text-white">{wallpapers.length}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Всего лайков</p>
              <p className="text-3xl font-bold text-white">
                {wallpapers.reduce((sum, w) => sum + w.likes, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">❤</span>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Всего скачиваний</p>
              <p className="text-3xl font-bold text-white">
                {wallpapers.reduce((sum, w) => sum + w.downloads, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">⬇</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallpapers Grid */}
      {wallpapers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {wallpapers.map((wallpaper, index) => (
            <motion.div
              key={wallpaper.id}
              className="relative group bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={wallpaper.url}
                alt={wallpaper.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <motion.button
                  onClick={() => setShowDeleteConfirm(wallpaper.id)}
                  className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </motion.button>
              </div>
              
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate mb-1">
                  {wallpaper.name}
                </p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>❤ {wallpaper.likes}</span>
                  <span>⬇ {wallpaper.downloads}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-xl mb-4">Обоев пока нет</p>
          <p className="text-gray-500">Загрузите первые обои, чтобы начать</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Удалить обои?
              </h3>
              <p className="text-gray-300 mb-6">
                Это действие нельзя отменить. Обои будут удалены навсегда.
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  Отмена
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteWallpaper(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Удалить
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WallpapersTab;