import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';
import Swal from "sweetalert2";
import Navbar from "./Navbar";

function Home(){
    const [searchTerm,setSearchTerm] = useState("");
    const navigate = useNavigate();

     // Handle search
     const handleSearch = () => {
        if (!searchTerm.trim()) {
           // alert("Please enter a service to search.");
           Swal.fire({
            title: "Warning!",
            text: "Please enter a service to search.",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK"
        }); 
           return;
        }
        
        const isLoggedIn = sessionStorage.getItem("token"); // Change based on your auth setup
    
        if (isLoggedIn) {
            sessionStorage.setItem("searchedCategory", searchTerm.trim()); // Store searched category
            navigate("/dashboard"); // Navigate to dashboard
        } else {
            Swal.fire({
                title: "Login Required",
                text: "Please log in to search services.",
                icon: "info",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK"
            });
           // alert("Please log in to search services.");
        }
    };
    
    // Function to toggle the menu
    /* function toggleMenu() {
        const navLinks = document.querySelector(".nav-link");
        const hamburger = document.querySelector(".hamburger");
        const cross = document.querySelector(".cross");
        // navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
        if (navLinks.style.display === "flex") {
            navLinks.style.display = "none";
            hamburger.style.display = "block";
            cross.style.display = "none";
          } else {
            navLinks.style.display = "flex";
            hamburger.style.display = "none";
            cross.style.display = "block";
          }
    } */

    return(
        <div className="home-body">
    <br />
    <Navbar/>
   {/* <nav>
        <div className="home-logo">
           
            <div className="hamburger" onClick={toggleMenu}>&#9776;</div>
            <div className="cross" onClick={toggleMenu}>&#10005;</div>

            <img src="./img-asset/logo.png" alt="Logo"/>           
            <a href="#" className="title">Handy Homes</a>
        </div>  
        <ul className="nav-link">           
            <li><a href="#home" style={{fontWeight: "bold"}}>Home</a></li>
            <li><a href="#service" style={{fontWeight: "bold"}}>Services</a></li>
            <li><a href="#about" style={{fontWeight: "bold"}}>About us</a></li>      
            <li>
                      <Link to="/userRegister">
                          <input type="button" value="Login / Sign Up" />
                      </Link>           
                </li>   
        </ul>
    </nav>  */}
    <hr/>
    <br/><br/><br/><br/>
    {/* <!-- Section: Home --> */}
    <div id="home" className="home-img">
        <div className="home-con">
            <img src="./img-asset/home_img.png" style={{ float: "right", marginRight: "70px" }} alt="homeImage"/>
            <pre><br/><br/><br/><br/><br/><br/>
                <h1 style={{ textAlign: "center", fontWeight: "bolder", fontFamily: "Georgia, 'Times New Roman', Times, serif", margin: 0, padding: 0 }}>
                    Explore Home <span style={{color:"#8e44ad"}}>Service/Repair</span><br/>&ensp; &emsp; Near you
                </h1>                
            </pre>       
        </div><br/><br/>
        <div className="search-container"  style={{ textAlign: "center", marginTop: "0px" }}>
                <input type="text" className="search-box" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..."  style={{ marginTop: "0" }} />    &emsp;
                <button className="search-button" onClick={handleSearch} style={{ margin: "0" }}>Search</button>
            </div>        
    </div>

    {/* <!-- Section: Services --> */}
    <div className="service">
        <h5 className="service-title">Popular services</h5> 

        <div className="service-row" style={{ display: "flex", justifyContent: "center", gap: "40px" }}>   
                    
            <div className="service-box">
                <br/>
                <img src="./img-asset/paint.png" style={{ width: "50px", height: "auto" }} alt="service"/><br/><br/>
                <h3>Painting</h3>
            </div>

            <div className="service-box">
                <br/>
                <img src="./img-asset/shift.png" style={{ width: "50px", height: "auto" }} alt="service"/><br/><br/>
                <h3>Shifting</h3>
            </div>

            <div className="service-box">
                <br/>
                <img src="./img-asset/carpentry.png" style={{ width: "50px", height: "auto" }} alt="service"/><br/><br/>
                <h3>Carpentry</h3>
            </div>

            <div className="service-box">
                <br/>
                <img src="./img-asset/electric.png" style={{ width: "50px", height: "auto" }} alt="service"/><br/><br/>
                <h3>Electrical</h3>
            </div>

            <div className="service-box">
                <br/>    
                <img src="./img-asset/plumb.png" style={{ width: "73px", height: "auto" }} alt="service"/>
                <h3>Plumbing</h3>
            </div> 

            <div className="service-box">
                <br/>
                <img src="./img-asset/repair.png" style={{ width: "50px", height: "auto" }} alt="service"/><br/><br/>
                <h3>Repair</h3>
            </div>
        </div>
        <br/><br/><br/>
        <div className="service-row" style={{ display: "flex", justifyContent: "center", gap: "40px" }}>     

           <div className="service-box">
                <br/>
                <img src="./img-asset/baby.png" style={{width: "85px", height: "auto"}} alt="service"/><br/><br/>
                <h3>Care Taker</h3>
            </div> 
             <div className="service-box" >
                <br/>
                <img src="./img-asset/clean.png" style={{ width: "50px", height: "auto" }} alt="service"/><br/><br/>
                <h3>Cleaning</h3>
            </div>
            <div className="service-box">
                <br/>    
                <img src="./img-asset/cook.png" style={{ width: "72px", height: "auto" }} alt="service"/>
                <h3>Cooking</h3>
            </div>  
            <div className="service-box">
                <br/>    
                <img src="./img-asset/laundry_iron.png" style={{ width: "78px", height: "auto" }} alt="service"/>
                <h3>Laundry & Ironing</h3>
            </div> 
            <div className="service-box" >
                <br/>    
                <img src="./img-asset/maid.png" style={{ width: "72px", height: "auto" }} alt="service"/>
                <h3>Maid</h3>
            </div> 
            <div className="service-box" >
                <br/>    
                <img src="./img-asset/garderner.png" style={{ width: "72px", height: "auto" }} alt="service"/>
                <h3>Gardern & Lawn Care</h3>
            </div> 

        </div>  
    </div>  

    <br/><br/>

    {/* <!-- Section: About Us --> */}
    <div className="about-section" id="about">
        <h1> About Us </h1>
        <br/>
        <p style={{ fontSize: "25px", textAlign: "justify" }}>
            &emsp; &emsp; &emsp; &emsp; &emsp; &emsp;
            Welcome to <strong>Handy Homes</strong>, your go-to destination for trusted and efficient home maintenance services. 
            Our goal is to make your life easier by bringing professional help for all your home needs right to your doorstep.
        </p>     
        <h2>Who we are?</h2>
        <p style={{ fontSize: "25px", textAlign: "justify" }}>
            &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; 
            We are a team of friendly experts who make home maintenance easy and stress-free. We provide skilled professionals for 
            everything from cleaning and plumbing to electrical repairs and babysitting. At Handy Homes, we focus on giving you 
            high-quality services that fit your needs and make your home a better place.
        </p>
        <h2>Our Vision</h2>
        <p style={{ fontSize: "25px", textAlign: "justify" }}>
            &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; 
            Our vision is to change the way people manage home services by making it simple and easy to connect with 
            trusted professionals. Our goal is to ensure that every home is well-maintained and comfortable, with services 
            that are timely, reliable, and hassle-free.
        </p>

        <h1 className="choose-us">Why Choose Us?</h1>
        <div className="choose-box">
            <div className="choose-item">
                <h3>Trained Professionals</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>All our service providers are skilled and verified.</p>
            </div>
            <div className="choose-item">
                <h3>Fair Prices</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>Enjoy affordable rates with no hidden costs.</p>
            </div>
            <div className="choose-item">
                <h3>Fast & Reliable</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>Book services with ease through our user-friendly online platform anytime, anywhere.</p>
            </div>
            <div className="choose-item">
                <h3>Customer First</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>Your satisfaction is our top priority.</p>
            </div>           

            <div className="choose-item">
                <h3>Wide Range of Services</h3>
                <p  style={{ fontSize: "20px", textAlign: "justify" }}>From basic repairs to specialized tasks, we cover all your needs.</p>
            </div>

            <div className="choose-item">
                <h3>Safe and Secure</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>We prioritize your safety with thorough background checks on our professionals.</p>
            </div>
            
            <div className="choose-item">
                <h3> Highly Rated by Customers</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>Our customers love us, with excellent reviews and feedback for every service we provide.</p>
            </div>

            <div className="choose-item">
                <h3> On-Time Service</h3>
                <p style={{ fontSize: "20px", textAlign: "justify" }}>We value your time, and our professionals arrive on schedule, ensuring your service is completed promptly.</p>
            </div>           
            
        </div>
    </div>
    <br/><br/>
  </div>
    );
}

export default Home;