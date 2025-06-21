import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

function EventsSchedule() {
  const { events, loading } = useData();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const upcomingEvents = events.filter(event => !event.isCompleted);

  const toggleEvent = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (loading) {
    return (
      <div className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="text-white text-lg">Загрузка событий...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      id="events"
      className="py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Заголовок с боковыми картинками, распределённый по краям */}
        <motion.div
          className="flex justify-between items-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img
            src="/left.png"
            alt="Decoration Left"
            className="w-16 h-12 md:w-56 md:h-36 object-contain"
          />

          <motion.h2
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider text-center"
            style={{
              textShadow: '0 0 20px rgba(255,69,0,0.8), 0 0 40px rgba(255,69,0,0.4)'
            }}
          >
            События
          </motion.h2>

          <img
            src="/right.png"
            alt="Decoration Right"
            className="w-16 h-12 md:w-56 md:h-36 object-contain"
          />
        </motion.div>

        <div className="space-y-6">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="bg-zinc-900 border-2 border-red-600/30 hover:border-red-500 overflow-hidden shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <motion.div
                className="p-4 md:p-6 cursor-pointer"
                onClick={() => toggleEvent(event.id)}
                whileHover={{ backgroundColor: 'rgba(139, 0, 0, 0.1)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-wider">
                      {event.name}
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm md:text-base">
                          {format(new Date(event.date), 'dd MMMM yyyy', { locale: ru })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm md:text-base">{event.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedEvent === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-red-600/30"
                  >
                    <div className="p-4 md:p-6 bg-black/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 uppercase">Название события</h4>
                          <p className="text-gray-300">{event.name}</p>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 uppercase">Дата</h4>
                          <p className="text-gray-300">
                            {format(new Date(event.date), 'dd MMMM yyyy', { locale: ru })}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 uppercase">Адрес</h4>
                          <p className="text-gray-300">{event.address}</p>
                        </div>
                        {event.organizerUrl && (
                          <div>
                            <h4 className="text-lg font-bold text-white mb-2 uppercase">Организатор</h4>
                            <a
                              href={event.organizerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-500 hover:text-red-400 flex items-center space-x-1 font-bold"
                            >
                              <span>Перейти на сайт</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default EventsSchedule;