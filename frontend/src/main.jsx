// import { createRoot } from 'react-dom/client'
import * as ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css'
import App from './App.jsx'

import { Root } from "./routers/root.jsx";
import { Login } from "./routers/login.jsx";
import { Registration } from "./routers/registration.jsx";

import { ErrorPage } from "./components/ErrorPage.jsx";

// createRoot(document.getElementById('root')).render(<App />)

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Registration />,
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
