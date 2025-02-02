export const error503 = {status: 503, statusText: "Service Unavailable"};
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export async function userRegistration(data, language) {
    try {
        let rawResponse = await fetch(
            `${BACKEND_URL}/auth/register?client=browser&lang=${language}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function userVerification(token) {
    try {
        let rawResponse = await fetch(`${BACKEND_URL}/auth/verify`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"token": token})
        });
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function userForgotPassword(email, language) {
    try {
        let rawResponse = await fetch(
            `${BACKEND_URL}/auth/forgot-password?client=browser&lang=${language}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"  
                },
                body: JSON.stringify(email)
            }
        );

        return rawResponse;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function userResetPassword(password, token) {
    try {
        let rawResponse = await fetch(
            `${BACKEND_URL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({  
                    "token": token, "password": password
                })
            }
        )

        return rawResponse;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function userLogin(data) {
    try {
        let rawResponse = await fetch(`${BACKEND_URL}/auth/jwt/login`, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            credentials: "include",
            body: data
        });

        return rawResponse.ok ? rawResponse : await rawResponse.json();
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function userLogout() {
    try {
        let rawResponse = await fetch(`${BACKEND_URL}/auth/jwt/logout`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            credentials: "include",
        });

        return rawResponse;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function getMe() {
    try {
        let rawResponse = await fetch(`${BACKEND_URL}/users/me`, {
            headers: {
                "Accept": "application/json",
            },
            credentials: "include",
        });

        return rawResponse.json();
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function editMe(data) {
    try {
        let rawResponse = await fetch(`${BACKEND_URL}/users/me`, {
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        return rawResponse.json();
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function deleteMe() {
    try {
        let rawResponse = await fetch(`${BACKEND_URL}/users/me`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            },
            credentials: "include",
        });

        return rawResponse;
    } catch(err) {
        throw new Response("Error", error503);
    }
}