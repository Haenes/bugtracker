// import { createRoot } from 'react-dom/client'
// TODO: Change so that only what is needed is imported, if possible
import * as ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

import { Root } from "./routes/root.jsx";
import { Registration, registerAction } from "./routes/auth/registration.jsx";
import { Login, loginAction } from "./routes/auth/login.jsx";
import { logoutAction } from "./routes/auth/logout.jsx";

import { Projects, projectsLoader, projectsAction } from "./routes/projects/main.jsx";
import { deleteProjectAction } from "./routes/projects/delete.jsx";
import { editProjectAction } from "./routes/projects/edit.jsx";

import { Issues, issuesLoader, issuesAction } from "./routes/issues/main.jsx";
import { deleteIssueAction } from "./routes/issues/delete.jsx";
import { editIssueAction } from "./routes/issues/edit.jsx";

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
        action: projectsAction,
        children: [
            {
                path: ":projectId/delete",
                action: deleteProjectAction,
            },
            {
                path: ":projectId/update",
                action: editProjectAction
            }
        ]
    },
    {
        path: "/projects/:projectId/issues",
        element: <Issues />,
        errorElement: <ErrorPage />,
        loader: issuesLoader,
        action: issuesAction,
        children: [
            {
                path: ":issueId/delete",
                action: deleteIssueAction,
            },
            {
                path: ":issueId/update",
                action: editIssueAction
            }
        ]
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
