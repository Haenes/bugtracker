import { Link } from "react-router";


export function Root() {
    return (
        <div className="m-2">
            <p>Hello root!</p>
            <p>In the future, it will be a landing page or smth, but for now it is... this</p>
            <p><Link to="login">Login</Link></p>
            <p><Link to="register">Register</Link></p>
            <p><Link to="projects">Projects</Link></p>
        </div>
    );
}
