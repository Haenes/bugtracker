import { useRouteError } from "react-router";

export function ErrorBoundary() {
    const error = useRouteError();
    const colorMode = localStorage.getItem("colorMode");
    let className = "flex flex-row h-screen w-screen items-center justify-center ";

    return (
        <div
            id="error-page"
            className={
                colorMode === "dark" ?
                className + "text-white" : className
            }
        >
            <h1 className="text-center">
                <i className="font-medium">{error.status}</i>
                <i className="font-thin text-5xl px-2"> | </i>
                <i className="font-normal">{error.statusText}</i>
            </h1>
        </div>
    );
}
