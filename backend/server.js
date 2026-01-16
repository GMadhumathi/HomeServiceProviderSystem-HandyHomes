const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const con = require('./db');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const {sendProviderDetailsEmail,sendFeedbackEmail} = require('./emailService');

require('dotenv').config();

const adminRoute = require('./adminRoute');
const userRoute = require('./customerRoute');
const providerRoute = require('./providerRoute');
const BookSMS = require("./BookSMS");
const payment = require('./RazorPayment');


const app=express();

// Middleware to parse URL-encoded data (form submissions)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/imgAsset", express.static("imgAsset"));

app.use("/admin",adminRoute);
app.use("/user",userRoute);
app.use("/provider",providerRoute);
app.use("/sms",BookSMS);
app.use("/pay",payment);

app.get('/',(req,res)=>{
    //res.sendFile(path.join(__dirname+"/customerRegister.html"));
    //res.sendFile(path.join(__dirname+"/ProviderRegister.html"));
    res.send("Welcome");
});

app.post('/login', (req, res) => {
    const {role,email, password } = req.body;
    //let table, idColumn, nameColumn;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if(role==="customer"){
        const sql =`SELECT user_id,user_name,password,email FROM users WHERE email = ?`;

        con.query(sql, [email], async (err, results) => {
            if (err) 
                return res.status(500).send("Server Error");
        
            if (results.length === 0) 
                return res.status(401).json({ status: "failed", error: "Invalid credentials" });

            const user = results[0];

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) 
                return res.status(401).json({ status: "failed", error: "Invalid credentials" });

            // Generate JWT token
            const token = jwt.sign({ id:user.user_id, role:'customer'}, process.env.SECRET_KEY, { expiresIn: "1h" });
            // console.log("SECRET_KEY:", process.env.SECRET_KEY);


            // Insert login record into log table with Name
            const logSql = `INSERT INTO log (logged_id, name,login_time) VALUES (?, ?, NOW())`;
            con.query(logSql, [user.user_id, user.user_name], (logErr) => {
                if (logErr) {
                    console.error("Log entry failed:", logErr);
                }
            });

            res.json({ status: "success", message: "Login successful", token ,username: user.user_name,user_id: user.user_id,userEmail: user.email, role:"customer" });
        });
    }
    else if (role === "admin") {
        const adminSql = `SELECT admin_id, admin_name, password, email FROM admin WHERE email = ?`;

        con.query(adminSql, [email], async (err, results) => {
            if (err) return res.status(500).send("Server Error");
            if (results.length === 0) {
                return res.status(401).json({ status: "failed", error: "Invalid credentials" });
            }

            const admin = results[0];
            const validPassword = await bcrypt.compare(password, admin.password);
            if (!validPassword) {
                return res.status(401).json({ status: "failed", error: "Invalid credentials" });
            }

            const token = jwt.sign({ id: admin.admin_id, role: 'admin' }, process.env.SECRET_KEY, { expiresIn: "1h" });

            /* const logSql = `INSERT INTO log (logged_id, name, login_time) VALUES (?, ?, NOW())`;
            con.query(logSql, [admin.admin_id, admin.admin_name], (logErr) => {
                if (logErr) console.error("Log entry failed:", logErr);
            }); */

            return res.json({
                status: "success",
                message: "Admin login successful",
                token,
                username: admin.admin_name,
                user_id: admin.admin_id,
                userEmail: admin.email,
                role: "admin"
            });
        });

    } else {
        return res.status(400).json({ status: "failed", error: "Invalid role" });
    }
});

/*app.post('/login', (req, res) => {
    const {email, password } = req.body;
    //let table, idColumn, nameColumn;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql =`SELECT user_id,user_name,password,email FROM users WHERE email = ?`;

    con.query(sql, [email], async (err, results) => {
        if (err) 
            return res.status(500).send("Server Error");
       
        if (results.length === 0) 
            return res.status(401).json({ status: "failed", error: "Invalid credentials" });

        const user = results[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) 
            return res.status(401).json({ status: "failed", error: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id:user.user_id}, process.env.SECRET_KEY, { expiresIn: "1h" });
        // console.log("SECRET_KEY:", process.env.SECRET_KEY);


        // Insert login record into log table with Name
        const logSql = `INSERT INTO log (logged_id, name,login_time) VALUES (?, ?, NOW())`;
        con.query(logSql, [user.user_id, user.user_name], (logErr) => {
            if (logErr) {
                console.error("Log entry failed:", logErr);
            }
        });

        res.json({ status: "success", message: "Login successful", token ,username: user.user_name,user_id: user.user_id,userEmail: user.email });
    });
}); */

