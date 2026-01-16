import Swal from "sweetalert2";
import axios from "axios";

function BookingPage({ service }) {
  const API_URL = "http://localhost:8080";
  const user_id = sessionStorage.getItem("user_id");

  console.log("Received Service:", service);

  const calculatePrice = () => {
    const emergency = Swal.getHtmlContainer().querySelector("#emergency").checked;
    const basePrice = service.base_price;
    const taxPrice = service.tax_percent;
    const tax = (basePrice * taxPrice) / 100;
    let totalPrice = basePrice + tax;

    if (emergency) {
      totalPrice += 200;
      Swal.getHtmlContainer().querySelector("#emergency_amount").innerText = "200.00";
    } else {
      Swal.getHtmlContainer().querySelector("#emergency_amount").innerText = "0.00";
    }

    Swal.getHtmlContainer().querySelector("#tax_price").innerText = tax.toFixed(2);
    Swal.getHtmlContainer().querySelector("#total_amount").innerText = totalPrice.toFixed(2);
  };

  const checkWalletBalance =async (totalAmount) => {
   try{


        const response = await axios.get(`${API_URL}/user/walletBalance/${user_id}`);

        const walletBalance = response.data.balance;
        console.log("Wallet Balance:"+walletBalance);

         // Check if walletBalance is a valid number
        if (typeof walletBalance !== 'number' || isNaN(walletBalance)) {
          return { hasSufficientBalance: false, walletBalance: 0 }; // Invalid balance
        }

        if (walletBalance >= totalAmount) {
          return{ hasSufficientBalance: true, walletBalance }; // Sufficient balance
        } else {
          return { hasSufficientBalance: false, walletBalance }; // Insufficient balance
        }
   }      
  catch(error) {
    if (error.response && error.response.status === 401) {
      Swal.fire("Error", "Unauthorized access. Please log in again.", "error");
    } 
    else{
      Swal.fire("Error", "Unable to check wallet balance", "error");
      // return false; // Handle errors (e.g., network issues)
    }
    return { hasSufficientBalance: false, walletBalance: 0 }; 
      }
  };
  const showModal = () => {
    Swal.fire({
      title: `Book ${service.service_name}`,
      html: `
        <style>
          .modal-container {
            text-align: left;
            padding: 10px;
            margin-bottom: 20px;
          }
          .modal-label {
            display: inline-block;
            margin-bottom: 8px;
            margin-right:16px;
            font-weight: bold;
            color: #333;
            font-size: 16px;
          }
           .modal-label + .switch {
                display: inline-flex; /* Flexbox for inline alignment */
                align-items: center; /* Vertically center-align the label and slider */
                gap: 10px; /* Add space between the label and the slider */
            }
          .modal-input {
            width: 100%;
            padding: 10px;
            margin-bottom: 12px;
            border: 1px solid #ccc;
            border-radius: 10px;
            outline: none;
            transition: all 0.3s ease;
            font-size: 14px;
          }
          .modal-input:focus {
            border: 1px solid #6c63ff;
            box-shadow: 0 0 10px rgba(108, 99, 255, 0.5);
          }
          .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 25px;
            margin-bottom: 10px;
          }
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .slider {
            position: absolute;
            cursor: pointer;
            top: 2px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 25px;
          }
            .slider:before {
                position: absolute;
                content: "";
                height: 19px; /* Slightly smaller than slider height */
                width: 19px;
                left: 3px; /* Spacing from the left */
                bottom: 3px; /* Spacing from the bottom */
                background-color: white;
                transition: 0.4s;
                border-radius: 50%; /* Fully rounded handle */
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow for the handle */
            }

          .switch input:checked + .slider {
            background-color: #6c63ff;
            box-shadow: 0 0 10px rgba(108, 99, 255, 0.6);
          }

          input:checked + .slider:before {
  transform: translateX(25px); /* Move the handle to the right */
}
          .slider.round {
            border-radius: 25px;
          }
          .modal-price-details {
            margin-top: 16px;
            font-size: 16px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 10px;
            background: #f9f9f9;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

           /* display: grid;
            grid-template-columns: 1fr auto; 
            column-gap: 20px; 
            align-items: center;  */
          }

            .price-item {
            display: flex; /* Use flexbox for alignment */
            justify-content: space-between; /* Space between label and value */
            padding: 4px 0; /* Add some vertical spacing */
            }

            .price-item .label {
            color: #444;
            flex: 1; /* Takes up remaining space to push value to the right */
            text-align: left;
            }

            .price-item .value {
            color: black;
            text-align: right;
            }
          .modal-price-details b {
                display: inline;
                margin-right: 6px; /* Add some spacing if needed */
                color: #444;
                text-align:left;
            }

            .modal-price-details span {
                color:black;
                text-align: right; 
            }
            #total_amount{
                font-weight:bold;    
            }
          .swal2-confirm {
            background-color: #6c63ff !important;
            color: white !important;
            padding: 10px 20px !important;
            border-radius: 10px !important;
            transition: 0.3s !important;
          }
          .swal2-confirm:hover {
            background-color: #5548d3 !important;
            box-shadow: 0 0 10px rgba(108, 99, 255, 0.6) !important;
          }
          .modal-label-emg{
            margin-bottom:10px;
            font-weight: bold;
            color: #333;
            font-size: 16px;
          }
        </style>
        <div class="modal-container">
          <label class="modal-label">Service Date:</label>
          <input type="date" id="service_date" class="modal-input" min="${new Date().toISOString().split("T")[0]}"/><br/>
  
          <label class="modal-label">Service Time:</label>
          <input type="time" id="service_time" class="modal-input"/><br/>
  
          <label class="modal-label-emg">Emergency Service:</label>
          &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
          <label class="switch">
            <input type="checkbox" id="emergency"/>
            <span class="slider round"></span>
          </label><br/>
  
          <div class="modal-price-details">
            <div class="price-item">
                    <span class="label">Service Price:</span>
                    <span class="value">₹${service.base_price.toFixed(2)}</span>
            </div>
            <div class="price-item">
                    <span class="label">Tax Included:</span>₹
                    <span class="value" id="tax_price"></span>
            </div>
            <div class="price-item">
                    <span class="label">Emergency Service Price:</span>₹
                    <span class="value" id="emergency_amount"></span>
            </div>
            <hr style="border: none; border-top: 1px dashed #888; margin: 8px 0;">
            <div class="price-item">
                    <span class="label">Total Amount:</span> <b style="color:black;">₹</b>
                    <span class="value" id="total_amount"></span>
            </div>
          </div>
          
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Book Now",
      didOpen: () => {
        // Swal.getHtmlContainer().querySelector("#emergency").onclick = calculatePrice;
        const emergencyCheckbox = Swal.getHtmlContainer().querySelector("#emergency");
        const serviceDateInput = Swal.getHtmlContainer().querySelector("#service_date");
        const serviceTimeInput = Swal.getHtmlContainer().querySelector("#service_time");

        const clearValidationMessage = () => {
          Swal.resetValidationMessage(); // This removes the validation message
        };

        calculatePrice();

        emergencyCheckbox.addEventListener("change", () => {
          if (emergencyCheckbox.checked) {
              calculatePrice();
              const today = new Date().toISOString().split("T")[0]; // Get today's date
              serviceDateInput.value = today; // Set service date to today
              serviceDateInput.disabled = true; // Disable date input
  
              // Restrict time picker for emergency booking (at least 15 mins from now)
              const now = new Date();
              let minHour = now.getHours();
              let minMinute = now.getMinutes() + 15; 
  
              if (minMinute >= 60) {
                  minHour += 1;
                  minMinute -= 60;
              }
  
              const minTime = `${String(minHour).padStart(2, "0")}:${String(minMinute).padStart(2, "0")}`;
              serviceTimeInput.min = minTime; // Set min time restriction

              if (emergencyCheckbox.checked && serviceTimeInput.value < minTime) {
                Swal.showValidationMessage("⚠️ Emergency bookings must be at least 1 hour from now.");
               // return false;
              } 
              
          } else {
              serviceDateInput.disabled = false; // Enable date selection again
              serviceTimeInput.min = ""; // Remove time restriction
              clearValidationMessage(); 
          }
      });

      serviceTimeInput.addEventListener("input", () => {
        if (!emergencyCheckbox.checked) {
            clearValidationMessage(); // ✅ Remove error if emergency is off
            return;
        }

        const now = new Date();
        let minHour = now.getHours();
        let minMinute = now.getMinutes() + 15;

        if (minMinute >= 60) {
            minHour += 1;
            minMinute -= 60;
        }

        const minTime = `${String(minHour).padStart(2, "0")}:${String(minMinute).padStart(2, "0")}`;

        if (serviceTimeInput.value >= minTime) {
            clearValidationMessage(); // ✅ Remove error if valid time is selected
        } else {
            Swal.showValidationMessage("⚠️ Emergency bookings must be at least 1 hour from now.");
        }
    });
    
      emergencyCheckbox.onclick = calculatePrice;
      },
      preConfirm: () => {
        const service_date = Swal.getHtmlContainer().querySelector("#service_date").value;
        const service_time = Swal.getHtmlContainer().querySelector("#service_time").value;
        const emergency = Swal.getHtmlContainer().querySelector("#emergency").checked;
        const totalAmount = Swal.getHtmlContainer().querySelector("#total_amount").innerText;
  
        if (!service_date || !service_time) {
          Swal.showValidationMessage("⚠️ Please fill all fields");
          return false;
        }

        let formattedDate, formattedTime;
        try {
            formattedDate = new Date(service_date).toISOString().slice(0, 10); // YYYY-MM-DD
            formattedTime = service_time + ":00"; // Add seconds
        } catch (error) {
            Swal.showValidationMessage("⚠️ Invalid date or time");
            return false;
        }

        if (emergency) {
          const now = new Date();
          let minHour = now.getHours();
          let minMinute = now.getMinutes() + 15;
  
          if (minMinute >= 60) {
              minHour += 1;
              minMinute -= 60;
          }
  
          const minTime = `${String(minHour).padStart(2, "0")}:${String(minMinute).padStart(2, "0")}`;
          
          if (service_time < minTime) {
              Swal.showValidationMessage("⚠️ Emergency bookings must be at least 1 hour from now.");
              return false;
          }
      }
  
        console.log("Booking Data:", {
          user_id: user_id,
          service_id: service.service_id,
          service_date: formattedDate,
          service_time: formattedTime,
          emergency,
          totalAmount
      });
      
       // Check wallet balance before proceeding
       return checkWalletBalance(totalAmount).then(({hasSufficientBalance,walletBalance}) => {
        if (!hasSufficientBalance) {
          if (walletBalance !== undefined) {
            Swal.fire(
              "Insufficient Wallet Balance",
              `<center> Wallet balance is <strong> Rs. ${walletBalance.toFixed(2)} </strong><br><br>.
               You do not have enough funds for this booking.`,
              "error"
            );
          } else {
            Swal.fire("Error", "Failed to retrieve wallet balance.", "error");
          }
         
          return false;
        }
        
        return { 
            user_id: user_id, // 🔥 Added
            service_id: service.service_id, // 🔥 Added
            service_date: formattedDate,
            service_time: formattedTime,
            emergency,
            totalAmount,
        };

        // return { service_date, service_time, emergency, totalAmount };
      });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { service_date, service_time, emergency, totalAmount } = result.value;
  
        console.log("Sending Data:", {
          user_id: result.value.user_id,
          service_id: result.value.service_id,
          service_date: result.value.service_date,
          service_time: result.value.service_time,
          total_price: parseFloat(result.value.totalAmount),
          emergency: emergency ? 1 : 0
      });
      
        axios
          .post(`${API_URL}/user/ServiceBooking`, {
            user_id: result.value.user_id,
            service_id: result.value.service_id,
            service_date: result.value.service_date,
            service_time: result.value.service_time,
            total_price: parseFloat(result.value.totalAmount),
            emergency: emergency ? 1 : 0,
          })
          .then((response) => {
            console.log(response.data);
            if (response.data.success) {
                  Swal.fire({
                      icon: "success",
                      title: "Booking Successful",
                      text: `Total Amount: ₹${totalAmount}`,
                      timer: 7000, // 3 Seconds
                      timerProgressBar: true,
                      customClass: {
                        popup: "custom-swal-popup", 
                        timerProgressBar: "custom-progress-bar" // This class will style the progress bar
                      }
                    }).then(() => {
                      Swal.close();
                    });
                // Swal.fire("✅ Booking Successful", `Total Amount: ₹${totalAmount}`, "success").then(()=>{
                //     window.location.reload(); 
                // });
            }
          })
          .catch(() => {
            Swal.fire("Booking Failed", "Please try again later", "error");
          });
      }
    });
  };
  

  return { showModal };
}

export default BookingPage;
