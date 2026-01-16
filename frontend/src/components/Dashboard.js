import React,{useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import BookingPage from "./BookingPage";
import "./Dashboard.css";
import Navbar from "./Navbar";

function Dashboard() {
    const user = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("user_id");
    const API_URL="http://localhost:8080";

    const [services, setServices] = useState([]);
    const [categoryHeading, setCategoryHeading] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState(null); // Store selected service ID

   // const [showProfileMenu, setShowProfileMenu] = useState(false);
   
    useEffect(() => {
      let searchedCategory = sessionStorage.getItem("searchedCategory");

      if (searchedCategory) {
          searchedCategory = searchedCategory.trim();
          setSelectedCategory(searchedCategory);
          fetchServices(searchedCategory); // Fetch services based on the searched category
          sessionStorage.removeItem("searchedCategory"); // Clear it after use
      }
  }, []); 

    const fetchServices = async (category) => {
      try {
        setCategoryHeading(category); // Set the category heading when clicked
        setSelectedCategory(category); 
        setIsFirstLoad(false);
        const response = await axios.get(`${API_URL}/user/services/${category}`);
        console.log("Fetched Services:", response.data);

        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services", error);
      }
    };

     const bookService = (service) => {
          const booking = new BookingPage({service});
          booking.showModal();
        };

      
        const openReviewModal = async (serviceId) => {
          setSelectedServiceId(serviceId);
        
          try {
            const serviceReviews = await fetchServiceReviews(serviceId); // wait for data
        
            Swal.fire({
              title: "Drop your Review Here",
              html: `
                <div>
                          <!-- Close button (cross symbol) -->
                    <button id="closeModalBtn" style="position: absolute; top: 10px; right: 10px; 
                                  font-size: 36px; background: none; border: none; cursor: pointer;">×</button>
                    <div id="ratingStars" style="display: flex; cursor: pointer; margin-bottom: 10px;">
                      ${[1, 2, 3, 4, 5].map((star) => `
                        <span id="star${star}" class="star" data-value="${star}">&#9733;</span>
                      `).join('')}
                    </div>
                    <textarea id="comment" placeholder="Write your review..." rows="4" style="width: 100%;"></textarea>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: "Submit Review",
              cancelButtonText: "Cancel",
              preConfirm: async () => {
               // const rating = parseInt(document.querySelector(".star.selected")?.dataset.value);
               const selectedStars = document.querySelectorAll(".star.selected");
               const rating = selectedStars.length; // count how many stars selected
                const comment = document.getElementById("comment").value.trim();
        
                console.log("Selected rating is:", rating);

                if (!rating || !comment) {
                  Swal.showValidationMessage("Please provide a rating and a comment");
                } else {
                  setRating(rating);
                  setComment(comment);
                  await handleReviewSubmit(serviceId,rating,comment);
        
                  // Reload modal to show updated reviews
                  setTimeout(() => {
                    openReviewModal(serviceId);
                  }, 500);
                }
              },
              didOpen: () => {
                // Close button event
                document.getElementById('closeModalBtn').addEventListener('click', () => {
                  Swal.close();
                });

                document.querySelectorAll("#ratingStars .star").forEach((star) => {
                  star.addEventListener("click", () => {
                    const selectedValue = parseInt(star.dataset.value);
                    setRating(selectedValue);

                    document.querySelectorAll(".star").forEach((el) => el.classList.remove("selected"));
                    for (let i = 1; i <= selectedValue; i++) {
                      document.getElementById(`star${i}`).classList.add("selected");
                    }
                  });
                });
              },
              didRender: () => {
                const reviewsContainer = document.createElement("div");
                reviewsContainer.id = "reviews";
                reviewsContainer.style.maxHeight = "200px";
                reviewsContainer.style.overflowY = "auto";
                reviewsContainer.style.marginTop = "20px";
                reviewsContainer.style.borderTop = "1px solid #ccc";
                reviewsContainer.style.paddingTop = "10px";
                reviewsContainer.style.marginLeft="20px"
                reviewsContainer.innerHTML = `
                    
                  ${
                    serviceReviews.length > 0
                      ? serviceReviews.map((review) =>{
                        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
                        return `
                            <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                              <div style="display: flex; justify-content: space-between;">
                                <strong>${review.user_name}</strong>
                                <span style="color: #f39c12;margin-right:10px;">${stars}</span>
                              </div>
                              <div>${review.comment}</div>
                            </div>
                        `;
                      }).join('')
                      : "<p>No reviews yet.</p>"
                  }
                `;
                Swal.getActions().after(reviewsContainer);
              }

            });
        
          } catch (error) {
            console.error("Failed to load reviews:", error);
            Swal.fire("Error", "Failed to load reviews", "error");
          }
        };
        
        const handleReviewSubmit = async (selectedServiceId,rating,comment) => {
          try {
            const response = await axios.post(`${API_URL}/postReview/${userId}`, {
              service_id: selectedServiceId,
              rating: parseInt(rating),
              comment: comment.trim(),
            });
            Swal.fire({
              icon: "success",
              title: "Review Submitted",
              text: "Thank you for your feedback!",
              showConfirmButton: false,
              timer: 3000,
            });
            setComment(""); // Reset comment after submitting
            setRating(0); // Reset rating after submitting
            // fetchServiceReviews(); Refresh reviews after submission
          } catch (error) {
            console.error("Error submitting review",  error.response?.data || error.message);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to submit review. Please try again.",
              showConfirmButton: false,
              timer: 3000, // Display for 3 seconds
            });
          }
        };

      
        const fetchServiceReviews = async (serviceId) => {
          try {
            const response = await axios.get(`${API_URL}/getReview/${serviceId}`);
            return response.data; // returns array of reviews for that service
          } catch (error) {
            console.error("Error fetching reviews", error);
            return [];
          }
        };

  return (
    <div className="dash-body">
      <br />
      <Navbar/>
      <hr />
      <br /><br /><br /><br />
     
      {/* Side bar */}
      <header>
        <br/>
        <h2 style={{ marginLeft: "135px",marginTop:"50px", color: "#570a8a" , fontFamily: 'Times New Roman, Times, serif'}}>Categories</h2>
      </header>
      
      <div className="dash-container"> 
                <div className="sidebar">
                <br /> 
                    <div className={`category ${selectedCategory.toLowerCase() === "painting" ? "active-category" : ""}`}  
                         onClick={() =>{fetchServices("Painting"); setSelectedCategory("Painting"); }}>
                                              
                        &ensp;
                        <img src="./img-asset/paint.png" alt="Painting" />
                        &emsp;
                        <span>Painting</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "shifting" ? "active-category" : ""}`} 
                         onClick={() =>{ fetchServices("Shifting");setSelectedCategory("Shifting");}}>
                        &ensp;
                        <img src="./img-asset/shift.png" alt="Shifting" />
                        &emsp;
                        <span>Shifting</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase()  === "carpentry" ? "active-category" : ""}`} 
                        onClick={() => {fetchServices("Carpentry");setSelectedCategory("Carpentry");}}>
                        &ensp;
                        <img src="./img-asset/carpentry.png" alt="Carpentry" />
                        &emsp;
                        <span>Carpentry</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "electrical" ? "active-category" : ""}`}
                          onClick={() => {fetchServices("Electrical");setSelectedCategory("Electrical");}}>
                        &ensp;
                        <img src="./img-asset/electric.png" alt="Electric" />
                        &emsp;
                        <span>Electrical</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "plumbing" ? "active-category" : ""}`} 
                          onClick={() => {fetchServices("Plumbing");setSelectedCategory("Plumbing");}}>
                        &ensp;
                        <img src="./img-asset/plumb.png" alt="Plumbing" />
                        &emsp;
                        <span>Plumbing</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "repair" ? "active-category" : ""}`} 
                          onClick={() => {fetchServices("Repair");setSelectedCategory("Repair");}}>
                        &ensp;
                        <img src="./img-asset/repair.png" alt="Repair" />
                        &emsp;
                        <span>Repair</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "cleaning" ? "active-category" : ""}`} 
                          onClick={() => {fetchServices("Cleaning");setSelectedCategory("Cleaning");}}>
                        &ensp;
                        <img src="./img-asset/clean.png" alt="Cleaning" />
                        &emsp;
                        <span>Cleaning</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "cooking" ? "active-category" : ""}`} 
                          onClick={() => {fetchServices("Cooking");setSelectedCategory("Cooking");}}>
                        &ensp;
                        <img src="./img-asset/cook.png" alt="Cooking" />
                        &emsp;
                        <span>Cooking</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "laundryironing" ? "active-category" : ""}`} 
                          onClick={() => {fetchServices("LaundryIroning");setSelectedCategory("LaundryIroning");}}>
                        &ensp;
                        <img src="./img-asset/laundry_iron.png" alt="Laundry & Ironing" />
                        &emsp;
                        <span>Laundry & Ironing</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "maid" ? "active-category" : ""}`} 
                          onClick={() => {fetchServices("Maid");setSelectedCategory("Maid");}}>
                        &ensp;
                        <img src="./img-asset/maid.png" alt="Maid" />
                        &emsp;
                        <span>Maid</span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "caretaker" ? "active-category" : ""}`} 
                          onClick={() =>{ fetchServices("CareTaker");setSelectedCategory("CareTaker");}}>
                        &ensp;
                        <img src="./img-asset/baby.png" alt="Care Taker" />
                        &emsp;
                        <span>Care Taker </span>
                    </div>
                    <div className={`category ${selectedCategory.toLowerCase() === "gardening" ? "active-category" : ""}`} 
                         onClick={() => {fetchServices("Gardening");setSelectedCategory("Gardening");}}>
                        &ensp;
                        <img src="./img-asset/garderner.png" alt="Garden & Lawn Care" />
                        &emsp;
                        <span>Garden & Lawn Care</span>
                    </div>
                <br /><br />          
                </div>     
                {/* {categoryHeading && <h2 className="category-heading">{categoryHeading}</h2>}         */}
        {/* Center Content */}
        <div className="center-container">  
            {isFirstLoad ? (
                    <h3>Select the services You need</h3>
                ) :     services.length > 0 ? (
                        services.map((service, index) => (
                                
                                <div key={index} className="content-container">
                                    
                                    <div className="text-content">    
                                        <h3>{service.service_name}</h3> 
                                        <p className="desc">{service.description}</p>
                                        {/* <p className="price">{parseFloat(service.base_price).toFixed(2)}</p> */}
                                        <p className="price">₹{service.base_price} </p> <br/>
                                        
                                        <button className="book-now-btn" onClick={()=>bookService(service)}>Book Now</button>
                                        <br/> <br/>
                                        {/* Add Review button */}
                                        <a href="#" className="review-btn" onClick={() => openReviewModal(service.service_id)}>
                                          Write a Review
                                        </a>

                                    </div>

                                    <img src={`http://localhost:8080/imgAsset/${service.image}`} 
                                                            alt={service.service_name} />
                                 </div>                                   
                        ))
                    ) : (
                            <h3>Service not found</h3>
                )}
        </div>
      </div>
      <br /><br /><br /><br />
    </div>
  );
}

export default Dashboard;
