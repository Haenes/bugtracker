// import { createRoot } from 'react-dom/client'
// TODO: Change so that only what is needed is imported, if possible
import * as ReactDOM from "react-dom/client";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./index.css";

import { Root } from "./routes/root.jsx";
import { Registration, registerAction } from "./routes/auth/registration.jsx";
import { Login, loginAction } from "./routes/auth/login.jsx";
import { verifyAction } from "./routes/auth/verify.jsx";
import { logoutAction } from "./routes/auth/logout.jsx";

import { Projects, projectsLoader, projectsAction } from "./routes/projects.jsx";
import { Issues, issuesLoader, issuesAction } from "./routes/issues.jsx";

import { ErrorPage } from "./components/ErrorPage.jsx";
import { PageLayout } from "./components/PageLayout.jsx";


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
        path: "/verify/:token",
        errorElement: <ErrorPage />,
        loader: verifyAction
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
        element: <PageLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/projects",
                element: <Projects />,
                loader: projectsLoader,
                action: projectsAction,
            },
            {
                path: "/projects/:projectId/issues",
                element: <Issues />,
                loader: issuesLoader,
                action: issuesAction,
            },
        ]
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider
        router={router}
    />
);
