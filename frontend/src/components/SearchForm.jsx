import { useState } from "react";

import {
    Link,
    useFetcher,
    useLocation,
    useRouteLoaderData
} from "react-router";

import { useTranslation } from "react-i18next";

import { Input } from "antd";

const { Search } = Input;


export function SearchForm({ setModalOpen }) {
    const fetcher = useFetcher();
    const loaderData = useRouteLoaderData("search");
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    const handleChange = (event) => {
        if (event.currentTarget.value.length >= 3) {
            fetcher.submit(
                {"q": event.currentTarget.value},
                {method:"POST", action: "/search"}
            )
        }
    };

    const handleClick = () => {
        setModalOpen({visible: false, modalId: 4});
    };

    return (
        <>
            <fetcher.Form method="POST" action="/search">
                <Search
                    name="q"
                    type="search"
                    placeholder={t("search_title")}
                    defaultValue={loaderData?.searchQuery}
                    required
                    allowClear
                    loading={fetcher.state === "submitting" & 5}
                    minLength={3}
                    maxLength={50}
                    onChange={(e) => {
                        setSearchQuery(e.currentTarget.value);
                        handleChange(e);
                    }}
                />
            </fetcher.Form>

            {showSearchResults(fetcher, loaderData, t, handleClick, searchQuery)}
        </>
    );
}


function showSearchResults(fetcher, loaderData, t, handleClick, searchQuery) {
    const isSearchPage = useLocation().pathname !== "/search";
    let results;
    let linkToAllResults;

    if (fetcher.data?.detail) {
        return (
            <div className="flex flex-col text-base">
                <span className="text-center mt-3">
                    {t("search_noResults")}
                </span>
            </div>
        );
    } else if (fetcher.data?.projects || fetcher.data?.issues) {
        results = displaySearchResults(fetcher.data, t, handleClick, false);
        linkToAllResults = isSearchPage && allResultsLink(
            fetcher.data, searchQuery, t, handleClick
        );
    } else if (loaderData?.searchResults) {
        results = displaySearchResults(loaderData.searchResults, t, handleClick, true);
    }

    return (
        <div className="flex flex-col text-base">
            {results}
            {linkToAllResults}
        </div>
    )
}


function displaySearchResults(plainResults, t, handleClick, isSearchPage) {
    const jsxResults = convertResultsToJsx(plainResults, handleClick, isSearchPage);
    const projects = jsxResults.jsxProjects;
    const issues = jsxResults.jsxIssues;

    return (
        <>
            {projects.length > 0 &&
                <>
                    <span className="mt-3">{t("projectsList_header")}:</span>
                    {projects}
                </>
            }
            {issues.length > 0 &&
                <>
                    <span className={projects.length >= 0 && "mt-3"}>
                        {t("issuesBoard_header")}:
                    </span>
                    {issues}
                </>
            }
        </>
    );
}


function convertResultsToJsx(plainResults, handleClick, isSearchPage) {
    let jsxProjects = [];
    let jsxIssues = [];

    const fillResultsArray = (array, item) => {
        array.push(
            <li key={item.id}>
                <Link
                    to={`/projects/${item.project_id || item.id}/issues`}
                    onClick={handleClick}
                >
                    {item.name || item.title} {item?.key && `[${item.key}]`}
                </Link>
            </li>
        );
    }

    if (plainResults?.projects) {
        for (let project of plainResults.projects) {
            if (jsxProjects.length >= 5 && !isSearchPage) break;
            fillResultsArray(jsxProjects, project)
        }
    }

    if (plainResults?.issues) {
        for (let issue of plainResults.issues) {
            if (jsxIssues.length >= 5 && !isSearchPage) break;
            fillResultsArray(jsxIssues, issue);
        }
    }

    return {jsxProjects, jsxIssues};
}


function allResultsLink(results, searchQuery, t, handleClick) {
    const isNeedFullPage = (results) => {
        if (results?.projects) {
            return results.projects.length > 5;
        } else if (results?.issues) {
            return results.issues.length > 5;
        }
    };

    if (isNeedFullPage(results)) {
        return (
            <span className="text-end">
                <Link
                    to={`/search?q=${searchQuery}`}
                    onClick={handleClick}
                >
                    {t("search_allResults")}
                </Link>
            </span>
        );
    }
}
