const express = require("express");
const router = express.Router();
const con = require("./db");
const moment = require('moment');
const authMiddleware = require("./verifyToken");
const {sendBookingConfirmationEmail} = require('./emailService'); 


// Fetch services by category
router.get("/services/:category", (req, res) => {
    const category = req.params.category;
    const sql = "SELECT service_id,service_name,image,description,base_price,category,tax_percent FROM service WHERE category=?";
    
    con.query(sql, [category], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Database error" });
      } else {
                if (result.length > 0) {
                    res.json(result);
                } else {
                    res.json({ message: "No services found" });
            }
      }
    });
  });


router.post("/ServiceBooking", (req, res) => {
    const { user_id, service_id, service_date, service_time, total_price, emergency } = req.body;
  
    if (!user_id || !service_id || !service_date || !service_time || total_price === undefined) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
  
    const bookingQuery = `INSERT INTO booking (user_id, service_id, service_date, service_time, total_price, emergency) VALUES (?, ?, ?, ?, ?, ?)`;
  
    con.query(bookingQuery, [user_id, service_id, service_date, service_time, total_price, emergency], (err, bookingResult) => {
      if (err) {
        console.error("Booking Error:", err);
        return res.status(500).json({ message: "Booking failed. Please try again." });
      }
  
      const booking_id = bookingResult.insertId;
  
      const serviceRequestQry = `INSERT INTO service_request (booking_id, emergency) VALUES (?, ?)`;
  
      con.query(serviceRequestQry, [booking_id, emergency], (err, requestResult) => {
        if (err) {
          console.error("Service Request Error:", err);
          return res.status(500).json({ message: "Service request creation failed." });
        }
  
        // Now fetch user email & service/category details for email
        const userQuery = "SELECT user_name, email FROM users WHERE user_id = ?";
        con.query(userQuery, [user_id], (err, userRows) => {
          if (err || userRows.length === 0) {
            console.error("User fetch error:", err);
            return res.status(500).json({ message: "User not found" });
          }
  
          const { email } = userRows[0];
  
          const serviceQuery = `
           SELECT service_name, category FROM service WHERE service_id = ?`;
  
          con.query(serviceQuery, [service_id], (err, serviceRows) => {
            if (err || serviceRows.length === 0) {
              console.error("Service fetch error:", err);
              return res.status(500).json({ message: "Service not found" });
            }
  
            const { service_name, category } = serviceRows[0];
  
             // Format service_date and service_time
             const formattedDate = moment(service_date).format("DD-MM-YYYY");
             const formattedTime = moment(service_time, "HH:mm:ss").format("hh:mm A"); // 12-hour format with AM/PM

            // Prepare bookingDetails for email
            const bookingDetails = {
              booking_id,
              service_name,
              category,
              service_date:formattedDate,
              service_time:formattedTime,
              total_price,
              emergency
            };
  
            // Call the email function
            sendBookingConfirmationEmail(email, bookingDetails)
              .then(() => {
                res.status(200).json({ success: true, message: "Booking successful and email sent" });
              })
              .catch((emailErr) => {
                console.error("Email Error:", emailErr);
                res.status(200).json({ success: true, message: "Booking successful but email failed" });
              });
          });
        });
      });
    });
  });
  

