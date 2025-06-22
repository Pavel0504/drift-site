import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: "Альбомы", id: "albums", type: "scroll" },
    { name: "События", id: "events", type: "scroll" },
    { name: "Отзывы", id: "reviews", type: "scroll" },
    { name: "Обои", path: "/wallpapers", type: "navigate" },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-black/50"
          : "backdrop-blur-lg bg-black/30"
      }`}
      style={{
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 69, 0, 0.3)",
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Логотип и название */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <img
              src="/logo.png"
              alt="AutoFrame Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-white font-bold text-xl tracking-wider">
              ARUV4IK.PROD
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => 
                  item.type === "scroll" 
                    ? scrollToSection(item.id!) 
                    : handleNavigation(item.path!)
                }
                className="relative text-white font-bold px-6 py-3 transition-all duration-300 group uppercase tracking-wider overflow-visible"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Фон-изображение prot.jpg, появляется при hover; с фильтрами для более "сочного" вида */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={{
                    backgroundImage: "url('/prot.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(1.2) saturate(1.5)", // увеличиваем насыщенность и яркость
                  }}
                />
                {/* Текст всегда белый, с лёгкой тенью */}
                <span className="relative z-10 drop-shadow-lg text-white">
                  {item.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 border-t border-red-500/30 pt-4 overflow-visible"
            >
              <div className="flex flex-col space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => 
                      item.type === "scroll" 
                        ? scrollToSection(item.id!) 
                        : handleNavigation(item.path!)
                    }
                    className="relative text-white font-bold py-3 px-4 text-left transition-all duration-300 uppercase tracking-wider group overflow-visible"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Фон-изображение prot.jpg для мобильного меню при hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                      style={{
                        backgroundImage: "url('/prot.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "brightness(1.2) saturate(1.5)",
                      }}
                    />
                    <span className="relative z-10 drop-shadow-lg text-white">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export default Header;