import React from 'react';
import Home from './components/Home';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
import UserRegister from './components/UserRegister';
import UserLogin from './components/UserLogin';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import BookingHistory from './components/BookingHistory';
import Profile from './components/Profile';
import Wallet from './components/Wallet';
import AdminPage from './components/AdminPage';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerRoutes from './components/CustomerRoutes';

function App() {
  return (
    <Router>
       <ScrollToTop />
      <Routes>

          {/* Public Routes */}
        <Route path="/" element={<Home/>}/>
        <Route path="/userRegister" element={<UserRegister/>}/>
        <Route path="/userLogin" element={<UserLogin/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/forgotPassword" element={<ForgotPassword/>}/> 
        <Route path='/bookingHistory' element={<BookingHistory/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/wallet" element={<Wallet/>}/> 
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Customer Portal Group */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerRoutes />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Group */}
        <Route
          path="/adminDashboard/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* <Route path="/" element={<Home/>}/>
        <Route path="/userRegister" element={<UserRegister/>}/>
        <Route path="/userLogin" element={<UserLogin/>}/>
        <Route path="/forgotPassword" element={<ForgotPassword/>}/> 
        <Route path='/bookingHistory' element={<BookingHistory/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/adminDashboard/*" element={<AdminPage/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/wallet" element={<Wallet/>}/> */}
        
      </Routes>
    </Router>
  
  );
}

export default App;
