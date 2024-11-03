// import { createRoot } from 'react-dom/client'
// TODO: Change so that only what is needed is imported, if possible
import * as ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css'

import { Root } from "./routers/root.jsx";
import { Login, loginAction } from "./routers/login.jsx";
import { registerAction, Registration } from "./routers/registration.jsx";

import { ErrorPage } from "./components/ErrorPage.jsx";
import { Projects } from "./routers/projects.jsx";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <ErrorPage />,
        action: loginAction,
    },
    {
        path: "/register",
        element: <Registration />,
        errorElement: <ErrorPage />,
        action: registerAction,
    },
    {
        path: "/projects",
        element: <Projects />,
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