// Fetch booking history for a specific user
router.get("/booking-history/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const query = `
            SELECT 
                b.booking_id, 
                s.service_name, 
                COALESCE(p.provider_name, 'Not Assigned') AS provider_name, 
                p.provider_id,
                b.booking_date, 
                b.service_date, 
                b.service_time, 
                b.total_price, 
                b.booking_status, 
                b.payment_status,
                COALESCE(b.cancel_reason, '') AS cancel_reason
            FROM booking b
            LEFT JOIN service s ON b.service_id = s.service_id
            LEFT JOIN provider p ON b.provider_id = p.provider_id
            WHERE b.user_id = ? 
            ORDER BY b.booking_date DESC`;

        con.query(query, [userId], (err, results) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database Error" });
            }
            res.json(results);
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/bookings-by-date/:user_id", async (req, res) => {
    const { fromDate, toDate } = req.query;
    const { user_id } = req.params;

    if(!user_id){
        return res.status(400).json({ error: "User ID required." });
    }
    if (!fromDate || !toDate) {
        return res.status(400).json({ error: "Both dates are required." });
    }

    try {
        const query = `
            SELECT b.booking_id, u.user_name, s.service_name, p.provider_name, b.booking_date, 
                   b.service_date, b.service_time, b.total_price, b.booking_status, b.cancel_reason 
            FROM booking b
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN service s ON b.service_id = s.service_id
            LEFT JOIN provider p ON b.provider_id = p.provider_id
            WHERE b.user_id = ? AND DATE(b.booking_date) BETWEEN DATE(?) AND DATE(?)`;

            con.query(query, [user_id,fromDate, toDate], (err, results) => {
                if (err) {
                    console.error('Error fetching bookings by date:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json(results);
            });
    } catch (error) {
        console.error("Error fetching bookings by date:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/cancel-booking/:bookingId", (req, res) => {
    const { bookingId } = req.params;
    const { cancelReason } = req.body;

    if (!cancelReason) {
        return res.status(400).json({ success: false, message: "Cancellation reason is required." });
    }

    const query = `UPDATE booking SET booking_status = 'Cancelled',cancel_reason = ? WHERE booking_id = ? AND booking_status NOT IN ('Completed', 'Cancelled')`;
    const updateReqQry = `UPDATE service_request SET request_status = 'Cancelled' WHERE booking_id = ? AND request_status NOT IN ('Completed', 'Cancelled')`;
    con.query(query, [cancelReason,bookingId], (err, result) => {
        if (err) {
            console.error("Error cancelling booking:", err);
            return res.status(500).json({ success: false, message: "Server error." });
        }
        
        if (result.affectedRows > 0) {
            con.query(updateReqQry, [bookingId], (reqErr, reqResult) => {
                if (reqErr) {
                    console.error("Error updating service request:", reqErr);
                    return res.status(500).json({ success: false, message: "Booking cancelled, but failed to update service request." });
                }
            
            return res.json({ success: true, message: "Booking request cancelled successfully." });
            });
        } else {
            return res.status(400).json({ success: false, message: "Cannot cancel this booking." });
        }
    });
});

router.get("/profile",authMiddleware,(req,res)=>{
    const userId = req.user.id;
    //console.log("User ID:"+userId);

    const qry = `SELECT user_name AS name, email, phone_number AS phone, address,city, state, pincode FROM users WHERE user_id=?`;
    con.query(qry,[userId],(err,result)=>{
        if(err){
            console.error("Error fetching customer Profile:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.length > 0) {
            res.json(result[0]); // Send first row containing user details
        } else {
            res.status(404).json({ error: "User profile not found" });
        }
    })
});

router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from authentication middleware
        const { name, phone, address, city, state, pincode } = req.body;

        // Update user details in the database
        const updateQuery = `
            UPDATE users 
            SET user_name = ?, phone_number = ?, address = ?, city = ?, state = ?, pincode = ? 
            WHERE user_id = ?
        `;

        const values = [name,phone, address, city, state, pincode, userId];

        con.query(updateQuery, values, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database update failed" });
            }
            return res.status(200).json({ message: "Profile updated successfully" });
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Backend - Express.js example
router.get('/walletBalance/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // Fetch user wallet balance from the database
    con.query('SELECT balance FROM wallet WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        res.status(500).json({ message: 'Error fetching wallet balance' });
        return;
      }
       // Check if the user has a wallet entry
       if (results.length === 0) {
        return res.status(404).json({ message: 'Wallet not found for this user' });
    }

      res.json({ balance: results[0].balance });
    });
  });
  
router.put("/updateWallet/:userId", async (req, res) => {
    const userId = req.params.userId;  // Get the userId from URL parameters
    const { amount } = req.body;  // Get the amount from request body

    // Validate the input
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    try {
        // Update the wallet balance in the database
        await con.query("UPDATE wallet SET balance = balance + ? WHERE user_id = ?", [amount, userId]);

        // Send a success response
        res.status(200).json({ message: "Wallet Recharged Successfully" });
    } catch (err) {
        console.error(err);
        // Send an error response in case of failure
        res.status(500).json({ message: "Something went wrong" });
    }
});





/* Customer requests a service
router.post("/requestService", (req, res) => {
    const { name, email, service } = req.body;

    const getUserID = "SELECT user_id FROM users WHERE user_name = ? AND email = ?";
    con.query(getUserID, [name, email], (err, userResult) => {
        if (err) 
            return res.status(500).json({ error: err.message });
        if (userResult.length === 0) 
            return res.status(400).json({ error: "User not found" });
        
        const user_id = userResult[0].user_id;

        // Fetch service_id using service_name
        const serviceQuery = "SELECT service_id FROM service WHERE service_name = ?";
        con.query(serviceQuery, [service], (err, serviceResults) => {
            if (err) 
                return res.status(500).json({ error: err.message });
            if (serviceResults.length === 0) 
                return res.status(400).json({ error: "Service not found" });

        const service_id = serviceResults[0].service_id;

         // Insert service request
         const request = "INSERT INTO service_requests (user_id, service_id) VALUES (?, ?)";
         con.query(request, [user_id, service_id], (err, result) => {
             if (err) 
                return res.status(500).json({ error: err.message });
             res.json({ message: "Service request submitted", request_id: result.insertId });
         });

        });
    });
}); */

router.post('/booking', async (req, res) => {
    const { user_id, service_id, service_date, service_time, emergency } = req.body;

    try {
        // Step 1: Fetch the base price and tax percentage from the `service` table
        const query = 'SELECT base_price, tax_percent FROM service WHERE service_id = ?';
        const [serviceData] = await new Promise((resolve, reject) => {
            con.query(query, [service_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        console.log(serviceData);
        if (!serviceData || serviceData.length === 0) {
            console.error('Service not found for service_id:', service_id);  // Log for debugging
            return res.status(404).json({ message: 'Service not found' });
        }
        
        const base_price= serviceData[0].base_price;
        const tax_percent = serviceData[0].tax_percent;

        console.log(base_price + " "+ tax_percent);
        // Step 2: Calculate total price
        let tax = (base_price * tax_percent) / 100; // Calculate tax
        let total_price = base_price + tax; // Base price + tax

        if (emergency) {
            total_price += 200; // Add ₹200 if emergency service is selected
        }

        // Step 3: Prepare the booking data
        const bookingData = {
            user_id,
            service_id,
            service_date,
            service_time,
            total_price,
            emergency: emergency ? 1 : 0, // Convert true/false to 1/0 for emergency flag
        };
        console.log('Booking data:', bookingData); 
        // Step 4: Insert the booking into the database (booking_date will be set automatically by MySQL)
        const insertQuery = 'INSERT INTO booking SET ?';
        const bookingResult = await new Promise((resolve, reject) => {
            con.query(insertQuery, bookingData, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        console.log('Booking inserted with ID:', bookingResult.insertId); 
        // Step 5: Insert the service request into the `service_request` table
        const serviceRequestData = {
            user_id,
            service_id,
            emergency
        };

        const serviceRequestQuery = 'INSERT INTO service_request SET ?';
        const serviceRequestResult = await new Promise((resolve, reject) => {
            con.query(serviceRequestQuery, serviceRequestData, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Step 6: Return success response
        return res.status(201).json({
            message: 'Booking and service request created successfully',
            booking_id: bookingResult.insertId,
            service_request_id: serviceRequestResult.insertId,  // Include service request ID
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating booking or service request' });
    }
});

module.exports = router;
