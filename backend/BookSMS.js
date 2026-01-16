require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const con = require("./db");

const router = express.Router();
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send SMS
const sendSMS = (to, message) => {
    if (!to.startsWith("+")) {
        to = "+91" + to;
    }
    client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
    }).catch(err => console.error("Twilio Error:", err));
};

// Handle incoming SMS
router.post("/ServiceSMS", (req, res) => {
    const incomingMessage = req.body.Body.trim().toUpperCase();
    let senderNumber = req.body.From;

    console.log("Received:", incomingMessage, senderNumber);

    if (senderNumber.startsWith("+91")) {
        senderNumber = senderNumber.slice(3);
    }

    con.query("SELECT user_name, user_id FROM users WHERE phone_number = ?", [senderNumber], (err, userRows) => {
        if (err || userRows.length === 0) {
            sendSMS(senderNumber, "Your number is not registered with Handy Homes.");
            return res.status(404).end();
        }

        const { user_name, user_id } = userRows[0];

        con.query("SELECT * FROM sms_sessions WHERE phone_number = ? ORDER BY created_at DESC LIMIT 1", [senderNumber], (err, sessionRows) => {
            if (err) {
                sendSMS(senderNumber, "Technical issue, please try later.");
                return res.status(500).end();
            }

            if (incomingMessage === "BOOK SERVICE") {
                if (sessionRows.length > 0) {
                    sendSMS(senderNumber, "You're already in a booking session. Choose a service category.");
                    return res.status(200).end();
                }

                con.query("INSERT INTO sms_sessions (phone_number, last_step) VALUES (?, 'CATEGORY_SELECTION')", [senderNumber], (err) => {
                    if (err) {
                        sendSMS(senderNumber, "Error starting your booking session.");
                        return res.status(500).end();
                    }

                    con.query("SELECT DISTINCT category FROM service WHERE status = 'Active'", (err, categoryRows) => {
                        if (err || categoryRows.length === 0) {
                            sendSMS(senderNumber, "No services available.");
                            return res.status(404).end();
                        }
                        const categoryList = categoryRows.map((row, index) => `${index + 1}. ${row.category}`).join("\n");
                        sendSMS(senderNumber, `Hello ${user_name}!, Welcome to Handy Homes Offline Service Booking.\nChoose a service category:\n${categoryList}`);
                        return res.status(200).end();
                    });
                });
            } else if (sessionRows.length > 0) {
                const session = sessionRows[0];
                if (session.last_step === "CATEGORY_SELECTION") {
                    con.query("SELECT DISTINCT category FROM service WHERE status = 'Active'", (err, categoryRows) => {
                        if (err || !categoryRows[incomingMessage - 1]) {
                            sendSMS(senderNumber, "Invalid selection.");
                            return res.status(400).end();
                        }
                        const selectedCategory = categoryRows[incomingMessage - 1].category;
                        con.query("UPDATE sms_sessions SET selected_category = ?, last_step = 'SERVICE_SELECTION' WHERE phone_number = ?", [selectedCategory, senderNumber], (err) => {
                            if (err) {
                                sendSMS(senderNumber, "Error processing request.");
                                return res.status(500).end();
                            }
                            con.query("SELECT service_name FROM service WHERE category = ? AND status = 'Active'", [selectedCategory], (err, serviceRows) => {
                                if (err || serviceRows.length === 0) {
                                    sendSMS(senderNumber, "No services available.");
                                    return res.status(404).end();
                                }
                                const serviceList = serviceRows.map((row, index) => `${index + 1}. ${row.service_name}`).join("\n");
                                sendSMS(senderNumber, `Choose a service:\n${serviceList}`);
                                return res.status(200).end();
                            });
                        });
                    });
                } else if (session.last_step === "SERVICE_SELECTION") {
                    con.query("SELECT service_name FROM service WHERE category = ?", [session.selected_category], (err, serviceRows) => {
                        if (err || !serviceRows[incomingMessage - 1]) {
                            sendSMS(senderNumber, "Invalid service selection.");
                            return res.status(400).end();
                        }
                        const selectedService = serviceRows[incomingMessage - 1].service_name;
                        con.query("UPDATE sms_sessions SET selected_service = ?, last_step = 'DETAILS_INPUT' WHERE phone_number = ?", [selectedService, senderNumber], (err) => {
                            if (err) {
                                sendSMS(senderNumber, "Error processing request.");
                                return res.status(500).end();
                            }
                            sendSMS(senderNumber, "Send Booking details in this format: CITY, DATE(YYYY-MM-DD), TIME(HH:MM AM/PM), EMERGENCY(YES/NO).\n If emergency, TIME must be at least 1 hr from now.");
                            return res.status(200).end();
                        });
                    });
                } else if (session.last_step === "DETAILS_INPUT") {
                    const details = incomingMessage.split(",").map(d => d.trim());
                    if (details.length !== 4) {
                        sendSMS(senderNumber, "Invalid format! Send: CITY, DATE, TIME, EMERGENCY(YES/NO)");
                        return res.status(400).end();
                    }
                    const [city, service_date, service_time, emergency] = details;
                    con.query("SELECT service_id, service_name,base_price,tax_percent FROM service WHERE service_name = ?", [session.selected_service], (err, serviceRows) => {
                        if (err || serviceRows.length === 0) {
                            sendSMS(senderNumber, "Invalid service selection.");
                            return res.status(400).end();
                        }
                        const { service_id,service_name, base_price,tax_percent } = serviceRows[0];
                        const tax = (base_price * tax_percent) / 100;
                        const emergency_charge = emergency.toUpperCase() === "YES" ? 200 : 0;
                        const total_price = base_price + tax + emergency_charge;
                        con.query("INSERT INTO booking (user_id, service_id, booking_date, service_date, service_time, total_price, booking_status, payment_status, emergency) VALUES (?, ?, NOW(), ?, ?, ?, 'Pending', 'Pending', ?)",
                            [user_id, service_id, service_date, service_time, total_price, emergency.toUpperCase() === "YES" ? 1 : 0], (err, result) => {
                            if (err) {
                                sendSMS(senderNumber, "Booking failed.");
                                return res.status(500).end();
                            }

                            const booking_id = result.insertId; // Get the inserted booking ID
                        

                            con.query("INSERT INTO service_request (booking_id,emergency) VALUES (?, ?)",
                            [booking_id, emergency.toUpperCase() === "YES" ? 1 : 0], (err) => {
                            if (err) {
                                sendSMS(senderNumber, "Booking confirmed, but service request creation failed.");
                                return res.status(500).end();
                            }

                            sendSMS(senderNumber, `Your Booking is confirmed! \n Total Amount for ${service_name} : ₹${total_price} .Check our platform for more details.`);
                            console.log("Booking confirmed");
                            con.query("DELETE FROM sms_sessions WHERE phone_number = ?", [senderNumber]);
                            // con.query("UPDATE sms_sessions SET last_step = 'END' WHERE phone_number = ?", [senderNumber]);
                            return res.status(200).end();
                        });
                    });
                    });
                }
            }
        });
    });
});

module.exports = router;



