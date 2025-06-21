import React from 'react';
import { motion } from 'framer-motion';

function SideImages() {
  return (
    <motion.section
      className="py-20 px-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          {/* Левая картинка из public/images/left-deco.jpg */}
          <motion.div
            className="w-full md:w-1/3"
            initial={{ x: -200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <img
              src="/left-top.png"
              alt="Left decoration"
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
            />
          </motion.div>

          {/* Правая картинка из public/images/right-deco.jpg */}
          <motion.div
            className="w-full md:w-1/3"
            initial={{ x: 200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <img
              src="/right-top.png"
              alt="Right decoration"
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default SideImages;