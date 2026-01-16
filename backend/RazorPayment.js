const Razorpay = require("razorpay");
const express = require("express");
const router = express.Router();

const razorpay = new Razorpay({
    key_id: 'rzp_test_U7xGD5MA2HffKi',
    key_secret: 'Z9bpHz6gskjwu28xmRKqHaYA'
});

// Create Order API
router.post("/createOrder", async (req, res) => {
    try {
        const { amount } = req.body; // Amount from frontend

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: "receipt_order_" + Date.now()
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
});

module.exports = router;
