import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import './UserRegister.css';


function UserRegister() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state,setState]=useState("");
    const [pin,setPincode]=useState("");
    const [password, setPassword] = useState("");
    const[confirmPassword,setConfirmPassword] = useState("");
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
      };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const validate = () => {
        let isValid = true;
        let newErrors = {};
    
        const mobilePattern = /^[0-9]{10}$/;
        const mailPattern = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
        const pinPattern = /^[1-9][0-9]{5}$/;
        const passPattern = /^[A-Za-z\d@#$%&!*]{7,}$/;
    
        if (!name) {
          newErrors.name = "* Name Field can't be empty";
          isValid = false;
        }
    
        if (!mobile.match(mobilePattern)) {
          newErrors.mobile = "* Please enter a valid 10-digit mobile number";
          isValid = false;
        }
    
        if (!mailPattern.test(email)) {
          newErrors.email = "* Please provide a valid email address";
          isValid = false;
        }
    
        if (!address) {
          newErrors.address = "* Address Field can't be empty";
          isValid = false;
        }
    
        if (!city) {
          newErrors.city = "* Please enter your city";
          isValid = false;
        }
    
        if (!state) {
          newErrors.state = "* Please enter your State";
          isValid = false;
        }
    
        if (!pin.match(pinPattern)) {
          newErrors.pin = "* Please enter valid 6-digit Pincode";
          isValid = false;
        }
    
        if (!password.match(passPattern)) {
          newErrors.password = "* Password must be at least 7 characters long and can include letters, numbers, and special characters";
          isValid = false;
        }
    
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "* Password doesn't match";
          isValid = false;
        }
    
        if (!agree) {
          newErrors.agree = "* You must agree to Terms and Conditions";
          isValid = false;
        }
    
        setErrors(newErrors);
        return isValid;
      };
    
      const handleRegister = async (e) => {
        e.preventDefault();
        if (validate()) {
          try {
            const response = await axios.post("http://localhost:8080/UserRegister", {
              name: name,
              email: email,
              mobile: mobile,
              address: address,
              city: city,
              state: state,
              pin: pin,
              password: password,
            });
      
            if (response.data.status === "success") {
                Swal.fire({
                    title: "Registration Successful",
                    text: "Click OK to continue",
                    icon: "success",
                    iconColor: "green", // Green Tick Color
                    confirmButtonColor: "#3085d6", // OK Button Color
                    confirmButtonText: "OK",
                    showClass: {
                      popup: "animate__animated animate__zoomIn" // Zoom In Animation
                    }
                  }).then(() => {
                    navigate("/userLogin"); // Navigate to Login Page
                  });
            } else {
                Swal.fire({
                    title: "Oops...",
                    text: "Registration Failed", // Your Message
                    icon: "error", // Red Cross Icon
                    iconColor:"red",
                    confirmButtonColor: "#3085d6", // Purple OK Button Color
                    confirmButtonText:"OK",
                    showClass: {
                      popup: "animate__animated animate__shakeX" // Shake Animation
                    }
                  });
            }
          } catch (err) {
            alert("Server Error");
            console.error(err);
          }
        }
      };
      
    return (
        //<div style={body}>
        <div className="user-body">
            <br/>
            <div className="user-container">
                <form id="userForm" name="userForm" onSubmit={handleRegister} method="POST">
                     {/* onSubmit={(event) => validateUserRegister(event)}> */}
                    <div className="customer-form">
                        <h2 className="user-form-title" style={{ textAlign: "center", fontSize: "30px" }}>Customer Sign Up</h2>
                        <div className="user-form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}/>
                            <span id="nameError" className="user-error">{errors.name}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            <span id="mailError" className="user-error">{errors.email}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="mobile">Mobile Number</label>
                            <input type="tel" id="mobile"  onChange={(e) => setMobile(e.target.value)} />
                            <span id="mobileError" className="user-error">{errors.mobile}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="address">Address</label>
                            <input type="text" id="address" onChange={(e) => setAddress(e.target.value)} />
                            <span id="addressError" className="user-error">{errors.address}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="city">City</label>
                            <select id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)}>
                                <option value="" disabled>Select your city</option>
                                <option value="Chennai">Chennai</option>
                                <option value="Coimbatore">Coimbatore</option>
                                <option value="Madurai">Madurai</option>
                                <option value="Trichy">Tiruchirappalli</option>
                                <option value="Salem">Salem</option>
                                <option value="Vellore">Vellore</option>
                                <option value="Thanjavur">Thanjavur</option>
                                <option value="Erode">Erode</option>
                                <option value="Tirunelveli">Tirunelveli</option>
                                <option value="Thoothukudi">Thoothukudi</option>
                                <option value="Karur">Karur</option>
                                <option value="Nagarcoil">Nagercoil</option>
                                <option value="Theni">Theni</option>
                                <option value="Dindigul">Dindigul</option>
                                <option value="Kumbakonam">Kumbakonam</option>
                                <option value="Virudhunagar">Virudhunagar</option>
                            </select>
                            <span id="cityError" className="user-error">{errors.city}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="state">State</label>
                            <input type="text" id="state" onChange={(e) => setState(e.target.value)}/>
                            <span id="stateError" className="user-error">{errors.state}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="pin">Pincode</label>
                            <input type="text" id="pin" onChange={(e) => setPincode(e.target.value)} />
                            <span id="pinError" className="user-error">{errors.pin}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="password">Password</label>
                            <div className="user-password-container">
                                <input type={showPassword ? "text" : "password"} value={password} id="password" onChange={(e) => setPassword(e.target.value)}/>
                                <span id="showPassIcon" className="user-show-pass-icon" onClick={togglePassword}>
                                     {/* onclick="togglePassword('password', 'passIcon')"> */}
                                      
                                    <img src={showPassword ? "./img-asset/hidePass.png" : "./img-asset/showPass.png"}
                                    id="passIcon" width="40px" height="40px" alt="Show Password" />
                                </span>
                            </div>
                            <span id="passError" className="user-error">{errors.password}</span>
                        </div>
                        <div className="user-form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <div className="user-password-container">
                                <input  type={showConfirmPassword ? "text" : "password"} value={confirmPassword} id="confirm-password" onChange={(e) => setConfirmPassword(e.target.value)} />
                                <span id="showConfirmPassIcon" className="user-show-pass-icon" onClick={toggleConfirmPassword }> 
                                    
                                    <img src={showConfirmPassword ? "./img-asset/hidePass.png" : "./img-asset/showPass.png"}
                                    id="confirmPassIcon" width="40px" height="40px" alt="Show Confirm Password" />
                                </span>
                            </div>
                            <span id="confirmPassError" className="user-error">{errors.confirmPassword}</span>
                        </div>
                        {/* <div class="form-group">
                            <label for="dob">Date of Birth</label>
                            <input type="date" id="dob" name="dob" max="2005-12-31" required/>
                        </div>  */}
                        <div className="user-form-check">
                            <input type="checkbox" id="check" name="check" checked={agree} onChange={() => setAgree(!agree)} />
                            <label htmlFor="check">I agree to the Terms and Conditions</label><br />
                            <span id="checkError" className="user-error">{errors.agree}</span>
                        </div>
                        <br /><br /><br />
                        <div className="user-form-group">
                            <input type="submit" value="Register" />
                            {/* <button>Register</button>  */}
                        </div>
                        <div className="user-toggle-btn">
                                <Link to="/userLogin">Already have an account? Login</Link>
                            {/* <a href="login.html">Already have an account? Login</a> */}
                        </div>
                    </div>
                    <br />
                </form>
                <br />
            </div>
            <br /><br />              
        </div>
    );
}

export default UserRegister;