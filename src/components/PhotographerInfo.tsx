import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Volume2,
  Settings,
  Phone,
  MapPin,
  Camera,
  Radio,
  Bluetooth,
  Music,
  Film,
  Navigation,
  Monitor,
  Disc,
  Search,
  Send,
  Instagram,
  MessageCircle,
} from "lucide-react";

function PhotographerInfo() {
  const [isNavigatorMode, setIsNavigatorMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("02:57");
  const [currentDate, setCurrentDate] = useState("1 декабря");
  const [activeMenu, setActiveMenu] = useState("navigator");
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Обновление времени/даты каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Детектим мобильное разрешение через matchMedia
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
    } else {
      // Для старых браузеров
      mql.addListener(onChange);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange);
      } else {
        mql.removeListener(onChange);
      }
    };
  }, []);

  // При показе видео сбрасываем состояние воспроизведения
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      try {
        videoRef.current.currentTime = 0;
      } catch (e) {
        // Может не сработать, если видео ещё не загружено
      }
      videoRef.current.volume = 1;
      videoRef.current.muted = false;
    }
  }, [showVideo]);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleVideo = () => {
    console.log("handleToggleVideo called, isMobile=", isMobile);
    if (isMobile) {
      console.log("Mobile: видео не переключается");
      return;
    }
    setShowVideo((prev) => {
      console.log("Toggling showVideo from", prev, "to", !prev);
      return !prev;
    });
  };

  const menuItems = [
    {
      id: "navigator",
      name: "Навигатор",
      icon: Navigation,
      color: "bg-blue-500",
    },
    { id: "music", name: "Музыка", icon: Music, color: "bg-green-500" },
    { id: "dvd", name: "DVD", icon: Disc, color: "bg-purple-500" },
    { id: "radio", name: "Радио", icon: Radio, color: "bg-red-500" },
    {
      id: "bluetooth",
      name: "Bluetooth",
      icon: Bluetooth,
      color: "bg-blue-400",
    },
    { id: "ipod", name: "iPod", icon: Monitor, color: "bg-gray-500" },
    { id: "movies", name: "Фильмы", icon: Film, color: "bg-orange-500" },
    { id: "phone", name: "Телефон", icon: Phone, color: "bg-green-600" },
  ];

  const sideButtons = {
    left: [
      { name: "MENU", action: () => setIsNavigatorMode(!isNavigatorMode) },
      { name: "HOME", action: () => console.log("Home") },
      { name: "BACK", action: () => console.log("Back") },
      { name: "SEEK+", action: () => console.log("Seek+") },
      { name: "SEEK-", action: () => console.log("Seek-") },
      {
        name: "VOL+",
        action: () => {
          if (videoRef.current) {
            const vol = Math.min(videoRef.current.volume + 0.1, 1);
            videoRef.current.volume = vol;
          }
        },
      },
      {
        name: "VOL-",
        action: () => {
          if (videoRef.current) {
            const vol = Math.max(videoRef.current.volume - 0.1, 0);
            videoRef.current.volume = vol;
          }
        },
      },
      {
        name: "MUTE",
        action: () => {
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
          }
        },
      },
    ],
    right: [
      { name: "CARD", action: () => console.log("Card") },
      {
        name: "NAVI",
        action: () => {
          setActiveMenu("navigator");
          setIsNavigatorMode(true);
        },
      },
      { name: "MAP", action: () => console.log("Map") },
      { name: "CAM", action: () => console.log("Camera") },
      { name: "DVD", action: () => setActiveMenu("dvd") },
      { name: "RADIO", action: () => setActiveMenu("radio") },
      { name: "BT", action: () => setActiveMenu("bluetooth") },
      { name: "PHONE", action: () => setActiveMenu("phone") },
      { name: "SET", action: () => console.log("Settings") },
    ],
  };

  const renderContent = () => {
    if (showVideo) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="h-full flex items-center justify-center bg-black relative z-10"
        >
          <video
            ref={videoRef}
            src="http://localhost:3001/video"
            controls
            className="w-full h-full object-cover"
            onError={() => setShowVideo(false)}
          />
          {!isPlaying && (
            <button
              onClick={handlePlayVideo}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white"
            >
              <Play className="w-8 h-8" />
            </button>
          )}
        </motion.div>
      );
    }

    if (!isNavigatorMode) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center text-white h-full flex flex-col justify-center p-2 md:p-4"
        >
          <motion.img
            src="/ava.jpg"
            alt="Avatar"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-28 h-28 mx-auto rounded-full object-cover"
          />
          <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
            СЕРГЕЙ
          </h2>
          <h3 className="text-sm md:text-lg mb-2 md:mb-4">
            АВТОМОБИЛЬНЫЙ ФОТОГРАФ
          </h3>
          <p className="text-xs md:text-sm leading-relaxed max-w-xs md:max-w-md mx-auto">
            Профессиональная съемка автомобильных событий.
            <br />
            <br />
            Owner:{" "}
            <span className="inline-flex items-center relative group">
              <span className="text-green-500 font-semibold">Drift</span>{" "}
              <span className="text-white font-semibold">Vaz</span>{" "}
              <span className="text-pink-500 font-semibold">2107</span>
              {/* Hover-изображения: сверху, справа и снизу */}
              <img
                src="/jiga1.jpg"
                alt="Jiga Top"
                className="hidden md:block absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-32 h-32 object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
              />
              <img
                src="/jiga2.jpg"
                alt="Jiga Right"
                className="hidden md:block absolute top-1/2 left-full -translate-y-1/2 ml-2 w-32 h-32 object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
              />
              <img
                src="/jiga3.jpg"
                alt="Jiga Bottom"
                className="hidden md:block absolute left-1/2 top-full -translate-x-1/2 mt-2 w-32 h-32 object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
              />
            </span>
            <br />
            <br />
            Уникальные кадры с гонок, тюнинг-фестивалей,
            <br />
            выставок и частных фотосессий.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="h-full p-2 md:p-4"
      >
        <div className="grid grid-cols-4 gap-1 md:gap-3 h-full">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`${
                  item.color
                } rounded-lg p-1 md:p-3 flex flex-col items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
                  activeMenu === item.id
                    ? "ring-1 md:ring-2 ring-white shadow-xl"
                    : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <IconComponent className="w-3 h-3 md:w-6 md:h-6 mb-0.5 md:mb-1" />
                <span className="text-xs md:text-xs font-medium">
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.section
      className="py-10 md:py-20 px-4"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="relative bg-black rounded-lg overflow-visible shadow-2xl"
          style={{
            background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)",
            border: "3px solid #444",
          }}
        >
          {/* Top Status Bar */}
          <div className="bg-gray-900 px-2 md:px-4 py-1 md:py-2 border-b border-gray-700">
            <div className="flex items-center justify-between text-blue-400">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="text-xs"></div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold">
                  {currentTime}
                </div>
                <div className="text-xs">{currentDate}</div>
              </div>
              <div className="text-xs"></div>
            </div>
          </div>

          <div className="flex">
            {/* Left Side Buttons */}
            <div className="w-12 md:w-16 bg-gray-800 flex flex-col">
              {sideButtons.left.map((button) => (
                <motion.button
                  key={button.name}
                  onClick={button.action}
                  className="h-12 md:h-16 border-b border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-xs font-medium flex items-center justify-center"
                  whileHover={{ backgroundColor: "#374151" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {button.name}
                </motion.button>
              ))}
            </div>

            {/* Main Display */}
            <div
              className="flex-1 bg-black relative"
              style={{ minHeight: "60vh" }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  {renderContent()}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="w-12 md:w-16 bg-gray-800 flex flex-col">
              {sideButtons.right.map((button) => (
                <motion.button
                  key={button.name}
                  onClick={button.action}
                  className={`h-10 md:h-14 border-b border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-xs font-medium flex items-center justify-center ${
                    (button.name === "NAVI" && activeMenu === "navigator") ||
                    (button.name === "DVD" && activeMenu === "dvd") ||
                    (button.name === "RADIO" && activeMenu === "radio") ||
                    (button.name === "PHONE" && activeMenu === "phone")
                      ? "bg-orange-600 text-white"
                      : ""
                  }`}
                  whileHover={{ backgroundColor: "#374151" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {button.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bottom Control Panel */}
          <div className="bg-gray-900 p-2 md:p-4 border-t border-gray-700 relative z-20">
            <div className="flex items-center justify-between">
              {/* Volume Controls */}
              <div className="flex items-center space-x-1 md:space-x-2">
                <motion.button
                  className="w-8 h-8 md:w-10 md:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !videoRef.current.muted;
                    }
                  }}
                >
                  <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </motion.button>
                <div className="text-gray-400 text-xs">VOL</div>
              </div>

              {/* Center Control */}
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Скрываем кнопку видео на мобильных */}
                {!isMobile && (
                  <motion.button
                    onClick={handleToggleVideo}
                    className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors relative z-30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    <div
                      className={`absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full ${
                        showVideo ? "bg-green-500" : "bg-red-500"
                      } animate-pulse`}
                    />
                  </motion.button>
                )}
              </div>

              {/* Mode Controls */}
              <div className="flex items-center space-x-1 md:space-x-2">
                <motion.button
                  className="w-8 h-8 md:w-10 md:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Search className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </motion.button>
                <div className="text-gray-400 text-xs">SRC</div>
              </div>
            </div>

            {/* Social Media Integration */}
            <div className="flex justify-center space-x-2 md:space-x-4 mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-700">
              <motion.a
                href="https://t.me/thuglifezhiguli"
                className="bg-blue-600 hover:bg-blue-700 p-2 md:p-3 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="text-white w-4 h-4 md:w-5 md:h-5" />
              </motion.a>
              <motion.a
                href="https://instagram.com/aruv4ik.prod"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-2 md:p-3 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="text-white w-4 h-4 md:w-5 md:h-5" />
              </motion.a>
              <motion.a
                href="https://t.me/keepitstreet47"
                className="bg-sky-600 hover:bg-sky-700 p-2 md:p-3 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="text-white w-4 h-4 md:w-5 md:h-5" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default PhotographerInfo;
