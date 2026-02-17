import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/user/UserDashboard';
import RaiseComplaint from './pages/user/RaiseComplaint';
import MyComplaints from './pages/user/MyComplaints';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ManagementDashboard from './pages/management/ManagementDashboard';
import ManageProviders from './pages/management/ManageProviders';
import ManagementComplaints from './pages/management/ManagementComplaints';
import LandingPage from './pages/LandingPage';
import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* User Routes */}
          <Route path="/user/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/raise-complaint" element={
            <ProtectedRoute allowedRoles={['user']}>
              <RaiseComplaint />
            </ProtectedRoute>
          } />
          <Route path="/user/my-complaints" element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyComplaints />
            </ProtectedRoute>
          } />

          {/* Service Provider Routes */}
          <Route path="/provider/dashboard" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } />

          {/* Management Routes */}
          <Route path="/management/dashboard" element={
            <ProtectedRoute allowedRoles={['management']}>
              <ManagementDashboard />
            </ProtectedRoute>
          } />
          <Route path="/management/providers" element={
            <ProtectedRoute allowedRoles={['management']}>
              <ManageProviders />
            </ProtectedRoute>
          } />
          <Route path="/management/complaints" element={
            <ProtectedRoute allowedRoles={['management']}>
              <ManagementComplaints />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
