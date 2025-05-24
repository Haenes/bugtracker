import { error503, BACKEND_URL } from "./auth.js";


export async function getItems(page, limit, project_id = null) {
    const url = urlGetAllHelper(page, limit, project_id);

    try {
        let rawResponse = await fetch(url, {credentials: "include"});
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function getProjectUsers(projectId) {
    const url = `${BACKEND_URL}/projects/${projectId}/users`;

    try {
        let rawResponse = await fetch(url, {credentials: "include"});
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function getItem(project_id) {
    const url = urlSingleHelper(project_id);

    try {
        let rawResponse = await fetch(url, {credentials: "include"});
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function searchItems(q) {
    const url = `${BACKEND_URL}/search?q=${q}`;

    try {
        let rawResponse = await fetch(url, {credentials: "include"});
        let response = await rawResponse.json();

        return response;
    } catch(err) {
        throw new Response("Error", error503);
    }
}


export async function createItem(data, project_id = null) {
    const url = urlCreateHelper(project_id);

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
        throw new Response("Error", error503);
    }
}


export async function updateItem(data, project_id, task_id = null) {
    const url = urlSingleHelper(project_id, task_id);

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
        throw new Response("Error", error503);
    }
}


export async function deleteItem(project_id, task_id = null) {
    const url = urlSingleHelper(project_id, task_id);

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
        throw new Response("Error", error503);
    }
}


/**
 * Returns the API endpoint for the one item
 * to get, update or delete it.
 * @param {string | number} project_id 
 * @param {string | number} task_id 
 * @returns url
 */
function urlSingleHelper(project_id, task_id) {
    let url = `${BACKEND_URL}/projects`;

    if (task_id) {
        url += `/${project_id}/tasks/${task_id}`
    } else {
        url += `/${project_id}`
    }

    return url
}


/**
 * Returns the API endpoint for getting all items (GET only).
 * @param {string | number} page 
 * @param {string | number} limit 
 * @param {string | number} project_id 
 * @returns url
 */
function urlGetAllHelper(page, limit, project_id) {
    let url = `${BACKEND_URL}/projects`;

    const pagination = new URLSearchParams([
        ["page", page],
        ["limit", limit]
    ]);

    if (project_id) {
        url += `/${project_id}/tasks?${pagination}`;
    } else {
        url += `?${pagination}&with_users=True`;
    }

    return url;
}


/**
 * Returns the API endpoint for creating single item.
 * @param {string | number} project_id 
 * @returns url
 */
function urlCreateHelper(project_id) {
    let url = `${BACKEND_URL}/projects`;

    if (project_id) {
        url += `/${project_id}/tasks`;
    }

    return url;
}
