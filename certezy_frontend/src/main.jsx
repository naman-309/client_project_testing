import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import store from "@/app/store";
import { injectStore } from "@/services/api";
import App from "@/App";

import "nprogress/nprogress.css";
import "@/styles/nprogress-custom.css";
import "./index.css";

injectStore(store);

// Lazy-loaded route chunks can 404 after a new deploy if a tab is stale.
// Reload once to fetch the fresh index.html and chunk names.
window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);
