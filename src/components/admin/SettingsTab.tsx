import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Palette } from 'lucide-react';
import { useData } from '../../context/DataContext';
import apiService from '../../services/api';

function SettingsTab() {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState(settings);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      alert('Настройки сохранены!');
    } catch (error) {
      alert('Ошибка при сохранении настроек');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const result = await apiService.uploadFile(file);
        if (result.success) {
          setFormData({ ...formData, [field]: result.url });
        }
      } catch (error) {
        alert('Ошибка при загрузке файла');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div>
      <motion.h2
        className="text-3xl font-bold text-white mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Настройки
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Site Identity */}
        <motion.div
          className="bg-zinc-800 rounded-xl p-6 border border-zinc-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Palette className="w-6 h-6 text-orange-500 mr-2" />
            Идентичность сайта
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Название сайта</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Логотип</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('logoUrl', e)}
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formData.logoUrl && (
                  <img src={formData.logoUrl} alt="Logo" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Фавикон</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('faviconUrl', e)}
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formData.faviconUrl && (
                  <img src={formData.faviconUrl} alt="Favicon" className="w-8 h-8 object-cover rounded" />
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Картинка в футере</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('footerImageUrl', e)}
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formData.footerImageUrl && (
                  <img src={formData.footerImageUrl} alt="Footer" className="w-32 h-20 object-cover rounded" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          className="bg-zinc-800 rounded-xl p-6 border border-zinc-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-white mb-6">Социальные сети</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Телеграм</label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@username"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Канал Телеграм</label>
              <input
                type="text"
                value={formData.telegramChannel}
                onChange={(e) => handleInputChange('telegramChannel', e.target.value)}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@channel"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Инстаграм</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@username"
              />
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          className="bg-zinc-800 rounded-xl p-6 border border-zinc-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-6">Внешний вид</h3>
          
          <div>
            <label className="block text-white font-medium mb-2">Цвет фона сайта</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="w-16 h-10 rounded-lg border border-zinc-600 bg-zinc-700"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="#1E1E1E"
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="submit"
            disabled={uploading}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {uploading ? 'Загрузка...' : 'Сохранить настройки'}
            </span>
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}

export default SettingsTab;