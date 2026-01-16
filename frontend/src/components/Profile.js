import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import "./Profile.css"; // Importing CSS for styling

function Profile() {
    const API_URL="http://localhost:8080";
    const cities = ["Chennai", "Coimbatore", "Madurai", "Tirchy", "Salem","Vellore",
                    "Thanjavur","Erode","Tirunelveli","Thoothukudi","Karur","Nagarcoil","Theni",
                    "Dindigul","Kumbakonam","Virudhunagar"];

  const [user, setUser] = useState({name: "",email: "",phone: "",address: "",city:"",state:"",pincode:"",isEditing: false,});

  const fetchUserProfile = async () => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) 
                return console.error("No token found.");

            const response = await axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser({ ...response.data, isEditing: false });
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    useEffect(()=>{
        fetchUserProfile();
    },[]);

    const handleSaveChanges = async () => {
        try {
            const token = sessionStorage.getItem("token");

            await axios.put(`${API_URL}/user/profile`,{
                    name: user.name,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    state:user.state,
                    pincode: user.pincode,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser((prev) => ({ ...prev, isEditing: false }));
            Swal.fire({
                title: "Success!",
                text: "Profile updated successfully!",
                icon: "success",
                confirmButtonText: "OK",
              });
              
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };
  return (
    <div className="profile-body">
        <br/>
        <Navbar/>
        <hr />
        <br /><br />
        <div className="profile-container">
            <h2 className="profile-head">Profile Information</h2>
            <div className="profile-field">
                <label>Name</label>
                <input
                type="text"
                value={user.name}
                disabled={!user.isEditing}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
            </div>

            {/* <div className="profile-field">
                <label>Email:</label>
                <input type="text" value={user.email} disabled={!user.isEditing} 
                onChange={(e)=>setUser({...user,email:e.target.value})} />
            </div> */}
            
            <div className="profile-field">
                    <label>Email</label>
                    <input type="text" value={user.email} disabled />
            </div>

            <div className="profile-field">
                <label>Phone</label>
                <input
                type="text"
                value={user.phone}
                disabled={!user.isEditing}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
            </div>

            <div className="profile-field">
                <label>Address</label>
                <input
                type="text"
                value={user.address}
                disabled={!user.isEditing}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
                />
            </div>

            <div className="profile-field">
                <label>City</label>
                {user.isEditing ? (
                    <select
                    value={user.city}
                    onChange={(e) => setUser({ ...user, city: e.target.value })}
                    >
                    {cities.map((city, index) => (
                        <option key={index} value={city}>
                        {city}
                        </option>
                    ))}
                    </select>
                ) : (
                    <input type="text" value={user.city} disabled />
                )}
            </div>

            <div className="profile-field">
                <label>State</label>
                {user.isEditing ? (
                    <select
                    value={user.state}
                    onChange={(e) => setUser({ ...user, state: e.target.value })}
                    >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    </select>
                ) : (
                    <input type="text" value={user.state} disabled />
                )}
            </div>

            <div className="profile-field">
                <label>Pincode</label>
                <input
                    type="text"
                    value={user.pincode}
                    disabled={!user.isEditing}
                    onChange={(e) => setUser({ ...user, pincode: e.target.value })}
                />
            </div>

            {user.isEditing ? (
                // <button className="save-btn" onClick={() => setUser({ ...user, isEditing: false })}>
                <button className="save-btn" onClick={handleSaveChanges}>
                Save Changes
                </button>
            ) : (
                <button className="edit-btn" onClick={() => setUser({ ...user, isEditing: true })}>
                Edit Profile
                </button>
            )}
        </div>
    </div>
  );
}

export default Profile;
