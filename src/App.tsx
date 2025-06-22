import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import AlbumPage from './pages/AlbumPage';
import WallpapersPage from './pages/WallpapersPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import { DataProvider } from './context/DataContext';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

function App() {
  return (
    <DataProvider>
      <Router>
        <motion.div
          className="min-h-screen bg-zinc-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/wallpapers" element={<WallpapersPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminPage />} />
          </Routes>
          <ScrollToTop />
        </motion.div>
      </Router>
    </DataProvider>
  );
}

export default App;