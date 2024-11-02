export async function userRegistration(data) {
    try {
        let rawResponse = await fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        console.log(err);
    }
}


export async function userLogin(data) {
    try {
        let rawResponse = await fetch("http://127.0.0.1:8000/auth/jwt/login", {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            credentials: "include",
            body: data
        });

        return rawResponse.ok ? rawResponse : rawResponse.json();
    } catch(err) {
        throw new Response("Error", {status: 503, statusText: "Service Unavailable"});
    }
}


export async function userLogout() {
    try {
        let rawResponse = await fetch("http://127.0.0.1:8000/auth/jwt/logout", {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            credentials: "include",
        });

        return rawResponse;
    } catch(err) {
        console.log(err);
    }
}
