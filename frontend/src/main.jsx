// import { createRoot } from 'react-dom/client'
// TODO: Change so that only what is needed is imported, if possible
import * as ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

import { Root } from "./routes/root.jsx";
import { Registration, registerAction } from "./routes/registration.jsx";
import { Login, loginAction } from "./routes/login.jsx";
import { logoutAction } from "./routes/logout.jsx";
import { Projects, projectsLoader, projectsAction } from "./routes/projects.jsx";
import { Issues, issuesLoader, issuesAction } from "./routes/issues.jsx";

import { ErrorPage } from "./components/ErrorPage.jsx";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/register",
        element: <Registration />,
        errorElement: <ErrorPage />,
        action: registerAction,
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <ErrorPage />,
        action: loginAction,
    },
    {
        path: "/logout",
        errorElement: <ErrorPage />,
        action: logoutAction
    },
    {
        path: "/projects",
        element: <Projects />,
        errorElement: <ErrorPage />,
        loader: projectsLoader,
        action: projectsAction
    },
    {
        path: "/projects/:projectId/issues",
        element: <Issues />,
        loader: issuesLoader,
        action: issuesAction
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
