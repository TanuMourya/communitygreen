import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Chatbot from './components/Chatbot';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Chatbot />
      <Routes>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
