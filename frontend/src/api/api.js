import axios from 'axios';

const BASE_URL = "http://localhost:8080"; // Your Backend URL

// User Registration API
export const userRegister = async (userData) => {
    return await axios.post(`${BASE_URL}/UserRegister`, userData);
};

export const login = async(userData)=>{
    return await axios.post(`${BASE_URL}/login`,userData);
}


    