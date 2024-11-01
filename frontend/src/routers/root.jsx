import { Link } from "react-router-dom";


export function Root() {
    return (
        <div>
            <p>Hello root!</p>
            <p>In the future, it will be a landing page, but for now it is...</p>
            <p><Link to="login">Login</Link></p>
            <p><Link to="register">Register</Link></p>
        </div>
    );
}
