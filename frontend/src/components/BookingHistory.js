import React,{useState,useEffect} from "react";
import { Download } from "lucide-react";  // Import download icon
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import the table formatting plugin
import Swal from "sweetalert2";
import './BookingHistory.css';
import Navbar from "./Navbar";

function BookingHistory(){
    const [bookingData, setBookingData] = useState([]);
    const [customerDetails, setCustomerDetails] = useState({ user_name: "", address: "" ,city: "" });
    const API_URL = "http://localhost:8080";
    const user_id = sessionStorage.getItem("user_id");

   

   
    // Function to fetch booking history again
    const fetchBookingHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/user/booking-history/${user_id}`);
            setBookingData(response.data);
        } catch (error) {
            console.error("Error fetching updated booking history:", error);
        }
    };
    const fetchUserDetails = async () => {
        if (!user_id) {
            console.error("User ID not found. Please log in.");
            return;
        }
    
        try {
            const response = await axios.get(`${API_URL}/userDetails/${user_id}`);
            setCustomerDetails(response.data);
        } catch (error) {
            console.error("Error fetching customer details:", error);
        }
    };
    

    useEffect(() => {
        if (!user_id) {
            console.error("User ID not found. Please log in.");
            return;
        }
       fetchBookingHistory();        // Fetch booking history
       fetchUserDetails();         // Fetch user details
    }, [user_id]);
    
    
    const cancelBooking = async (bookingId) => {
        // Step 1: Show dropdown with predefined reasons
        const { value: reason,isDismissed } = await Swal.fire({
            title: "Cancel Booking",
            input: "select",
            inputOptions: {
                "Personal Issues": "Personal Issues",
                "Service Delay": "Service Delay",
                "Price Concerns": "Price Concerns",
                "Change of Plans": "Change of Plans",
                "Other": "Other"
            },
            inputPlaceholder: "Select a reason",
            showCancelButton: true,
            confirmButtonText: "Next",
            cancelButtonText: "Cancel",
        });
    
        if (isDismissed) {
            return; // User clicked cancel, just exit without showing the error message
        }

        if (!reason) {
            Swal.fire("Cancelled", "You must select a reason to proceed.", "error");
            return;
        }
    
        let finalReason = reason;
    
        // Step 2: If user selects "Other", ask for custom input
        if (reason === "Other") {
            const { value: customReason } = await Swal.fire({
                title: "Specify Your Reason",
                input: "textarea",
                inputPlaceholder: "Enter your reason...",
                inputAttributes: { maxlength: "200" },
                showCancelButton: true,
                confirmButtonText: "Submit",
                cancelButtonText: "Cancel",
            });
    
            if (!customReason) {
                Swal.fire("Cancelled", "You must provide a reason to cancel.", "error");
                return;
            }
    
            finalReason = customReason; // Use custom reason entered by user
        }
    
        // Step 3: Confirm cancellation with the final reason
        const confirmCancel = await Swal.fire({
            title: "Confirm Cancellation",
            html: `Are you sure you want to cancel this booking? <br> <strong>Reason: ${finalReason}</strong>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Cancel it",
            cancelButtonText: "No, Keep it",
        });
    
        if (!confirmCancel.isConfirmed) {
            return;
        }
    
        // Step 4: Send cancellation reason to backend
        try {
            const response = await axios.put(`${API_URL}/user/cancel-booking/${bookingId}`, {
                cancelReason: finalReason
            });
    
            Swal.fire("Success", response.data.message, "success");
    
            fetchBookingHistory();

            // Update UI after cancellation
            setBookingData((prev) =>
                prev.map((booking) =>
                    booking.booking_id === bookingId
                        ? { ...booking, booking_status: "Cancelled" }
                        : booking
                )
            );
        } 
        catch (error) {
            console.error("Error cancelling booking:", error.response ? error.response.data : error.message);
            Swal.fire("Error", "Failed to cancel the booking. Try again.", "error");
        }
    };
    

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB"); // Formats as DD/MM/YYYY
    };
    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        const [hours, minutes] = timeString.split(":"); // Extract HH and MM
        let hour = parseInt(hours, 10);
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12; // Convert 24-hour to 12-hour format
        return `${hour}:${minutes} ${period}`;
    };

    const generatePDF = async (booking) => {
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
    
        // Add company logo
        const img = new Image();
        img.src = "/img-asset/logo.png"; // Place your company logo inside public folder
        doc.addImage(img, "PNG", 10, 10, 20, 20);
    
        // Add company name
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("Handy Homes", pageWidth / 2, 25, { align: "center" });
    
        doc.setLineWidth(0.5);
        doc.line(10, 40, pageWidth - 10, 40); // (x1, y1, x2, y2)

        // Add document title
        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text("Booking Details Report",pageWidth / 2, 55, { align: "center" });
    
        // Add customer details
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        let yPos =60;
        doc.text(`Customer Name: ${customerDetails.user_name}`, 10, 70);
        doc.text(`Address: ${customerDetails.address || "Not Provided"}`, 10, 80);
        doc.text(`City:${customerDetails.city || "Not Provided"}`,10,90);
    
         // Add extra spacing before the table
        yPos += 40; // Move down to avoid overlap

        // Add booking details table
        const tableData = [
            ["Booking ID", booking.booking_id],
            ["Service Name", booking.service_name],
            ["Service Provider", booking.provider_name || "Not Assigned"],
            ["Booking Date", formatDate(booking.booking_date)],
            ["Service Date", formatDate(booking.service_date)],
            ["Service Time", formatTime(booking.service_time)],
            ["Total Price", `Rs. ${booking.total_price}`],
            ["Booking Status", booking.booking_status],
        ];
    
        // Add cancellation reason if booking is cancelled
        if (booking.booking_status === "Cancelled") {
            console.log("Cancellation Reason:", booking.cancel_reason); 
            tableData.push(["Cancellation Reason", booking.cancel_reason || "N/A"]);
        }
    
        // Generate the table in PDF
        autoTable(doc,{
            startY: yPos,
            head: [["Field", "Details"]],
            body: tableData,
            didDrawPage: function (data) {
                // Ensure page breaks are handled correctly
                doc.setFontSize(12);
                doc.text("Thank you for choosing our service!", pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });
            }
        });
       
        // Save PDF
        doc.save(`Booking_${booking.booking_id}.pdf`);
    };

    const generatePDFByDate = async (fromDate, toDate) => {
        try {
            const response = await axios.get(
                `${API_URL}/user/bookings-by-date/${user_id}`,{
                   params:{fromDate,toDate} }
            );
            const bookings = response.data;
    
            if (bookings.length === 0) {
                Swal.fire("No Data", "No bookings found for the selected period.", "info");
                return;
            }
    
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
    
            // Add company logo
            const img = new Image();
            img.src = "/img-asset/logo.png";
            doc.addImage(img, "PNG", 10, 10, 20, 20);
    
            // Add company name
            doc.setFontSize(28);
            doc.setFont("helvetica", "bold");
            doc.text("Handy Homes", pageWidth / 2, 25, { align: "center" });
    
            // Add a horizontal line
            doc.setLineWidth(0.5);
            doc.line(10, 40, pageWidth - 10, 40);
    
            // Add Report Title
            doc.setFontSize(16);
            doc.setFont("times", "bold");
            doc.text(`Booking Report (${fromDate} to ${toDate})`, pageWidth / 2, 55, { align: "center" });
    
            // Add customer details
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            let yPos =60;
            doc.text(`Customer Name: ${customerDetails.user_name}`, 10, 70);
            doc.text(`Address: ${customerDetails.address || "Not Provided"}`, 10, 80);
            doc.text(`City:${customerDetails.city || "Not Provided"}`,10,90);

             // Add extra spacing before the table
            yPos += 40; // Move down to avoid overlap

            // Convert bookings into table format
            const tableData = bookings.map((booking) => [
                booking.booking_id,
                booking.service_name,
                booking.provider_name,
                formatDate(booking.booking_date),
                formatDate(booking.service_date),
                formatTime(booking.service_time),
                `Rs. ${booking.total_price}`,
                booking.booking_status,
                booking.booking_status === "Cancelled" ? booking.cancel_reason || "N/A" : "-", // Show reason only if canceled
            ]);
            

            // Generate table
            autoTable(doc, {
                startY: yPos,
                head: [["Booking ID", "Service", "Provider", "Booking Date", "Service Date", "Service Time", "Total Price", "Status", "Cancel Reason"]],
                body: tableData,
                theme: "striped",
                styles: { fontSize: 10 },
               
                didDrawPage: function (data) {
                    // Ensure page breaks are handled correctly
                    doc.setFontSize(12);
                    doc.text("Thank you for choosing our service!", pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });
                }
            });
    
            // Footer
            /*doc.setFontSize(12);
            doc.text("Thank you for choosing our service!", pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });
            */
            // Save PDF
            doc.save(`Booking_Report_${fromDate}_to_${toDate}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            Swal.fire("Error", "Failed to generate report.", "error");
        }
    };
    

    const handleDownloadByDate = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Download Booking Report",
            html: `
            <div class="date-picker-container">
                <div class="date-input">
                    <label for="fromDate">From:</label>
                    <input type="date" id="fromDate" class="swal2-input">
                </div>
                <div class="date-input">
                    <label for="toDate">To:</label> &emsp;
                    <input type="date" id="toDate" class="swal2-input">
                </div>
            </div>
            `,
            customClass: {
                popup: "custom-swal-popup",
                confirmButton: "custom-swal-confirm",
                cancelButton: "custom-swal-cancel",
            },
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Download",
            preConfirm: () => {
                const fromDate = document.getElementById("fromDate").value;
                const toDate = document.getElementById("toDate").value;
    
                if (!fromDate || !toDate) {
                    Swal.showValidationMessage("Both dates are required!");
                    return false;
                }
                if (fromDate > toDate) {
                    Swal.showValidationMessage("From Date cannot be after To Date!");
                    return false;
                }
    
                return { fromDate, toDate };
            }
        });
    
        if (formValues) {
            console.log("Downloading PDF from:", formValues.fromDate, "to", formValues.toDate);
            generatePDFByDate(formValues.fromDate, formValues.toDate);
        }
    };
    
    const handleGetDetails = (providerName,providerId) => {
        Swal.fire({
          title: "Provider Details",
          text: `Do you want to get ${providerName}'s details via email?`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Get via Email",
        }).then((result) => {
          if (result.isConfirmed) {
            sendEmail(providerName,providerId); // This function will call the backend API (to be implemented)
          }
        });
      };
      
      const sendEmail = async (providerName, providerId) => {
        try {
          const userEmail = sessionStorage.getItem("userEmail"); // Get email from sessionStorage
          if (!userEmail) {
            Swal.fire({
              title: "Error",
              text: "User email not found. Please log in again.",
              icon: "error",
            });
            return;
          }
      
          console.log("Sending Data:", { userEmail, providerId });

          const response = await axios.post(`${API_URL}/providerDetails`, {
            userEmail,
            providerId,
          });
      
          if (response.data.success) {
            Swal.fire({
              title: "Email Sent",
              text: `You will receive ${providerName}'s details via email shortly.`,
              icon: "success",
            });
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to send email. Please try again later.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Something went wrong. Please try again.",
            icon: "error",
          });
        }
      };
      
      const handlePayNow = async (bookingId, totalPrice) => {
        // Step 1: Show SweetAlert confirmation dialog
        const { value: confirmPayment } = await Swal.fire({
            title: 'Confirm Payment',
            text: `Are you sure you want to pay Rs.${totalPrice}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Pay Now',
            cancelButtonText: 'Cancel'
        });
    
        if (!confirmPayment) {
            // If the user clicked Cancel, do nothing
            return;
        }
    
        // Step 2: Call the payment API
        try {
            const response = await axios.post(`${API_URL}/payment`, {
                bookingId,
                amount: totalPrice
            });
    
            if (response.data.success) {
                // Payment successful
                Swal.fire({
                    title: 'Payment Successful',
                    text: `Your payment of Rs.${totalPrice} has been processed successfully.`,
                    icon: 'success'
                });
    
                // Step 3: Update booking status and payment status
                setBookingData((prev) => 
                    prev.map((booking) => 
                        booking.booking_id === bookingId
                            ? { ...booking, payment_status: 'Paid' }
                            : booking
                    )
                );
            } else {
                // If the payment fails
                Swal.fire({
                    title: 'Payment Failed',
                    text: response.data.message || 'There was an issue processing your payment. Please try again later.',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error("Error during payment:", error);
            Swal.fire({
                title: 'Payment Failed',
                text: error.response?.data?.message || 'There was an issue processing your payment. Please try again later.',
                icon: 'error'
            });
        }
    };
    
   return(
        <div className="hist-body">
            <Navbar/> 
            <br/><br/><br/><br/>
            <div className="hist-content">
                <h1 style={{fontFamily:"Times New Roman, Times, serif",color:"#145a32",fontWeight:"bolder"}}>
                    Booking History
                </h1>
                <div className="download-btn-container">
                    <button className="download-report-btn" onClick={handleDownloadByDate}>
                        Download Report
                    </button>
                </div>
                {bookingData.length === 0 ? (
                    <p className="no-book">No bookings found.</p>
                ) : (
                    <table className="booking-table">
                        <thead>
                            <tr>
                            <th>Booking ID</th>
                            <th>Service Name</th>
                            <th>Service Provider</th>
                            <th>Booking Date</th>
                            <th>Service Date</th>
                            <th>Service Time</th>
                            <th>Total Price</th>
                            <th>Booking Status</th>
                            <th>Payment Status</th>
                            <th className="hidden-header"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingData.map((booking, index) => (
                            <tr key={index}>
                                <td>{booking.booking_id}</td>
                                <td>{booking.service_name}</td>
                                {/* <td>{booking.provider_name}</td> */}
                                <td>
                                        {(booking.provider_name && booking.provider_name !== "Not Assigned" && booking.provider_name.trim() !== "") ? (
                                            <>
                                                {booking.provider_name}  
                                                <br/>
                                                <a  
                                                    className="provider-link"
                                                    style={{ marginLeft: '8px' }}
                                                    onClick={() => handleGetDetails(booking.provider_name,booking.provider_id)}
                                                > 
                                                    Get details
                                                </a>
                                            </>
                                        ) : (
                                            "Not Assigned"
                                        )}
                                </td>
                                <td>{formatDate(booking.booking_date)}</td>
                                <td>{formatDate(booking.service_date)}</td>
                                <td>{formatTime(booking.service_time)}</td>
                                <td>Rs.{booking.total_price}</td>
                                <td className={booking.booking_status === "Completed" ? "status-completed" : 
                                    booking.booking_status === "Pending" ? "status-pending" : 
                                    booking.booking_status === "Assigned" ? "status-confirmed" : "status-cancelled"}>
                                {booking.booking_status}
                                </td>
                                <td className={booking.payment_status === "Paid" ? "payment-paid" : "payment-unpaid"}>
                                    {booking.provider_name && booking.provider_name !== "Not Assigned" ? (
                                        booking.payment_status === "Paid" ? (
                                            "Paid"
                                        ) : (
                                            <button 
                                                className="pay-now-btn"
                                                onClick={() => handlePayNow(booking.booking_id, booking.total_price)}
                                            >
                                                Pay Now
                                            </button>
                                        )
                                    ) : (
                                        booking.payment_status // Show "Pending" if no provider is assigned
                                    )}
                                </td>
                                <td>
                                    {booking.booking_status === "Cancelled" ? (
                                        <span className="cancelled-text">Booking Cancelled</span>
                                    ) : booking.booking_status === "Completed" ? (
                                        <span className="completed-text">Service Completed</span>
                                    ) : (
                                        <button className="cancel-btn" onClick={() => cancelBooking(booking.booking_id)}>
                                            Cancel Booking
                                        </button>
                                    )}
                                </td>
                                <td>
                                    <Download 
                                        className="download-icon" 
                                        onClick={() => generatePDF(booking)}
                                    />
                                </td>                           
                            </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
   );
}

export default BookingHistory;
