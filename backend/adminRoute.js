const express = require("express");
const router = express.Router();
const con = require("./db");
const bcrypt = require("bcryptjs"); // For password hashing

// Get all pending service requests (not yet assigned)
router.get('/pendingRequest', (req, res) => {
    // console.log("🔥 /admin/pendingRequest API Hit");
    const query = `
      SELECT sr.request_id, sr.booking_id,  u.user_name AS customer_name, 
       u.city, s.service_name, s.category 
        FROM service_request sr
        JOIN booking b ON sr.booking_id = b.booking_id
        JOIN service s ON b.service_id = s.service_id
        JOIN users u ON b.user_id = u.user_id
        WHERE sr.request_status = 'pending';

    `;
    con.query(query, (err, result) => {
      if (err) {
        console.error("Error in /admin/pendingRequest:", err); // <-- Add this
        return res.status(500).send(err);
      } 
    //   console.log("✅ Requests fetched:", result.length);     
      res.json(result);
    });
  });

// In adminRoute.js

router.get('/availableProviders/:city/:category', (req, res) => {
    const { city, category } = req.params;

    const query = `
        SELECT p.provider_id, p.provider_name 
        FROM provider p
        JOIN service_provider sp ON p.provider_id = sp.provider_id
        WHERE p.city = ? 
        AND p.status = 'available'
        AND sp.category = ?;
    `;

    con.query(query, [city, category], (err, result) => {
        if (err) {
            console.error("Error fetching available providers:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.json(result);
    });
});

router.post('/assignProvider', (req, res) => {
    const { request_id, provider_id, booking_id } = req.body;

    const insertAssignment = `
        INSERT INTO service_assignment (request_id, provider_id, assignment_status)
        VALUES (?, ?, 'assigned')`;

    const updateRequest = `
        UPDATE service_request
        SET request_status = 'assigned'
        WHERE request_id = ?`;

    const updateBooking = `
        UPDATE booking
        SET provider_id = ?, booking_status = 'assigned'
        WHERE booking_id = ?`;

    con.beginTransaction(err => {
        if (err) return res.status(500).send(err);

        con.query(insertAssignment, [request_id, provider_id], (err) => {
            if (err) 
                return con.rollback(() => res.status(500).send({ status: false, error: "Insert failed", details: err }));

            con.query(updateRequest, [request_id], (err) => {
                if (err)
                     return con.rollback(() => res.status(500).send({ status: false, error: "Insert failed", details: err }));

                con.query(updateBooking, [provider_id, booking_id], (err) => {
                    if (err) 
                        return con.rollback(() => res.status(500).send({ status: false, error: "Insert failed", details: err }));

                    con.commit(err => {
                        if (err) 
                            return con.rollback(() => res.status(500).send({ status: false, error: "Insert failed", details: err }));
                        res.status(200).send({ status:true, message: "Provider assigned successfully" });
                        console.log("✅ Provider assigned:", provider_id, "to request:", request_id);
                    });
                });
            });
        });
    });
});


// 1. Get all customers
router.get("/customers", (req, res) => {
    con.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Update customer **password only**
router.put("/customers/:id", async (req, res) => {
    const { password } = req.body;
    const { id } = req.params;

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    try {
        // **Hash the new password**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = "UPDATE users SET password=? WHERE user_id=?";
        con.query(sql, [hashedPassword, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Password updated successfully" });
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 3. Delete a customer **and their related records**
router.delete("/customers/:id", (req, res) => {
    const { id } = req.params;

    // First, delete the customer record from users table
    con.query("DELETE FROM users WHERE user_id=?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Customer deleted successfully" });
    });
});

//1. Get all providers
router.get("/providers", (req, res) => {
    con.query("SELECT * FROM serviceprovider", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Update provider **password only**
router.put("/providers/:id", async (req, res) => {
    const { password } = req.body;
    const { id } = req.params;

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    try {
        // **Hash the new password**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = "UPDATE serviceprovider SET password=? WHERE provider_id=?";
        con.query(sql, [hashedPassword, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Password updated successfully" });
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 3. Delete a provider **and their related records**
router.delete("/providers/:id", (req, res) => {
    const { id } = req.params;

    // First, delete the customer record from users table
    con.query("DELETE FROM serviceprovider WHERE provider_id=?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Provider deleted successfully" });
    });
});

router.post("/assignService/:requestId", (req, res) => {
    const { requestId } = req.params;

    // Get the service ID from the request
    const qry = "SELECT service_id FROM service_requests WHERE request_id=?";
    con.query(qry, [requestId], (err, result) => {
        if (err) 
            return res.status(500).json({ error: err.message });

        if (result.length === 0) 
            return res.status(404).json({ message: "Service request not found" });

        const service_id = result[0].service_id;

        // Find all providers offering the requested service
        const findProvider = "SELECT provider_id FROM service WHERE service_id=?"; 
        con.query(findProvider, [service_id], (err, providers) => {
            if (err) 
                return res.status(500).json({ error: err.message });

            if (providers.length === 0)
                 return res.status(404).json({ message: "No providers available for this service" });

            // Assign the service request to all available providers
            const assignQry = "INSERT INTO service_assignments (request_id, provider_id) VALUES (?, ?)";
            providers.forEach((provider) => {
                con.query(assignQry, [requestId, provider.provider_id], (err) => {
                    if (err) console.error(err.message);
                });
            });
            res.json({ message: "Service request sent to all providers offering this service" });

        });
    });
});

module.exports = router;
