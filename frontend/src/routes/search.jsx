import { useTranslation } from "react-i18next";

import { searchItems } from "../client/base.js";
import { PageContent } from "../components/PageContent.jsx";
import { SearchForm } from "../components/SearchForm.jsx";


export function Component() {
    const { t } = useTranslation();

    return (
        <PageContent header={t("search_header")}>
            <div className="md:w-1/2">
                <SearchForm />
            </div>
        </PageContent>
    );
}


export async function loader({ request }) {   
    const searchQuery = new URL(request.url)?.searchParams.get("q");

    if (searchQuery) {
        const searchResults = await searchItems(searchQuery);
        return {searchQuery, searchResults};
    }
}


export async function action({ request }) {
    const formData = await request.formData();
    return await searchItems(formData.get("q"));
}
