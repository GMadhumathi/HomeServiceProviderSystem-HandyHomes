import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingHistory from './BookingHistory';
import Profile from './Profile';
import Wallet from './Wallet';


const CustomerRoutes = () => {
    return (
      <Routes>
        <Route path='/bookingHistory' element={<BookingHistory/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/wallet" element={<Wallet/>}/> 
      </Routes>
    );
  };
  
  export default CustomerRoutes;