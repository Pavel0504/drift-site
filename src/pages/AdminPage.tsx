import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FolderOpen, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatisticsTab from '../components/admin/StatisticsTab';
import AlbumsTab from '../components/admin/AlbumsTab';
import EventsTab from '../components/admin/EventsTab';
import SettingsTab from '../components/admin/SettingsTab';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('statistics');
  const navigate = useNavigate();

  const tabs = [
    { id: 'statistics', name: 'Статистика', icon: BarChart3 },
    { id: 'albums', name: 'Альбомы', icon: FolderOpen },
    { id: 'events', name: 'События', icon: Calendar },
    { id: 'settings', name: 'Настройки', icon: Settings }
  ];

  const handleLogout = () => {
    navigate('/admin');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <StatisticsTab />;
      case 'albums':
        return <AlbumsTab />;
      case 'events':
        return <EventsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <StatisticsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-zinc-800 border-r border-zinc-700 flex flex-col"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 border-b border-zinc-700">
          <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
          <p className="text-gray-400 mt-1">AutoFrame Studio</p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.name}</span>
                </motion.button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-700">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
}

export default AdminPage;