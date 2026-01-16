// src/components/DashboardLayout.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import AdminMain from './AdminMain';
import AssignProvider from './AssignProvider'
import './AdminPage.css';

function AdminPage(){
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <AdminHeader />
        <Routes>
              <Route path="assign-provider" element={<AssignProvider />} />
        </Routes>
        {/* <AdminMain /> */}
      </div>
    </div>
        
  );
};

export default AdminPage;
