import React from "react";
import { motion } from "framer-motion";
import { Camera, Instagram, Send, MessageCircle } from "lucide-react";
import { useData } from "../context/DataContext";

function Footer() {
  const { settings } = useData();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Общие стили для фонового hover-слоя
  const hoverBgStyle = {
    backgroundImage: "url('/prot.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "brightness(1.2) saturate(1.5)",
  };

  const menuItems = [
    { name: "Альбомы", id: "albums" },
    { name: "События", id: "events" },
    { name: "Отзывы", id: "reviews" },
  ];

  return (
    <motion.footer
      className="bg-black border-t-2 border-red-600/30 py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo and Image */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <Camera className="text-red-500 w-8 h-8" />
              <span className="text-white font-black text-2xl uppercase tracking-wider">
                {settings.siteName}
              </span>
            </div>
            <img
              src={settings.footerImageUrl}
              alt="Footer"
              className="w-full h-auto object-contain shadow-lg border-2 border-red-600/30"
            />
          </div>

          {/* Menu */}
          <div className="text-center">
            <h3 className="text-white font-black text-xl mb-6 uppercase tracking-wider">
              Меню
            </h3>
            <div className="space-y-4">
              {menuItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="block mx-auto relative group overflow-visible font-bold uppercase tracking-wider text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Фоновый hover-слой */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                    style={hoverBgStyle}
                  />
                  {/* Обёртка span для паддингов, чтобы фон охватывал область */}
                  <span
                    className="relative z-10 px-4 py-2"
                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    {item.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-black text-xl mb-6 uppercase tracking-wider">
              Социальные сети
            </h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <motion.a
                href={`https://t.me/${settings.telegram.replace("@", "")}`}
                className="relative group overflow-visible bg-blue-600 hover:bg-blue-700 p-3 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={hoverBgStyle}
                />
                <Send className="text-white w-6 h-6 relative z-10" />
              </motion.a>

              <motion.a
                href={`https://instagram.com/${settings.instagram.replace(
                  "@",
                  ""
                )}`}
                className="relative group overflow-visible bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-3 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={hoverBgStyle}
                />
                <Instagram className="text-white w-6 h-6 relative z-10" />
              </motion.a>

              <motion.a
                href={`https://t.me/${settings.telegramChannel.replace(
                  "@",
                  ""
                )}`}
                className="relative group overflow-visible bg-sky-600 hover:bg-sky-700 p-3 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={hoverBgStyle}
                />
                <MessageCircle className="text-white w-6 h-6 relative z-10" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t-2 border-red-600/30 text-center">
          <motion.p
            className="inline-block relative group overflow-visible cursor-pointer font-bold uppercase tracking-wider text-gray-400"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
              style={hoverBgStyle}
            />
            <span
              className="relative z-10 px-4 py-2"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
            >
              © 2025 {settings.siteName}. Все права защищены.
            </span>
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
