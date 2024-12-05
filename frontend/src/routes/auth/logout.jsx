import { replace  } from "react-router";
import { userLogout } from "../../client/auth.js";
import { authProvider } from "./authProvider.jsx";


export async function loader() {
    if (!authProvider.jwtLifetime) return replace("/login");
}


export async function action({ request }) {
    if (!authProvider.jwtLifetime) return replace("/login");

    const result = await userLogout();
    authProvider.signOut();

    const isSessionExpired = new URL(request.url)?.searchParams.get("sessionExpired");

    return result.ok && replace(
        isSessionExpired ? "/login?sessionExpired=true" : "/login"
    );
}
 