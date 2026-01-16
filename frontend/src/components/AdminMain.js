import React from "react";
import './AdminPage.css';

function AdminMain(){
    return(
        <main className="admin-main">
            <h2>Pending Service Requests</h2>
            <div className="placeholder-box">
                No pending requests at the moment.
            </div>
        </main>
    );
}

export default AdminMain;