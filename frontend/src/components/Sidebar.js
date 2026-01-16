import React from 'react';
import Swal from 'sweetalert2';
import {Link, useNavigate } from 'react-router-dom';
import './AdminPage.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // sessionStorage.clear();
    // navigate('/');

    try{
      sessionStorage.clear();
      Swal.fire({
          title: "Logout Successful",
          icon: "success",
          confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
           }).then(() => {
                navigate("/");
           });
    } 
    catch (error) {
         console.error("Logout Error", error);
        Swal.fire({
        title: "Oops...",
        text: "Logout Failed",
        icon: "error",
        iconColor: "red",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        showClass: {
              popup: "animate__animated animate__shakeX"
        }
      });
    }
  };

  return (
    <div className="admin-sidebar">
      <h2>Admin Hub</h2>
      <ul>
        <li><a href="#">Dashboard</a></li>
        {/* <li><a href="#">Assign Provider</a></li> */}
        <li><Link to="/adminDashboard/assign-provider">Assign Provider</Link></li>
        {/* <li><a href="#">Booking History</a></li> */}
        <li><a href="#" onClick={handleLogout}>Logout</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
