import * as ReactDOM from "react-dom/client";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { ConfigProvider, Layout, theme } from 'antd';

import "./index.css";
import "./i18n/config.js";


const getColorMode = () => {
    const isAlredySet = localStorage.getItem("colorMode");

    // Handle case, when user change color mode via switcher.
    if (isAlredySet === "dark") {
        return theme.darkAlgorithm;
    } else if (isAlredySet === "light") {
        return theme.defaultAlgorithm;
    }

    // Default case, set default color mode based on user OS theme.
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        localStorage.setItem("colorMode", "dark");
        return theme.darkAlgorithm;
    } else {
        localStorage.setItem("colorMode", "light");
        return theme.defaultAlgorithm;
    }
};

const router = createBrowserRouter([
    {
        lazy: () => import("./components/ErrorPage.jsx"),
        children: [
            {
                path: "/",
                lazy: () => import("./routes/root.jsx"),
            },
            {
                path: "/register",
                lazy: () => import("./routes/auth/registration.jsx"),
            },
            {
                path: "/verify/:token",
                lazy: () => import("./routes/auth/verify.jsx"),
            },
            {
                path: "/forgot-pasword",
                lazy: () => import("./routes/password/forgotPassword.jsx"),
            },
            {
                path: "/reset-password/:token",
                lazy: () => import("./routes/password/resetPassword.jsx"),
            },
            {
                path: "/login",
                lazy: () => import("./routes/auth/login.jsx"),
            },
            {
                path: "/logout",
                lazy: () => import("./routes/auth/logout.jsx"),
            },
            {
                lazy: () => import("./components/PageLayout.jsx"),
                children: [
                    // Add another ErrorPage as pathless route,
                    // for use inside PageLayout Outlet. Thus,
                    // in case of an error, the sidebar will be visible. 
                    {
                        lazy: () => import("./components/ErrorPage.jsx"),
                        children: [
                            {
                                path: "/projects",
                                lazy: () => import("./routes/projects.jsx"),
                            },
                            {
                                path: "/projects/:projectId/issues",
                                lazy: () => import("./routes/issues.jsx"),
                            },
                        ]
                    },
                ]
            },
        ]
    },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
    <ConfigProvider theme={{algorithm: getColorMode()}}>
        <Layout>
            <RouterProvider router={router} />
        </Layout>
    </ConfigProvider>
);
