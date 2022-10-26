import React from "react";
import ReactDOM from "react-dom";
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";

// ==== LAZY LOADING ====
const Booking = React.lazy(() => import("./booking/booking"));


// ==== RENDER ====
const bookingContainer = document.getElementById("booking-container");

if(bookingContainer){
    ReactDOM.render(
        <React.Suspense fallback={<div className="loading show"></div>}>
                <Booking />
        </React.Suspense>,
        bookingContainer,
    );
}
