import React from "react";
import ReactDOM from "react-dom";
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";
import GiftCard from "./giftcard/giftcard";

// ==== LAZY LOADING ====
const giftcard = React.lazy(() => import("./giftcard/giftcard"));


// ==== RENDER ====
const giftcardContainer = document.getElementById("giftcard-container");
if(giftcardContainer){
    ReactDOM.render(
        <React.Suspense fallback={<div className="loading show"></div>}>
            <GiftCard />
        </React.Suspense>,
        giftcardContainer,
    );
}
