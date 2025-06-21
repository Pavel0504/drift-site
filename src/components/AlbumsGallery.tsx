import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function AlbumsGallery() {
  const { albums, loading } = useData();
  const navigate = useNavigate();

  const handleAlbumClick = (albumId: string) => {
    navigate(`/album/${albumId}`);
  };

  if (loading) {
    return (
      <div className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="text-white text-lg">Загрузка альбомов...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      id="albums"
      className="py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto">
        <motion.div
          className="flex items-center justify-center space-x-4 mb-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            textShadow: '0 0 20px rgba(255,69,0,0.8), 0 0 40px rgba(255,69,0,0.4)'
          }}
        >
          <img
            src="/left-top.png"
            alt="Левая иконка"
            className="w-16 h-16 md:w-40 md:h-36"
          />
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider">
            Альбомы
          </h2>
          <img
            src="/right-top.png"
            alt="Правая иконка"
            className="w-16 h-16 md:w-40 md:h-36"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              className="relative group cursor-pointer bg-zinc-900 border-2 border-red-600/30 hover:border-red-500 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 30px rgba(255,69,0,0.6)'
              }}
              onClick={() => handleAlbumClick(album.id)}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={album.previewImage}
                  alt={album.name}
                  className="w-full h-48 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center relative p-4">
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, rgba(255,69,0,0.8) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: 'center'
                      }}
                    />
                    <motion.h3
                      className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-wider relative z-10"
                      style={{
                        textShadow:
                          '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,69,0,0.6)'
                      }}
                    >
                      {album.name}
                    </motion.h3>

                    <div className="flex items-center justify-center space-x-4 md:space-x-6 text-white relative z-10">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        <span className="font-bold text-sm md:text-base">
                          {album.likes}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        <span className="font-bold text-sm md:text-base">
                          {album.downloads}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default AlbumsGallery;
