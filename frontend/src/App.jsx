import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UrlScanner from './pages/UrlScanner';
import TextScanner from './pages/TextScanner';
import History from './pages/History';
import Settings from './pages/Settings';
import Home from './pages/Home';
import AiAnalyst from './pages/AiAnalyst';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import LiquidEther from './components/LiquidEther';

function App() {
  const { theme } = useAuth();

  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
        <LiquidEther
          colors={theme === 'dark' ? ['#4f46e5', '#8b5cf6', '#a855f7'] : ['#818cf8', '#a78bfa', '#c084fc']}
          autoDemo={true}
        />
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          
          {/* Main Layout Protected Console */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan-url" element={<UrlScanner />} />
            <Route path="/scan-text" element={<TextScanner />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-analyst" element={<AiAnalyst />} />
          </Route>
        </Route>
        
        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
