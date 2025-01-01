import { replace } from "react-router";

import { searchItems } from "../client/base.js";


export async function loader() {
    // Separate page for search is WIP.
    // For now, redirect to projects page
    // to prevent a blank page.
    return replace("/projects");
}

export async function action({ request }) {
    const formData = await request.formData();
    return await searchItems(formData.get("q"));
}
