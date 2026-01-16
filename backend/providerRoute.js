const express = require("express");
const router = express.Router();
const con = require("./db");

// Provider accepts or rejects a service request by providing name, email, and decision
router.put("/acceptService/:reqId", (req, res) => {
    const {reqId} = req.params;
    const { name, email, choice } = req.body;

    // Validate decision input
    if (!["accepted", "rejected"].includes(choice)) {
        return res.status(400).json({ message: "Invalid decision. Must be 'accepted' or 'rejected'." });
    }

    // Get provider_id based on the provided name and email
    const qry = "SELECT provider_id FROM serviceprovider WHERE provider_name=? AND email=?" ;
    con.query(qry, [name, email], (err, result) => {
        if (err) {
            const errorMessage = err && err.message ? err.message : 'An unknown error occurred';
            return res.status(500).json({ error: errorMessage });
        }
           
        if (result.length === 0)
            return res.status(400).json({ message: "Provider not found" });

        const provider_id = result[0].provider_id;

        // Check if there are any pending assignments for this service request
        const qry1 = "SELECT assignment_id FROM service_assignments WHERE request_id=? AND provider_id=? AND status='pending'";
        con.query(qry1, [reqId, provider_id], (err, result) => {
            if (err) {
                const errorMessage = err && err.message ? err.message : 'An unknown error occurred';
                return res.status(500).json({ error: errorMessage });
            }
            if (result.length === 0) 
                return res.status(400).json({ message: "Service request not available for this provider" });

            let assign_id = result[0].assignment_id;

            // If accepted, update the service assignment and reject others
            if (choice === "accepted") {
                const updateQry =  "UPDATE service_assignments SET status='accepted' WHERE assignment_id=?";
                con.query(updateQry, [assign_id], (err) => {
                    if (err) {
                        const errorMessage = err && err.message ? err.message : 'An unknown error occurred';
                        return res.status(500).json({ error: errorMessage });
                    }
                    // Reject all other pending providers for this request
                    const rejQry = "UPDATE service_assignments SET status='rejected' WHERE request_id=? AND provider_id<>? AND status='pending'"
                    con.query(rejQry , [reqId, provider_id], (err) => {
                        if (err) {
                            const errorMessage = err && err.message ? err.message : 'An unknown error occurred';
                            return res.status(500).json({ error: errorMessage });
                        }

                        // Update the status of the service request to 'assigned'
                        con.query("UPDATE service_requests SET req_status='assigned' WHERE request_id=?", [reqId], (err) => {
                            if (err) {
                                const errorMessage = err && err.message ? err.message : 'An unknown error occurred';
                                return res.status(500).json({ error: errorMessage });
                            }
                            res.json({ message: "Service successfully assigned to provider" });
                        });
                    });
                });
            } 
            else if (choice === "rejected") {
                // Reject the service request
                con.query("UPDATE service_assignments SET status='rejected' WHERE assignment_id=?", [assign_id], (err) => {
                    if (err) {
                        const errorMessage = err && err.message ? err.message : 'An unknown error occurred';
                        return res.status(500).json({ error: errorMessage });
                    }
                    res.json({ message: "Service request rejected" });
                });
            }
        });
    });
});

module.exports = router;




