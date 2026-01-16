import React,{useState} from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import './UserLogin.css';

function UserLogin(){
    const API_URL = "http://localhost:8080"; // Your Backend API URL

    const [email, setMail] = useState("");
    const [password, setCredential] = useState("");
   const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const togglePasswordIcon = () => {
        setShowPass(!showPass);
      };

      const validateLogin = () => {
        if (email === "" || password === "" || role==="") {
          setError("* All fields are required");
          return false;
        }
        setError("");
        return true;
      };      
    
      const handleLogin = async (e) => {
        e.preventDefault();
        if (validateLogin()) {
            try {
                const response = await axios.post(`${API_URL}/login`, {
                    role :role,
                    email: email,
                    password: password,
                });
    
                if (response.data.status === "success") {
                    console.log(response.data);
                     // Store JWT Token and Username in sessionStorage
                    sessionStorage.setItem("token", response.data.token); // JWT Token
                    sessionStorage.setItem("user_id", response.data.user_id);
                    sessionStorage.setItem("username", response.data.username); // Username
                    sessionStorage.setItem("userEmail",response.data.userEmail);
                    sessionStorage.setItem("role",response.data.role);

                    console.log("User Email:"+response.data.userEmail)
                    console.log("Token Saved in sessionStorage ✅");

                    // console.log("Stored User ID:", sessionStorage.getItem("user_id"));

                    Swal.fire({
                        title: "Login Successful",
                        text: "Click OK to continue",
                        icon: "success",
                        iconColor: "green", 
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK",
                        showClass: {
                            popup: "animate__animated animate__zoomIn"
                        }
                    }).then(() => {
                        if(response.data.role==="customer"){
                            navigate("/dashboard"); 
                        }
                        else{
                            navigate("/adminDashboard");
                        }
                       
                    });
                }
            } 
            catch (err) {
                console.log(err.response); // This will display backend error
                Swal.fire({
                    title: "Oops...",
                    text: err.response?.data.error || "Something went wrong!",
                    icon: "error",
                    iconColor: "red",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                    showClass: {
                        popup: "animate__animated animate__shakeX"
                    }
                });
                console.error(err);
            }
        }
    };
    
    return(
        //<div style={body}>
        <div className="body">
             <br />
            <div className="user-login-container">
            {/* User Type Selection  */}
                <div className="user-login-form">
                    
                    <h2 className="user-login-title" style={{ textAlign: "center", fontSize: "30px" }}> Login</h2>
                <form name="provider-login" id="provider-login" method="POST" onSubmit={handleLogin}>
                    {/* Role selection */}
                    <div className="useL-form-group">
                        <label htmlFor="role">Login As</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">Select Role</option>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {/* Email and password */}
                    <div className="useL-form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email"  value={email} onChange={(e) => setMail(e.target.value)}/>
                    </div>
                    <div className="useL-form-group">
                        <label htmlFor="password">Password</label>
                        <div className="useL-password-container">
                            <input type={showPass ? "text" : "password"} value={password} id="password" onChange={(e) => setCredential(e.target.value)}/>
                            <span id="showPassIcon" className="useL-show-pass-icon" onClick={togglePasswordIcon}>
                                <img src={showPass ? "./img-asset/hidePass.png" : "./img-asset/showPass.png"}
                                id="passIcon" width="40px" height="40px" alt="icon" />
                            </span>
                        </div>
                    </div> 
                    <div className="useL-forgot-pass">
                        <Link to="/forgotPassword">Forgot Password?</Link>
                    </div> 
                    { error && <span className="useL-error">{error}</span> } <br/><br/> 
                    <div className="useL-form-group">
                        <input type="submit" value="Login"/>
                    </div>
                </form>
                    <div className="useL-toggle-btn">
                        <Link to="/userRegister"> Don't have an account? Register Now </Link>
                        {/* <a href="#">Don't have an account? Register Now</a> */}
                    </div>
                </div>
                <br/>
            </div>
            <br/> <br/>
    </div>
    );
}

export default UserLogin;