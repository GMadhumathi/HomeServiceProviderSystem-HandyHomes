import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./ForgotPassword.css";

function ForgotPassword(){
    const API_URL = "http://localhost:8080"; // Your Backend API URL

    const [email, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const navigate = useNavigate();

    const toggleResetIcon = () => {
        setShowPass(!showPass);
      };

    const toggleConfirmReset = () => {
        setShowConfirmPass(!showConfirmPass);
    };

    const validateReset = () => {
        const passPattern = /^[A-Za-z\d@#$%&!*]{7,}$/;

        if (email === "" || password === "" || confirmPassword === "") {
          setError("* All fields are required");
          return false;
        }
        if (!password.match(passPattern)) {
            setError("* Password must be at least 7 characters long and can include letters, numbers, and special characters");
            return false;
          }
        if (password !== confirmPassword) {
            setError("* Passwords doesn't match");
            return false;
        }

        setError("");
        return true;
      };      
    
      const handleReset = async (e) => {
        e.preventDefault();
        if (validateReset()) {
            try {
                const response = await axios.put(`${API_URL}/reset-password`, {
                    email: email,
                    password: password,       
                });
    
                if (response.data.status === "success") {
                    //console.log(response.data);
                    
                    Swal.fire({
                        title: "Password Reset Successfully",
                        text: "Login with your new  Password",
                        icon: "success",
                        iconColor: "green", 
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK",
                        showClass: {
                            popup: "animate__animated animate__zoomIn"
                        }
                    }).then(() => {
                        navigate("/userLogin"); 
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
        <div className="reset-body">
            <br />
            <div className="reset-pass-container">
                <div className="reset-pass-form">
                    <h2 className="reset-pass-title">Reset Password</h2>
                    <form onSubmit={handleReset}>
                        <div className="reset-form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setMail(e.target.value)} />
                        </div>
                        <div className="reset-form-group">
                            <label htmlFor="reset-password">New Password</label>
                            <div className="reset-password-container">
                                <input type={showPass ? "text" : "password"} id="reset-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <span className="reset-show-pass-icon" onClick={toggleResetIcon}>
                                    <img src={showPass ? "./img-asset/hidePass.png" : "./img-asset/showPass.png"} width="40px" height="40px" alt="icon" />
                                </span>
                            </div>
                        </div>
                        <div className="reset-form-group">
                            <label htmlFor="reset-confirm-password">Confirm New Password</label>
                            <div className="reset-password-container">
                                <input type={showConfirmPass ? "text" : "password"} id="reset-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                <span className="reset-show-pass-icon" onClick={toggleConfirmReset}>
                                    <img src={showConfirmPass ? "./img-asset/hidePass.png" : "./img-asset/showPass.png"} width="40px" height="40px" alt="icon" />
                                </span>
                            </div>
                        </div>
                        {error && <span className="reset-error">{error}</span>} <br /><br />
                        <div className="reset-form-group">
                            <input type="submit" value="Reset Password" />
                        </div>
                    </form>
                </div>
                <br />
            </div>
            <br /><br />
        </div>
    );
};

export default ForgotPassword;