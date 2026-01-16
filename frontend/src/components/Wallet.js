import React,{useState,useEffect} from "react";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import './Wallet.css';

function Wallet(){
    const API_URL="http://localhost:8080";
    const userId = sessionStorage.getItem("user_id");
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    const openRazorpay = (orderData, amount, userId) => {
        const options = {
            key: 'rzp_test_U7xGD5MA2HffKi', // Replace with your real Razorpay Key ID
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Handy Homes - Wallet Recharge',
            description: 'Wallet Recharge. Add money to wallet',
            order_id: orderData.id,
            handler: async function (response) {
                console.log("Payment success", response);
    
                // Step 3: Update Wallet balance on server
                try {
                    const updateResponse = await fetch(`${API_URL}/user/updateWallet/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ amount }),
                    });
    
                    if (updateResponse.ok) {
                        Swal.fire('Success', 'Wallet Recharged Successfully!', 'success');
                        fetchWalletBalance(); // Refresh the balance on screen
                    } else {
                        Swal.fire('Error', 'Failed to update wallet', 'error');
                    }
                } catch (error) {
                    console.error("Error updating wallet:", error);
                    Swal.fire('Error', 'Something went wrong', 'error');
                }
            },
            theme: {
                color: '#3399cc',
            }
        };
    
        const rzp = new window.Razorpay(options);
        rzp.open();
    };
    
    const fetchWalletBalance = async () => {
        const userId = sessionStorage.getItem("user_id"); // Get user ID from session storage
        if (!userId) return;

        try {
            const response = await fetch(`${API_URL}/user/walletBalance/${userId}`);
            const data = await response.json();

            if(response.ok){
                setWalletBalance(parseFloat(data.balance).toFixed(2)); // Update state with balance
            }
            else {
                console.error("Wallet not found:", data.message);
                setWalletBalance("0.00"); // Default to 0 if wallet is not found
            }
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    const handleRecharge = async () => {
        if (!userId) {
            alert("User not logged in");
            return;
        }

        const { value: amount } = await Swal.fire({
            title: 'Recharge Wallet',
            html: '<input id="recharge-amount" class="swal2-input" placeholder="Enter amount in ₹" style="font-size:16px;">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Recharge',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const inputVal = document.getElementById('recharge-amount').value;
                if (!inputVal || isNaN(inputVal) || inputVal <= 0) {
                    Swal.showValidationMessage('Please enter a valid amount');
                }
                return inputVal;
            }
        });
        
        if (amount) {
            try {
                // Step 1: Create Razorpay order
                const orderResponse = await fetch(`${API_URL}/pay/createOrder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ amount }),
                });
    
                const orderData = await orderResponse.json();
    
                if (orderResponse.ok) {
                    // Step 2: Open Razorpay popup
                    openRazorpay(orderData, amount, userId);
                } else {
                    Swal.fire('Error', 'Failed to create order', 'error');
                }
            } catch (error) {
                console.error("Error creating order:", error);
                Swal.fire('Error', 'Something went wrong', 'error');
            }
        }
    }
    return(
        <div className="wallet-body"  style={{ backgroundColor: "#dcedc8", minHeight: "100vh" }}>
            <Navbar/> 
            <br/><br/><br/><br/>
            <div className="wallet-content">
                <h1>Wallet Hub</h1>
                
                <div className="wallet-main-container">
                    {/* Wallet Balance Container */}
                    <div className="wallet-balance-container">
                        <h2>Wallet Balance</h2>
                        <p className="wallet-amount">Rs.  {walletBalance}</p> 
                    </div>

                    {/* Wallet Recharge Container */}
                    <div className="wallet-recharge-container">
                        <h2>Recharge Wallet</h2>
                        <button className="recharge-button" onClick={handleRecharge}>Recharge Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Wallet;