import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronRight,
  Upload, X, Check, Image as ImageIcon, Video
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import apiService from '../../services/api';

function AlbumsTab() {
  const { albums, loadData } = useData();
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Form data now includes root-level photos
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    previewImage: '',
    coverMedia: '',
    mediaType: 'image' as 'image' | 'video',
    stages: [] as any[],
    photos: [] as any[],
  });

  const [stageFormData, setStageFormData] = useState({
    name: '',
    date: '',
    insertAfter: -1,
  });

  const toggleAlbum = (albumId: string) => {
    setExpandedAlbum(expandedAlbum === albumId ? null : albumId);
    setExpandedStage(null);
  };

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      previewImage: '',
      coverMedia: '',
      mediaType: 'image',
      stages: [],
      photos: [],
    });
    setEditingAlbum(null);
  };

  const handleEditAlbum = async (album: any) => {
    try {
      const details = await apiService.getAlbum(album.id);
      setEditingAlbum(details);
      setFormData({
        name: details.name,
        date: details.date,
        previewImage: details.previewImage,
        coverMedia: details.coverMedia,
        mediaType: details.mediaType,
        stages: details.stages || [],
        photos: details.photos || [],
      });
      setShowEditModal(true);
    } catch {
      alert('Ошибка при загрузке данных альбома');
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createAlbum(formData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
      alert('Альбом успешно создан!');
    } catch {
      alert('Ошибка при создании альбома');
    }
  };

  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;
    try {
      await apiService.updateAlbum(editingAlbum.id, formData);
      await loadData();
      setShowEditModal(false);
      resetForm();
      alert('Альбом успешно обновлен!');
    } catch {
      alert('Ошибка при обновлении альбома');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Удалить альбом и все его данные?')) return;
    try {
      await apiService.deleteAlbum(albumId);
      await loadData();
      alert('Альбом удалён');
    } catch {
      alert('Ошибка при удалении');
    }
  };

  // Single file upload for preview/cover
  const handleFileUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await apiService.uploadFile(file);
      if (res.success) setFormData({ ...formData, [field]: res.url });
    } catch {
      alert('Ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  // Multiple upload for a stage
  const handleMultipleFileUpload = async (stageIndex: number, files: FileList) => {
    if (!files.length) return;
    try {
      setUploading(true);
      const arr = Array.from(files);
      const res = await apiService.uploadMultipleFiles(arr);
      if (res.success) {
        const newPhotos = res.files.map((f: any, i: number) => ({
          id: `photo-${Date.now()}-${i}`,
          url: f.url,
          likes: 0,
          downloads: 0,
        }));
        const updated = [...formData.stages];
        updated[stageIndex].photos = [...(updated[stageIndex].photos || []), ...newPhotos];
        setFormData({ ...formData, stages: updated });
      }
    } catch {
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
    }
  };

  // Multiple upload for root-level photos
  const handleRootFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setUploading(true);
      const arr = Array.from(files);
      const res = await apiService.uploadMultipleFiles(arr);
      if (res.success) {
        const newPhotos = res.files.map((f: any, i: number) => ({
          id: `photo-${Date.now()}-${i}`,
          url: f.url,
          likes: 0,
          downloads: 0,
        }));
        setFormData({ ...formData, photos: [...formData.photos, ...newPhotos] });
      }
    } catch {
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
    }
  };

  // Stage CRUD
  const addStage = () => {
    const st = {
      id: `stage-${Date.now()}`,
      name: stageFormData.name || 'Новый этап',
      date: stageFormData.date || new Date().toISOString().split('T')[0],
      photos: [],
    };
    const up = [...formData.stages];
    stageFormData.insertAfter === -1
      ? up.push(st)
      : up.splice(stageFormData.insertAfter + 1, 0, st);
    setFormData({ ...formData, stages: up });
    setStageFormData({ name: '', date: '', insertAfter: -1 });
    setShowStageModal(false);
  };

  const removeStage = (index: number) => {
    if (!confirm('Удалить этап и его фотографии?')) return;
    const up = formData.stages.filter((_, idx) => idx !== index);
    setFormData({ ...formData, stages: up });
  };

  const editStage = (index: number) => {
    const s = formData.stages[index];
    setEditingStage({ ...s, index });
    setStageFormData({ name: s.name, date: s.date, insertAfter: -1 });
    setShowStageModal(true);
  };

  const saveStageEdit = () => {
    if (!editingStage) return;
    const up = formData.stages.map((s, idx) =>
      idx === editingStage.index
        ? { ...s, name: stageFormData.name, date: stageFormData.date }
        : s
    );
    setFormData({ ...formData, stages: up });
    setEditingStage(null);
    setStageFormData({ name: '', date: '', insertAfter: -1 });
    setShowStageModal(false);
  };

  const removePhoto = (stageIndex: number, photoIndex: number) => {
    if (!confirm('Удалить фотографию?')) return;
    const up = [...formData.stages];
    up[stageIndex].photos.splice(photoIndex, 1);
    setFormData({ ...formData, stages: up });
  };

  const removeRootPhoto = (index: number) => {
    if (!confirm('Удалить фотографию?')) return;
    const up = [...formData.photos];
    up.splice(index, 1);
    setFormData({ ...formData, photos: up });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h2
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Альбомы
        </motion.h2>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center bg-orange-500 px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 text-white" />
          <span className="ml-2 text-white">Создать альбом</span>
        </motion.button>
      </div>

      {/* Albums list */}
      <div className="space-y-4">
        {albums.map((album, idx) => (
          <motion.div
            key={album.id}
            className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {/* Album header */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => toggleAlbum(album.id)}
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400"
                >
                  {expandedAlbum === album.id ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </motion.button>
                <div>
                  <h3 className="text-xl font-bold text-white">{album.name}</h3>
                  <p className="text-gray-400">
                    {new Date(album.date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleEditAlbum(album)}
                  className="p-2 bg-blue-600 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => setShowDeleteConfirm(album.id)}
                  className="p-2 bg-red-600 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Expanded stages preview */}
            <AnimatePresence>
              {expandedAlbum === album.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-zinc-700"
                >
                  <div className="p-6 bg-zinc-900">
                    <h4 className="text-lg font-bold text-white mb-4">
                      Этапы альбома
                    </h4>
                    {album.stages && album.stages.length > 0 ? (
                      album.stages.map((stage: any, sIdx: number) => (
                        <div
                          key={stage.id}
                          className="bg-zinc-700 rounded-lg overflow-hidden mb-3"
                        >
                          <div
                            className="p-4 flex justify-between cursor-pointer hover:bg-zinc-600"
                            onClick={() => toggleStage(stage.id)}
                          >
                            <div className="flex items-center space-x-3">
                              {expandedStage === stage.id ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <div>
                                <h5 className="text-white font-medium">
                                  {stage.name}
                                </h5>
                                <p className="text-gray-400 text-sm">
                                  {new Date(stage.date).toLocaleDateString(
                                    'ru-RU'
                                  )}
                                </p>
                                <p className="text-gray-300 text-sm">
                                  {stage.photos?.length || 0} фотографий
                                </p>
                              </div>
                            </div>
                          </div>
                          <AnimatePresence>
                            {expandedStage === stage.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-zinc-600 p-4"
                              >
                                {stage.photos && stage.photos.length > 0 ? (
                                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                                    {stage.photos.map(
                                      (photo: any, pIdx: number) => (
                                        <div
                                          key={photo.id}
                                          className="relative group"
                                        >
                                          <img
                                            src={photo.url}
                                            alt={`photo-${pIdx}`}
                                            className="w-full h-16 object-cover rounded"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 text-center py-4">
                                    Фотографий нет
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">Этапов нет</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {showCreateModal ? 'Создать альбом' : 'Редактировать альбом'}
              </h3>
              <form
                onSubmit={
                  showCreateModal ? handleCreateAlbum : handleUpdateAlbum
                }
                className="space-y-6"
              >
                {/* Basic fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Название альбома
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Дата
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Preview & Cover */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Превью альбома
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload('previewImage', e)
                        }
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg"
                      />
                      {formData.previewImage && (
                        <img
                          src={formData.previewImage}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Обложка альбома
                    </label>
                    <div className="space-y-2">
                      <select
                        value={formData.mediaType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mediaType: e.target
                              .value as 'image' | 'video',
                          })
                        }
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg mb-2"
                      >
                        <option value="image">Изображение</option>
                        <option value="video">Видео</option>
                      </select>
                      <input
                        type="file"
                        accept={
                          formData.mediaType === 'video'
                            ? 'video/*'
                            : 'image/*'
                        }
                        onChange={(e) => handleFileUpload('coverMedia', e)}
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg"
                      />
                      {formData.coverMedia && (
                        formData.mediaType === 'video' ? (
                          <video
                            src={formData.coverMedia}
                            className="w-full h-32 object-cover rounded"
                            controls
                          />
                        ) : (
                          <img
                            src={formData.coverMedia}
                            alt="Cover"
                            className="w-full h-32 object-cover rounded"
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Root-level photo upload */}
                <div>
                  <label className="inline-block bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white cursor-pointer">
                    <Upload className="inline w-5 h-5 mr-2" />
                    Загрузить фото в альбом
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleRootFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-6 gap-2 mt-3">
                      {formData.photos.map((photo, pi) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={`root-${pi}`}
                            className="w-full h-16 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeRootPhoto(pi)}
                            className="absolute top-1 right-1 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stages management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">
                      Этапы альбома
                    </h4>
                    <motion.button
                      type="button"
                      onClick={() => setShowStageModal(true)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="inline w-4 h-4 mr-1" />
                      Добавить этап
                    </motion.button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {formData.stages.map((stage, si) => (
                      <div
                        key={stage.id}
                        className="bg-zinc-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stages: formData.stages.map((s, idx) =>
                                    idx === si
                                      ? { ...s, name: e.target.value }
                                      : s
                                  ),
                                })
                              }
                              className="bg-zinc-600 text-white px-3 py-2 rounded"
                            />
                            <input
                              type="date"
                              value={stage.date}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stages: formData.stages.map((s, idx) =>
                                    idx === si
                                      ? { ...s, date: e.target.value }
                                      : s
                                  ),
                                })
                              }
                              className="bg-zinc-600 text-white px-3 py-2 rounded"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => editStage(si)}
                              className="p-2 bg-blue-600 rounded-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit2 className="w-4 h-4 text-white" />
                            </motion.button>
                            <motion.button
                              onClick={() => removeStage(si)}
                              className="p-2 bg-red-600 rounded-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </motion.button>
                          </div>
                        </div>
                        {/* Photos in stage */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm">
                              Фотографий ({stage.photos?.length || 0})
                            </span>
                            <label className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-white text-sm cursor-pointer">
                              <Upload className="inline w-4 h-4 mr-1" />
                              Добавить фото
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) =>
                                  e.target.files &&
                                  handleMultipleFileUpload(si, e.target.files)
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                          {stage.photos && stage.photos.length > 0 ? (
                            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                              {stage.photos.map((photo: any, pi: number) => (
                                <div
                                  key={photo.id}
                                  className="relative group"
                                >
                                  <img
                                    src={photo.url}
                                    alt={`stage-${si}-photo-${pi}`}
                                    className="w-full h-12 object-cover rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(si, pi)}
                                    className="absolute top-1 right-1 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-center py-2">
                              Фотографий нет
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                    whileHover={{ scale: 1.05 }}
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={uploading}
                    className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {uploading ? 'Загрузка...' : 'Сохранить'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stage Modal */}
      <AnimatePresence>
        {showStageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingStage ? 'Редактировать этап' : 'Добавить этап'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Название этапа
                  </label>
                  <input
                    type="text"
                    value={stageFormData.name}
                    onChange={(e) =>
                      setStageFormData({ ...stageFormData, name: e.target.value })
                    }
                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg"
                    placeholder="Название этапа"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Дата этапа
                  </label>
                  <input
                    type="date"
                    value={stageFormData.date}
                    onChange={(e) =>
                      setStageFormData({ ...stageFormData, date: e.target.value })
                    }
                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
                {!editingStage && (
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Вставить после этапа
                    </label>
                    <select
                      value={stageFormData.insertAfter}
                      onChange={(e) =>
                        setStageFormData({
                          ...stageFormData,
                          insertAfter: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg"
                    >
                      <option value={-1}>В конец списка</option>
                      {formData.stages.map((s, idx) => (
                        <option key={s.id} value={idx}>
                          После "{s.name}"
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <motion.button
                  onClick={() => {
                    setShowStageModal(false);
                    setEditingStage(null);
                    setStageFormData({ name: '', date: '', insertAfter: -1 });
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  Отмена
                </motion.button>
                <motion.button
                  onClick={editingStage ? saveStageEdit : addStage}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="inline w-4 h-4 mr-1" />
                  {editingStage ? 'Сохранить' : 'Добавить'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
                Удалить альбом?
              </h3>
              <p className="text-gray-300 mb-6">
                Это действие нельзя отменить. Альбом и все его содержимое будет удалено.
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
                  onClick={() => handleDeleteAlbum(showDeleteConfirm!)}
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

export default AlbumsTab;
