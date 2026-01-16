require("dotenv").config();
const twilio = require("twilio");

const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

client.messages
    .create({
        body: "Hello Handy, this is a test message from Twilio!",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: "+919500863353" // Replace with your verified number
    })
    .then((message) => console.log("Message sent with SID:", message.sid))
    .catch((error) => console.error("Error sending SMS:", error));
