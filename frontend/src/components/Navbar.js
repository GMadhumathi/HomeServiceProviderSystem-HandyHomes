import React, { useState, useRef, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import "./Navbar.css"; // Create a separate CSS file for styling

function Navbar() {
  const user = sessionStorage.getItem("username");
  const user_id = sessionStorage.getItem("user_id");
  const isLoggedIn = !!sessionStorage.getItem("user_id"); 

  const API_URL = "http://localhost:8080";
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef();

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 
  const handleServiceClick = () => {
        if (user_id) {
            navigate("/dashboard"); // Redirect to Dashboard if logged in
        } else {
            navigate("/"); // Stay on Home Page if not logged in
        }
    };
  
    const handleHomeClick = () => {
        if (user_id){
          navigate("/");
        }
        else{
          navigate("/");
        }
    };

  const handleClickOutside = (event) => {
    if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
      setShowProfileMenu(false);
    }
  };

  const logoutUser = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("user_id");

      Swal.fire({
        title: "Logout Successful",
        icon: "success",
       /* timer: 2000, */
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
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
    <nav className="navbar">
      <div className="dash-logo">
        <img src="./img-asset/logo.png" alt="Logo" />
        <a href="#" className="com-title">Handy Homes</a>
      </div>
      <ul className="dash-nav-link">
        <li><a href="#" onClick={(e) => { e.preventDefault(); handleHomeClick(); }} style={{ fontWeight: "bold" }}>Home</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); handleServiceClick(); }} style={{ fontWeight: "bold" }}>Services</a></li>
        <li><a href="#about" style={{ fontWeight: "bold" }}>About us</a></li>
        <li>
          { isLoggedIn ?(
            <>
                {/* <img src="./img-asset/profile.png" style={{ width: "55px", height: "55px" }} alt="profile"
                  onClick={() => setShowProfileMenu(!showProfileMenu)} /> */}

                <div
                    className="profile-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        {user.charAt(0).toUpperCase()}
                </div>
                {showProfileMenu && (
                  <div className="profile-menu" ref={profileMenuRef}>
                        <div className="close-menu" onClick={() => setShowProfileMenu(false)}>&#10005;</div>
                        {user && <div className="username-name">{user}!</div>}
                        <div onClick={()=>navigate("/profile")}>My Profile</div>
                        <div onClick={() => navigate("/bookingHistory")}>Booking History</div>
                        <div onClick={() => navigate("/wallet")}>My Wallet</div>
                        <div onClick={logoutUser} style={{ cursor: "pointer" }}>Logout</div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/userRegister">
                  <input type="button" value="Login / Sign Up" />
              </Link> 
            )
          }
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