app.put("/reset-password", async (req, res) => {
    const { email,password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required" });
    }

    try {
        con.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

        // **Hash the new password**
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) return res.status(500).json({ error: "Error hashing password" });

            // Update password in the database
            con.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (updateErr, updateResult) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });

                if (updateResult.affectedRows === 0) {
                    return res.status(400).json({ error: "Password reset failed" });
                }

                res.status(200).json({ status: "success", message: "Password reset successfully" });
            });
        });
    });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    //console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token required for logout" });
    }

    const token = authHeader.split(" ")[1];
   // console.log("Extracted Token:", token);

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        // console.log("SECRET_KEY:", process.env.SECRET_KEY);
        // console.log("Decoded Token:", decoded);


        const userId = decoded.id; // Extract user ID from token

        // Update logout time in log table
        const logSql = `UPDATE log SET logout_time = NOW() WHERE logged_id = ? ORDER BY login_time DESC LIMIT 1`;
        con.query(logSql, [userId], (logErr) => {
            if (logErr) {
                console.error("Logout log entry failed:", logErr);
                return res.status(500).json({ message: "Logout logging failed!" });
            }
            // res.status(200).json({ message: "Logout successful" });
        });

        res.status(200).json({ message: "Logout successful" });
    });
});

app.get("/userDetails/:user_id", (req, res) => {
    const userId = req.params.user_id;
    
    const query = `SELECT user_name, address,city FROM users WHERE user_id = ?`; // Modify based on your table structure

    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error fetching customer details:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length > 0) {
            res.json(result[0]); // Send first row containing user details
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

app.post('/UserRegister', async function(req, res) {
    const { name, email, mobile, address, city, state, pin, password } = req.body;
   
    if (!name || !email || !mobile || !address || !city || !state || !pin || !password) {
        return res.status(400).send("All fields are required");
    }

    try {
        // **Hash the password before storing**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        var qry = `INSERT INTO users(user_name, email, phone_number, address,city, state, pincode, password) 
                   VALUES(?, ?, ?, ?, ?, ?, ?,?)`;

        con.query(qry, [name, email, mobile, address,city, state, pin, hashedPassword], function(err, result) {
            if (err) {
                console.error(err);
                return res.json({ status: "failed" });
            }
            else{
                return res.json({ status: "success" });
            }
            
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

/*Booking confirmation email */



app.post("/providerDetails", (req, res) => {
    const { userEmail, providerId } = req.body;

    if (!providerId || !userEmail) {
        return res.status(400).json({ success: false, message: "Provider ID and user email are required" });
    }

    const sql = "SELECT * FROM provider WHERE provider_id = ?";
    
    con.query(sql, [providerId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        const provider = results[0]; // Get the first provider
        // const providerDetails = `Name: ${provider.provider_name}\nPhone: ${provider.phone_number}\nEmail: ${provider.email}`;
        const providerDetails = {
            provider_name: provider.provider_name,
            phone_number: provider.phone_number, // Ensure correct column name
            email: provider.email
        };
        // Call an async function instead of using `await` inside callback
        sendProviderDetailsEmail(userEmail, providerDetails)
            .then((emailResponse) => {
                if (emailResponse.success) {
                    return res.status(200).json({ success: true, message: "Email sent successfully" });
                } else {
                    return res.status(500).json({ success: false, message: "Error sending email" });
                }
            })
            .catch((emailError) => {
                console.error("Email sending error:", emailError);
                return res.status(500).json({ success: false, message: "Internal email error" });
            });
    });
});


app.post("/feedback", async (req, res) => {
    const { booking_id } = req.body;

    if (!booking_id) {
        return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    // Get user email and service details
    const sql = `
        SELECT u.email, s.category, s.service_name, b.booking_status 
        FROM booking b
        JOIN users u ON b.user_id = u.user_id
        JOIN service s ON b.service_id = s.service_id
        WHERE b.booking_id = ?
    `;

    con.query(sql, [booking_id], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const booking = results[0];

        // Check if booking status is "Completed"
        if (booking.booking_status.toLowerCase() !== "completed") {
            return res.status(400).json({ success: false, message: "Booking is not completed yet" });
        }

        // Extract user email and service details
        const userEmail = booking.email;
        const serviceDetails = {
            category_name: booking.category,
            service_name: booking.service_name,
        };

        // Send Feedback Email
        const emailResponse = await sendFeedbackEmail(userEmail, serviceDetails,booking_id);

        if (emailResponse.success) {
            console.log("Feedback email sent successfully");
            return res.status(200).json({ success: true, message: "Feedback email sent successfully" });
        } else {
            return res.status(500).json({ success: false, message: "Error sending feedback email" });
        }
    });
});

app.post("/storeFeedback",(req,res)=>{
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const sql = "INSERT INTO feedback (booking_id, rating, comment) VALUES (?, ?, ?)";

    con.query(sql, [booking_id, rating, comment], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        console.log(`Feedback stored for Booking ID: ${booking_id}`);
        return res.status(200).json({ success: true, message: "Feedback stored successfully" });
    });
});

// Get platform reviews by service_id
app.get('/getReview/:service_id', (req, res) => {
    const serviceId = req.params.service_id;
    const query = `
      SELECT pr.rating, pr.comment, u.user_name, pr.created_at
      FROM review pr
      JOIN users u ON pr.user_id = u.user_id
      WHERE pr.service_id = ?
      ORDER BY pr.created_at DESC
    `;
  
    con.query(query, [serviceId], (err, results) => {
      if (err) {
        console.error('Error fetching platform reviews:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });

  app.post('/postReview/:user_id', (req, res) => {
    const userId = req.params.user_id; // Extract user_id from URL parameters
    const { service_id, rating, comment } = req.body; // Collect data from the request body
  
    // Basic validation to ensure the review data is available
    if (!service_id || !rating || !comment) {
      return res.status(400).json({ error: 'Service ID, rating, and comment are required' });
    }
  
    // Prepare the SQL query to insert the review into the review table
    const query = `
      INSERT INTO review (service_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `;
  
    // Execute the query
    con.query(query, [service_id, userId, rating, comment], (err, results) => {
      if (err) {
        console.error('Error posting review:', err);
        return res.status(500).json({ error: 'Database error while posting review' });
      }
  
      // Respond with success message
      console.log('Review submitted:', { service_id, userId, rating, comment });
      res.status(200).json({ message: 'Review submitted successfully' });
    });
  });
  

app.put("/updateStatus", (req, res) => {
    let new_status="completed";
    const { booking_id } = req.body;

    if (!booking_id) {
        return res.status(400).json({ success: false, message: "Booking ID required" });
    }

    const sql = "UPDATE booking SET booking_status = ? WHERE booking_id = ?";

    con.query(sql, [new_status,booking_id], async (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        console.log(`Booking ${booking_id} updated to ${new_status}`);

        // 📌 If booking is marked as "Completed", trigger feedback email API
        if (new_status.toLowerCase() === "completed") {
            // Call feedback API using "request" package (since `fetch` won't work inside MySQL callback)           
            try{
                const feedbackResponse = await axios.post("http://localhost:8080/feedback", {
                    booking_id,
                });
                console.log("Feedback email response:", feedbackResponse.data);
            }
            catch(error){
                console.error("Error triggering feedback email:", error);
            }
        }
        return res.status(200).json({ success: true, message: "Booking status updated successfully" });
    });
});

app.post('/payment', (req, res) => {
    const { bookingId, amount } = req.body;
  
    // console.log("Received Payment Request:", { bookingId, amount });

    // Fetch user wallet details based on booking ID
    const query = `
      SELECT b.user_id, w.balance
      FROM booking b
      JOIN wallet w ON b.user_id = w.user_id
      WHERE b.booking_id = ?
    `;
    
    con.query(query, [bookingId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error" });
      }
  
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: "User or booking not found" });
      }
  
      const user = results[0];
    //   console.log("User Details Fetched:", user);

      // Check if the user has sufficient balance
      if (user.balance < amount) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
      }
  
      // Deduct from wallet balance
      const newBalance = user.balance - amount;
  
      // Update wallet balance
      const updateWalletQuery = `
        UPDATE wallet 
        SET balance = ?
        WHERE user_id = ?
      `;
      
      con.query(updateWalletQuery, [newBalance, user.user_id], (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Failed to update wallet" });
        }
  
        // console.log("Wallet Updated Successfully. New Balance:", newBalance);

        // Update booking payment status to 'Paid'
        const updateBookingQuery = `
          UPDATE booking 
          SET payment_status = 'Paid' 
          WHERE booking_id = ?
        `;
        con.query(updateBookingQuery, [bookingId], (err, results) => {
          if (err) {
            console.error("Database Error (Updating Booking Payment Status):", err);
            return res.status(500).json({ success: false, message: "Failed to update booking" });
          }

          //Insert into Payment  table
          const insertPaymentQuery = `
          INSERT INTO payment (booking_id, amount, payment_status)
          VALUES (?, ?, 'Paid')
        `;

        con.query(insertPaymentQuery, [bookingId, amount], (err, results) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Failed to record payment" });
          }

        //   console.log("Booking Payment Updated Successfully");
          return res.json({ success: true, message: "Payment successful" });
        });
        });
      });
    });
  });



/*
app.post('/a',(req,res)=>{
    //var a=10;
    //var b=20;
    var {a,b}=req.body;
    var ans=parseInt(a)+parseInt(b);
    console.log('Result from /a:', ans);
    res.json({ result: ans });
});
app.post('/getData', async (req, res) => {
    try {
        const resp = await axios.post('http://localhost:3000/a',{
            a:req.body.a,
            b:req.body.b
        });
        console.log('Response from /a:', resp.data);
        const resultA=resp.data.result;
        const finalAns=resultA * 5;
        res.send("FinalAns:"+finalAns);
    }
    catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching data' });
    }
});
*/

app.listen(8080,function(){
    console.log("Server is running on port 8080");
});


//app.use('/',routing);