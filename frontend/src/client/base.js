export async function getItems(page, limit, project_id = null) {
    const url = urlGetCreateHelper(project_id, page, limit);

    try {
        let rawResponse = await fetch(url, {credentials: "include"});
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        console.log(err);
    }
}


export async function createItem(data, project_id = null) {
    const url = urlGetCreateHelper(project_id);

    try {
        let rawResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        let response = await rawResponse.json();
        return response;
    } catch(err) {
        console.log(err);
    }
}


export async function getItem(project_id, issue_id = null) {
    const url = urlSingleHelper(project_id, issue_id);

    try {
        let rawResponse = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        let response = await rawResponse.json();
        return response;
    } catch(err) {
        console.log(err);
    }
}


export async function updateItem(data, project_id, issue_id = null) {
    const url = urlSingleHelper(project_id, issue_id);

    try {
        let rawResponse = await fetch(url, {
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        let response = await rawResponse.json();
        return response;
    } catch(err) {
        console.log(err);
    }
}


export async function deleteItem(project_id, issue_id = null) {
    const url = urlSingleHelper(project_id, issue_id);

    try {
        let rawResponse = await fetch(url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        let response = await rawResponse.json();
        return response;
    } catch(err) {
        console.log(err);
    }
}


function urlSingleHelper(project_id, issue_id) {
    let url = "http://127.0.0.1:8000/projects";

    if (issue_id) {
        url = `${url}/${project_id}/issues/${issue_id}`
    } else {
        url = `${url}/${project_id}`
    }

    return url
}


function urlGetCreateHelper(project_id, page, limit) {
    let url = "http://127.0.0.1:8000/projects";

    const pagination = new URLSearchParams([
        ["page", page],
        ["limit", limit]
    ]);

    if (project_id) {
        url = `${url}/${project_id}/issues/?${pagination}`;
    }
    url = `${url}?${pagination}`;

    return url;
}
