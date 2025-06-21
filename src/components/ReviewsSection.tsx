import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Plus, Upload, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import apiService from '../services/api';

function ReviewsSection() {
  const { reviews, loadData } = useData();
  const [showForm, setShowForm] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    socialLink: '',
    rating: 5,
    text: ''
  });

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      prevReview();
    } else if (info.offset.x < -threshold) {
      nextReview();
    }
  };

  useEffect(() => {
    if (isAutoPlay && reviews.length > 1 && !showForm) {
      autoPlayRef.current = setInterval(() => {
        nextReview();
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, currentReview, reviews.length, showForm]);

  const handleInteraction = () => {
    setIsAutoPlay(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setTimeout(() => {
      setIsAutoPlay(true);
    }, 8000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createReview(formData);
      await loadData();
      setFormData({ name: '', avatar: '', socialLink: '', rating: 5, text: '' });
      setShowForm(false);
      alert('Отзыв успешно добавлен!');
    } catch (error) {
      alert('Ошибка при добавлении отзыва');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const result = await apiService.uploadFile(file);
        if (result.success) {
          setFormData({ ...formData, avatar: result.url });
        }
      } catch (error) {
        alert('Ошибка при загрузке файла');
      } finally {
        setUploading(false);
      }
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRatingChange?: (rating: number) => void
  ) => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`rounded-full transition-all duration-300 flex items-center justify-center ${
              star <= rating ? 'opacity-100 shadow-lg' : 'opacity-30'
            } bg-transparent overflow-hidden`}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            disabled={!interactive}
            style={{
              width: '2.25rem',
              height: '2.25rem'
            }}
          >
            <img
              src="/rev.png"
              alt="review icon"
              className="object-contain w-full h-full"
              style={{
                filter:
                  star <= rating
                    ? 'none'
                    : 'grayscale(100%) brightness(0.7)'
              }}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <motion.section
        id="reviews"
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase tracking-wider">
            Отзывы
          </h2>
          <p className="text-gray-400 mb-8">Пока нет отзывов. Будьте первым!</p>
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 uppercase tracking-wider transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Оставить отзыв
          </motion.button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      id="reviews"
      className="py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          className="text-4xl md:text-6xl font-black text-white text-center mb-16 uppercase tracking-wider"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            textShadow: '0 0 20px rgba(255,69,0,0.8), 0 0 40px rgba(255,69,0,0.4)'
          }}
        >
          Отзывы
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reviews Slider */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-900 border-2 border-red-600/30 p-4 md:p-6 shadow-xl h-80 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                style={{
                  clipPath:
                    'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                  background:
                    'linear-gradient(135deg, rgba(255,69,0,0.1) 0%, rgba(139,0,0,0.05) 100%)',
                  backdropFilter: 'blur(10px)'
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onDragStart={handleInteraction}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={reviews[currentReview]?.avatar}
                    alt={reviews[currentReview]?.name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-red-500"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 uppercase tracking-wider">
                      {reviews[currentReview]?.name}
                    </h3>
                    {reviews[currentReview]?.socialLink && (
                      <a
                        href={reviews[currentReview].socialLink}
                        className="text-red-500 hover:text-red-400 text-sm mb-2 block font-bold"
                      >
                        {reviews[currentReview].socialLink}
                      </a>
                    )}
                    <div className="mb-3">
                      {renderStars(reviews[currentReview]?.rating || 0)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed flex-1 overflow-y-auto text-sm md:text-base">
                  {reviews[currentReview]?.text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center space-x-4 mt-6">
              <motion.button
                onClick={() => {
                  handleInteraction();
                  prevReview();
                }}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
              <motion.button
                onClick={() => {
                  handleInteraction();
                  nextReview();
                }}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Swipe indicator for mobile */}
            <div className="lg:hidden text-center mt-4 text-white/70 text-sm">
              ← Swipe to navigate →
            </div>
          </div>

          {/* Add Review Button */}
          <div className="flex flex-col justify-center items-center">
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 uppercase tracking-wider transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              Оставить отзыв
            </motion.button>
          </div>
        </div>
      </div>
      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border-2 border-red-600/30 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Новый отзыв
                </h3>
                <motion.button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Загрузка аватара */}
                <div>
                  <label className="block text-white font-bold mb-2 uppercase">
                    Загрузить аватар
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="flex-1 bg-zinc-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                {/* Имя */}
                <div>
                  <label className="block text-white font-bold mb-2 uppercase">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-zinc-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {/* Ссылка */}
                <div>
                  <label className="block text-white font-bold mb-2 uppercase">
                    Ссылка на соц.сеть
                  </label>
                  <input
                    type="url"
                    value={formData.socialLink}
                    onChange={(e) =>
                      setFormData({ ...formData, socialLink: e.target.value })
                    }
                    className="w-full bg-zinc-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {/* Текст */}
                <div>
                  <label className="block text-white font-bold mb-2 uppercase">
                    Текст отзыва
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    className="w-full bg-zinc-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {/* Оценка */}
                <div>
                  <label className="block text-white font-bold mb-2 uppercase">
                    Выберите оценку
                  </label>
                  {renderStars(
                    formData.rating,
                    true,
                    (rating) =>
                      setFormData({ ...formData, rating })
                  )}
                </div>
                {/* Кнопка отправки */}
                <motion.button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 uppercase tracking-wider transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    clipPath:
                      'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  }}
                >
                  {uploading ? 'Загрузка...' : 'Добавить отзыв'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default ReviewsSection;
