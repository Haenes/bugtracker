import { redirect } from "react-router";
import { userLogout } from "../../client/auth.js";


export async function logoutAction() {
    const res = await userLogout();
    return res.ok ? redirect("/login") : console.log(res);
}
