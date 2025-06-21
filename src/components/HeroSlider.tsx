import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useData } from '../context/DataContext';

function HeroSlider() {
  const { albums, getAlbumDetails } = useData();
  const [slides, setSlides] = useState<{ id: string; image: string; title: string }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Build slides from albums: use coverMedia (or previewImage) and name
  useEffect(() => {
    // Only include albums that have a coverMedia
    const s = albums
      .filter(a => a.coverMedia)
      .map(a => ({ id: a.id, image: a.coverMedia, title: a.name }));
    setSlides(s);
  }, [albums]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) prevSlide();
    else if (info.offset.x < -threshold) nextSlide();
    pauseAutoPlay();
  };

  const pauseAutoPlay = () => {
    setIsAutoPlay(false);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  useEffect(() => {
    if (isAutoPlay && slides.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, slides, currentSlide]);

  if (slides.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Нет доступных обложек
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[currentSlide].id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onDragStart={pauseAutoPlay}
          style={{ cursor: 'grab' }}
          whileDrag={{ cursor: 'grabbing' }}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.h1
                className="text-4xl md:text-6xl lg:text-8xl font-bold text-white text-center px-4 drop-shadow-2xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop nav */}
      <div className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2">
        <motion.button
          onClick={() => { pauseAutoPlay(); prevSlide(); }}
          className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Left arrow */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      </div>
      <div className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2">
        <motion.button
          onClick={() => { pauseAutoPlay(); nextSlide(); }}
          className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Right arrow */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => { pauseAutoPlay(); setCurrentSlide(idx); }}
            className={`w-3 h-3 rounded-full transition-colors ${
              idx === currentSlide ? 'bg-orange-500' : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Mobile swipe hint */}
      <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
        ← Свайпните для навигации →
      </div>
    </div>
  );
}

export default HeroSlider;
