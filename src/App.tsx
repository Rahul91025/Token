import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import FormSubmission from './components/FormSubmission';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuthStore();
  const isAdmin = true;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/submit-form" element={<FormSubmission />} />
              {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;