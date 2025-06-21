import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, MapPin, ExternalLink, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import apiService from '../../services/api';

function EventsTab() {
  const { events, loadData } = useData();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    address: '',
    organizerUrl: ''
  });

  const toggleEvent = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Удалить событие?')) {
      try {
        await apiService.deleteEvent(eventId);
        await loadData();
        alert('Событие удалено!');
      } catch (error) {
        alert('Ошибка при удалении события');
      }
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createEvent(formData);
      await loadData();
      setFormData({ name: '', date: '', address: '', organizerUrl: '' });
      setShowCreateModal(false);
      alert('Событие успешно создано!');
    } catch (error) {
      alert('Ошибка при создании события');
    }
  };

  const startEditing = (eventId: string, field: string, currentValue: string) => {
    setEditingFields({
      ...editingFields,
      [`${eventId}-${field}`]: currentValue
    });
  };

  const cancelEditing = (eventId: string, field: string) => {
    const newEditingFields = { ...editingFields };
    delete newEditingFields[`${eventId}-${field}`];
    setEditingFields(newEditingFields);
  };

  const saveField = async (eventId: string, field: string) => {
    const fieldKey = `${eventId}-${field}`;
    const value = editingFields[fieldKey];
    
    try {
      await apiService.updateEvent(eventId, { [field]: value });
      await loadData();
      
      const newEditingFields = { ...editingFields };
      delete newEditingFields[fieldKey];
      setEditingFields(newEditingFields);
      
      alert('Изменения сохранены!');
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  const updateEditingField = (eventId: string, field: string, value: string) => {
    setEditingFields({
      ...editingFields,
      [`${eventId}-${field}`]: value
    });
  };

  const isEditing = (eventId: string, field: string) => {
    return editingFields.hasOwnProperty(`${eventId}-${field}`);
  };

  const getEditingValue = (eventId: string, field: string) => {
    return editingFields[`${eventId}-${field}`] || '';
  };

  const completedEvents = events.filter(event => event.isCompleted);
  const upcomingEvents = events.filter(event => !event.isCompleted);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.h2
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          События
        </motion.h2>
        
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Создать событие</span>
        </motion.button>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Предстоящие события</h3>
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      onClick={() => toggleEvent(event.id)}
                      className="text-gray-400 hover:text-white"
                      whileHover={{ scale: 1.1 }}
                    >
                      {expandedEvent === event.id ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </motion.button>
                    
                    <div>
                      <h4 className="text-xl font-bold text-white">{event.name}</h4>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(event.date), 'dd MMMM yyyy', { locale: ru })}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{event.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedEvent === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-zinc-700"
                  >
                    <div className="p-6 space-y-4">
                      {/* Event Name Field */}
                      <div>
                        <label className="block text-white font-medium mb-2">Название события</label>
                        <div className="flex items-center space-x-2">
                          {isEditing(event.id, 'name') ? (
                            <>
                              <input
                                type="text"
                                value={getEditingValue(event.id, 'name')}
                                onChange={(e) => updateEditingField(event.id, 'name', e.target.value)}
                                className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <motion.button
                                onClick={() => saveField(event.id, 'name')}
                                className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Save className="w-4 h-4 text-white" />
                              </motion.button>
                              <motion.button
                                onClick={() => cancelEditing(event.id, 'name')}
                                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <X className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg">
                                {event.name}
                              </div>
                              <motion.button
                                onClick={() => startEditing(event.id, 'name', event.name)}
                                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit2 className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Event Date Field */}
                      <div>
                        <label className="block text-white font-medium mb-2">Дата события</label>
                        <div className="flex items-center space-x-2">
                          {isEditing(event.id, 'date') ? (
                            <>
                              <input
                                type="date"
                                value={getEditingValue(event.id, 'date')}
                                onChange={(e) => updateEditingField(event.id, 'date', e.target.value)}
                                className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <motion.button
                                onClick={() => saveField(event.id, 'date')}
                                className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Save className="w-4 h-4 text-white" />
                              </motion.button>
                              <motion.button
                                onClick={() => cancelEditing(event.id, 'date')}
                                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <X className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg">
                                {event.date}
                              </div>
                              <motion.button
                                onClick={() => startEditing(event.id, 'date', event.date)}
                                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit2 className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Event Address Field */}
                      <div>
                        <label className="block text-white font-medium mb-2">Адрес</label>
                        <div className="flex items-center space-x-2">
                          {isEditing(event.id, 'address') ? (
                            <>
                              <input
                                type="text"
                                value={getEditingValue(event.id, 'address')}
                                onChange={(e) => updateEditingField(event.id, 'address', e.target.value)}
                                className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <motion.button
                                onClick={() => saveField(event.id, 'address')}
                                className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Save className="w-4 h-4 text-white" />
                              </motion.button>
                              <motion.button
                                onClick={() => cancelEditing(event.id, 'address')}
                                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <X className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg">
                                {event.address}
                              </div>
                              <motion.button
                                onClick={() => startEditing(event.id, 'address', event.address)}
                                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit2 className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Organizer URL Field */}
                      {event.organizerUrl && (
                        <div>
                          <label className="block text-white font-medium mb-2">Ссылка на организатора</label>
                          <div className="flex items-center space-x-2">
                            {isEditing(event.id, 'organizerUrl') ? (
                              <>
                                <input
                                  type="url"
                                  value={getEditingValue(event.id, 'organizerUrl')}
                                  onChange={(e) => updateEditingField(event.id, 'organizerUrl', e.target.value)}
                                  className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <motion.button
                                  onClick={() => saveField(event.id, 'organizerUrl')}
                                  className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Save className="w-4 h-4 text-white" />
                                </motion.button>
                                <motion.button
                                  onClick={() => cancelEditing(event.id, 'organizerUrl')}
                                  className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <X className="w-4 h-4 text-white" />
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <div className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg">
                                  {event.organizerUrl}
                                </div>
                                <motion.button
                                  onClick={() => startEditing(event.id, 'organizerUrl', event.organizerUrl || '')}
                                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Edit2 className="w-4 h-4 text-white" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Completed Events */}
      {completedEvents.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Завершенные события</h3>
          <div className="space-y-4">
            {completedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-300">{event.name}</h4>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.date), 'dd MMMM yyyy', { locale: ru })}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{event.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                    Завершено
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Создать событие</h3>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Название</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Дата</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Адрес</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Ссылка на организатора (необязательно)</label>
                  <input
                    type="url"
                    value={formData.organizerUrl}
                    onChange={(e) => setFormData({ ...formData, organizerUrl: e.target.value })}
                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Отмена
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-white font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Сохранить
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventsTab;