// src/components/Header.js
import React,{useState,useEffect} from 'react';
import './AdminPage.css';

const Header = () => {
  const [Adminname, setAdminname] = useState('');
  useEffect(() => {
    const storedName = sessionStorage.getItem("username");
    if (storedName) {
      setAdminname(storedName);
    }
  }, []);
  return (
    <header className="admin-header">
       <div className="admin-dash-logo">
        <img src="/img-asset/logo.png" alt="Logo" />
        <a href="#" className="admin-com-title">Handy Homes</a>
        {/* <h1>Handy Homes</h1> */}
      </div>
      
      <div className="admin-user">Welcome, {Adminname || 'Admin'}</div>
    </header>
  );
};

export default Header;
