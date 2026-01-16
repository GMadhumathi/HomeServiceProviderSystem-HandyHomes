require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmationEmail = async (recipientEmail, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: "Booking Confirmation - Handy Homes",
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; 
                      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: left; border-top: 5px solid #28a745;">
              <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                  Booking Confirmed 🎉
              </h2>
              <p>Dear Customer,</p>
              <p>Your service booking has been successfully confirmed. Here are the details:</p>
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; 
                          margin: 20px 0; border-radius: 5px;">
                  <p><strong>Booking ID:</strong> ${bookingDetails.booking_id}</p>
                  <p><strong>Service:</strong> ${bookingDetails.service_name}</p>
                  <p><strong>Category:</strong> ${bookingDetails.category}</p>
                  <p><strong>Date:</strong> ${bookingDetails.service_date}</p>
                  <p><strong>Time:</strong> ${bookingDetails.service_time}</p>
                  <p><strong>Total Price:</strong> Rs. ${bookingDetails.total_price}</p>
                  ${bookingDetails.emergency ? "<p style='color: red;'><strong>Emergency Service:</strong> Yes (+₹200)</p>" : ""}
              </div>
              <p>You can get provider details once assigned. Thank you for your service booking!</p>
              <hr>
         
			  <p style="margin-top: 20px; font-size: 14px; color: #777; text-align: center;">
                  Thank you for choosing <strong>Handy Homes</strong>! We appreciate your trust in us.
              </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Booking confirmation email sent" };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return { success: false, message: "Failed to send confirmation email" };
  }
};



const sendProviderDetailsEmail = async (recipientEmail, providerDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: "Your Assigned Service Provider Details",
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; 
                      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: left; border-top: 5px solid #007bff;">
              <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                  Service Provider Details
              </h2>
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; 
                          margin: 20px 0; border-radius: 5px;">
                  <p><strong>Name:</strong> ${providerDetails.provider_name}</p>
                  <p><strong>Contact:</strong> ${providerDetails.phone_number}</p>
                  <p><strong>Email:</strong> ${providerDetails.email}</p>
              </div>
              <p>If you have any questions, feel free to contact your assigned provider.</p>
              <hr>
              <p style="color: red; font-size: 13px; font-style: italic; text-align: center;">
                  Provider details are valid for this service only. For future bookings, please use the <strong>Handy Homes</strong> platform.
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #777; text-align: center;">
                  Thank you for choosing <strong>Handy Homes</strong>! We appreciate your trust in us.
              </p>
          </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

// ✅ Move sendFeedbackEmail OUTSIDE of sendProviderDetailsEmail
const sendFeedbackEmail = async (recipientEmail, serviceDetails,booking_id) => {
  try {
    // const feedbackLink = `https://docs.google.com/forms/d/e/1FAIpQLScqCxpEvBh-XP_1ykLZXi5ildYWk0nXCadCNiX93qLmVn7MqQ/viewform?usp=dialog`;
    const feedbackLink = `https://docs.google.com/forms/d/e/1FAIpQLScqCxpEvBh-XP_1ykLZXi5ildYWk0nXCadCNiX93qLmVn7MqQ/viewform?usp=pp_url&entry.1623197163=${booking_id}`;    

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: "We Value Your Feedback - Handy Homes",
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; 
                      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: left; border-top: 5px solid #007bff;">
              <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                  Your Feedback Matters!
              </h2>
              <p>Thank you for using <strong>Handy Homes</strong> for your service.</p>
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; 
                          margin: 20px 0; border-radius: 5px;">
                  
                  <p><strong>Service Category:</strong> ${serviceDetails.category_name}</p>
                  <p><strong>Service Name:</strong> ${serviceDetails.service_name}</p>
              </div>
              <p>We would love to hear your feedback. Please click the link below to submit your response:</p>
              <p style="text-align: center;">
                  <a href="${feedbackLink}" style="padding: 10px 20px; 
                     text-decoration: underline; border-radius: 5px; font-weight: bold;">
                      Click here to Submit Feedback
                  </a>
              </p>
              <p>Your feedback helps us improve our services.</p>
              <hr>
              <p style="text-align: center; font-size: 14px; color: #777;">
                  Thank you for choosing <strong>Handy Homes</strong>!
              </p>
          </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Feedback email sent successfully" };
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return { success: false, message: "Failed to send feedback email" };
  }
};

// ✅ Ensure both functions are properly exported
module.exports = { sendBookingConfirmationEmail,sendProviderDetailsEmail, sendFeedbackEmail };
