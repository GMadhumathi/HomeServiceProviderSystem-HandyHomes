import React ,{useState,useEffect} from "react";
import axios from "axios";
import './AssignProvider.css';
import Swal from "sweetalert2";

function AssignProvider(){
    const API_URL = "http://localhost:8080";
    const [requests, setRequests] = useState([]);

    const fetchRequests = async()=>{
        axios.get(`${API_URL}/admin/pendingRequest`)
          .then(res => setRequests(res.data))
          .catch(err => console.error(err));
    }

    useEffect(() => {
        fetchRequests();

        const interval = setInterval(() => {
            fetchRequests(); // fetch every 10 seconds
          }, 10000);
        
          return () => clearInterval(interval); // cleanup on unmount
      }, []);

      const handleAssignProvider = async(request) => {
        try{
             // Fetch providers from backend
            const res = await axios.get(`${API_URL}/admin/availableProviders/${request.city}/${request.category}`);
            const providers = res.data;

            if (providers.length === 0) {
                Swal.fire({
                  icon: "info",
                  title: "No Providers Found",
                  text: `No available providers found in ${request.city} for ${request.category}.`,
                });
                return;
            }

            // Create provider options dynamically
            const providerOptions = providers.map(p =>
            `<option value="${p.provider_id}">${p.provider_name}</option>`
            ).join('');

            Swal.fire({
                title: `<strong style="font-size: 22px;">Assign Provider</strong>`,
                html: `
                  <div style="font-size: 16px; font-family: 'Segoe UI', sans-serif;">
      
                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                      <label for="service" style="width: 130px; font-weight: 600;">Service Name:</label>
                      <input type="text" id="service" value="${request.service_name}" readonly 
                      style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background-color: #f1f1f1;">
                  </div>
      
                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                      <label for="category" style="width: 130px; font-weight: 600;">Category:</label>
                      <input type="text" id="category" value="${request.category}" readonly 
                      style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background-color: #f1f1f1;">
                  </div>
      
                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                      <label for="city" style="width: 130px; font-weight: 600;">Customer City:</label>
                      <input type="text" id="city" value="${request.city}" readonly 
                      style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background-color: #f1f1f1;">
                  </div>
      
                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                      <label for="providerSelect" style="width: 130px; font-weight: 600;">Select Provider:</label>
                      <select id="providerSelect" class="swal2-select" 
                      style="width: 70%; max-width: 400px; padding: 8px; font-size: 15px; border: 1px solid #ccc; border-radius: 4px;">
                      <option value="">-- Select --</option>
                            ${providerOptions}
                      </select>
                  </div>
      
                  </div>
                  `,
      
                showCancelButton: true,
                confirmButtonText: 'Assign',
                cancelButtonText: 'Cancel',
                customClass: {
                  popup: 'assign-provider-popup',
                  confirmButton: 'assign-confirm-button',
                  cancelButton: 'assign-cancel-button'
                },
                preConfirm: () => {
                  const providerId = document.getElementById('providerSelect').value;
                  if (!providerId) {
                    Swal.showValidationMessage('Please select a provider');
                  }
                  return { providerId };
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  const providerId = result.value.providerId;
                  console.log("✅ Assigning Provider ID:", providerId, "for Request:", request.request_id);
                  // Proceed with backend API call here
                  axios.post(`${API_URL}/admin/assignProvider`, {
                    request_id: request.request_id,
                    provider_id: providerId,
                    booking_id: request.booking_id
                  })
                  .then(res => {
                    if (res.data.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Provider Assigned!',
                        text: 'Provider has been successfully assigned.',
                      });
                
                      // Optional: refresh list or remove assigned request from UI
                      setRequests(prevRequests => prevRequests.filter(r => r.request_id !== request.request_id));
                      // Example: setRequests(prev => prev.filter(r => r.request_id !== request.request_id));
                
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Assignment Failed',
                        text: res.data.message || 'Could not assign provider. Try again.',
                      });
                    }
                  })
                  .catch(err => {
                    console.error("Error assigning provider:", err);
                    Swal.fire({
                      icon: 'error',
                      title: 'Server Error',
                      text: 'An error occurred while assigning provider.',
                    });
                  });
                }
              });
        }
        catch(error){
            console.error("Error fetching available providers:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while fetching providers!',
              });
        }
      };
          
      

    return(
        <div className="assignment">
            <h1><center>Pending Service Requests</center></h1>
            <table className="assign-pro">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Booking ID</th>
                        <th>Customer Name</th>
                        <th>City</th>
                        <th>Service Name</th>
                        <th>Category</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.request_id}>
                            <td>{req.request_id}</td>
                            <td>{req.booking_id}</td>
                            <td>{req.customer_name}</td>
                            <td>{req.city}</td>
                            <td>{req.service_name}</td>
                            <td>{req.category}</td>
                            <td><button onClick={() => handleAssignProvider(req)}>Assign Provider</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        

    );
}

export default AssignProvider;