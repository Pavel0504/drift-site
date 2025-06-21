import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Instagram, Send } from 'lucide-react';

const contacts = [
  {
    icon: Send,
    text: '@keepitstreet47',
    href: 'https://t.me/keepitstreet47'
  },
  {
    icon: MapPin,
    text: 'Выборг, Россия',
    href: 'https://www.google.com/maps/search/?api=1&query=Выборг%2C%20Россия'
  },
  {
    icon: Instagram,
    text: '@aruv4ik.prod',
    href: 'https://www.instagram.com/aruv4ik.prod'
  },
  {
    icon: Send,
    text: 'thuglifezhiguli',
    href: 'https://t.me/thuglifezhiguli'
  }
];

function ContactsStrip() {
  return (
    <div className="py-4 bg-black border-t-2 border-red-600/30 border-b-2 overflow-hidden">
      <motion.div
        className="flex items-center space-x-8 md:space-x-16 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {[...contacts, ...contacts, ...contacts].map((contact, index) => {
          const IconComponent = contact.icon;
          return (
            <a
              key={index}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-visible"
            >
              <motion.div
                className="flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2 cursor-pointer relative overflow-visible"
                whileHover={{ scale: 1.05 }}
              >
                {/* Фоновое изображение появляется при hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300 overflow-visible"
                  style={{
                    backgroundImage: "url('/prot.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(1.2) saturate(1.5)',
                    // Можно добавить лёгкий тёмный оверлей, если нужно:
                    // backgroundBlendMode: 'overlay',
                  }}
                />
                <IconComponent className="text-red-500 w-5 h-5 md:w-6 md:h-6 relative z-10" />
                <span
                  className="text-white font-bold relative z-10 uppercase tracking-wider text-sm md:text-base"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {contact.text}
                </span>
              </motion.div>
            </a>
          );
        })}
      </motion.div>
    </div>
  );
}

export default ContactsStrip;
