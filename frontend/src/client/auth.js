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
    let formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }

    try {
        let rawResponse = await fetch("http://127.0.0.1:8000/auth/jwt/login", {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            credentials: "include",
            body: formData
        });

        return rawResponse;
    } catch(err) {
        console.log(err);
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
