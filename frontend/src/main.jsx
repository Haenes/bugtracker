// import { createRoot } from 'react-dom/client'
import * as ReactDOM from "react-dom/client";

import { ConfigProvider, theme } from 'antd';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css'

import { Root } from "./routers/root.jsx";
import { Login } from "./routers/login.jsx";
import { Registration } from "./routers/registration.jsx";

import { ErrorPage } from "./components/ErrorPage.jsx";
import { Projects } from "./routers/projects.jsx";

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
    {
        path: "/projects",
        element: <Projects />,
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
