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
    } else if (fetcher.data?.projects || fetcher.data?.tasks) {
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
    const tasks = jsxResults.jsxTasks;

    return (
        <>
            {projects.length > 0 &&
                <>
                    <span className="mt-3">{t("projectsList_header")}:</span>
                    {projects}
                </>
            }
            {tasks.length > 0 &&
                <>
                    <span className={projects.length >= 0 && "mt-3"}>
                        {t("tasksBoard_header")}:
                    </span>
                    {tasks}
                </>
            }
        </>
    );
}


function convertResultsToJsx(plainResults, handleClick, isSearchPage) {
    let jsxProjects = [];
    let jsxTasks = [];

    const fillResultsArray = (array, item) => {
        let url_part;

        if (item?.name) {
            url_part = item.name + "-" + item.id;
        } else {
            url_part = item.project_name + "-" + item.project_id;
        }

        array.push(
            <li key={item.id}>
                <Link
                    to={`/projects/${url_part}/tasks`}
                    onClick={handleClick}
                >
                    {/* TODO: Нужно разобраться с этим, ибо у задач теперь нет поля title! */}
                    {/* {item?.name || item?.title} {item?.key && `[${item.key}]`} */}
                    {item?.name && item?.key || item?.name} {item?.key && `[${item.key}]`}
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

    if (plainResults?.tasks) {
        for (let task of plainResults.tasks) {
            if (jsxTasks.length >= 5 && !isSearchPage) break;
            fillResultsArray(jsxTasks, task);
        }
    }

    return {jsxProjects, jsxTasks};
}


function allResultsLink(results, searchQuery, t, handleClick) {
    const isNeedFullPage = (results) => {
        if (results?.projects) {
            return results.projects.length > 5;
        } else if (results?.tasks) {
            return results.tasks.length > 5;
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
