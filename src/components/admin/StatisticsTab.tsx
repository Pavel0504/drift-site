import { motion } from 'framer-motion';
import { Heart, Download, Calendar, FolderOpen, Camera } from 'lucide-react';
import { useData } from '../../context/DataContext';

function StatisticsTab() {
  const { statistics, albums, events } = useData();

  const stats = [
    {
      label: 'Общие лайки',
      value: statistics.totalLikes ?? 0,
      icon: Heart,
      color: 'text-red-500'
    },
    {
      label: 'Общие скачивания',
      value: statistics.totalDownloads ?? 0,
      icon: Download,
      color: 'text-blue-500'
    },
    {
      label: 'Автособытий',
      value: events.length,
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      label: 'Альбомов',
      value: albums.length,
      icon: FolderOpen,
      color: 'text-orange-500'
    }
  ];

  const totalPhotos = albums.reduce((sum, album) =>
    sum + album.stages.reduce((stSum, stage) => stSum + stage.photos.length, 0),
  0);

  return (
    <div>
      <motion.h2
        className="text-3xl font-bold text-white mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Статистика
      </motion.h2>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-zinc-800 rounded-xl p-6 border border-zinc-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                </div>
                <IconComponent className={`w-8 h-8 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Album Statistics */}
      <motion.div
        className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Camera className="w-6 h-6 text-orange-500 mr-2" />
          Статистика по альбомам
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left text-gray-300 font-medium pb-3">Альбом</th>
                <th className="text-center text-gray-300 font-medium pb-3">Фото</th>
                <th className="text-center text-gray-300 font-medium pb-3">Лайки</th>
                <th className="text-center text-gray-300 font-medium pb-3">Скачивания</th>
              </tr>
            </thead>
            <tbody>
              {albums.map((album, index) => (
                <motion.tr
                  key={album.id}
                  className="border-b border-zinc-700/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <td className="py-4 text-white font-medium">{album.name}</td>
                  <td className="py-4 text-center text-gray-300">
                    {album.stages.reduce((sum, stage) => sum + stage.photos.length, 0)}
                  </td>
                  <td className="py-4 text-center text-red-400">{album.likes}</td>
                  <td className="py-4 text-center text-blue-400">{album.downloads}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Total Photos Counter */}
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">Всего фотографий</h3>
        <p className="text-5xl font-bold text-white">{totalPhotos}</p>
      </motion.div>
    </div>
  );
}

export default StatisticsTab;