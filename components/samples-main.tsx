import React from "react";
import ReactDOM from "react-dom";
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";

// ==== LAZY LOADING ====
const Samples = React.lazy(() => import("./samples/samples"));


// ==== RENDER ====
const samplesContainer = document.getElementById("samples-container");
if(samplesContainer){
    ReactDOM.render(
        <React.Suspense fallback={<div className="loading show"></div>}>
            <Samples />
        </React.Suspense>,
        samplesContainer,
    );
}
