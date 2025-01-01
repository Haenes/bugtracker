import { Link, useFetcher} from "react-router";

import { useTranslation } from "react-i18next";

import { Input } from "antd";

const { Search } = Input;


export function SearchForm({ setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const handleChange = (event) => {
        if (event.currentTarget.value.length >= 3) {
            fetcher.submit(
                {"q": event.currentTarget.value},
                {method:"POST", action: "/search"}
            )
        }
    };

    return (
        <>
            <fetcher.Form method="POST" action="/search">
                <Search
                    name="q"
                    type="search"
                    placeholder={t("search_title")}
                    required
                    allowClear
                    loading={fetcher.state === "submitting" & 5}
                    minLength={3}
                    onChange={(e) => handleChange(e)}
                />
            </fetcher.Form>

            {fetcher.data &&
                <div className="mt-3">
                    {displaySearchResults(t, fetcher.data, setModalOpen)}
                </div>
            }
        </>
    );
}


function displaySearchResults(t, results, setModalOpen) {
    // const { t } = useTranslation();

    let projects = [];
    let issues = [];

    const handleClick = () => {
        setModalOpen({visible: false, modalId: 4});
    };

    if (results?.projects) {
        for (let project of results.projects) {
            if (projects.length >= 5) {
                break;
            }

            projects.push(
                <Link
                    key={project.id}
                    to={`/projects/${project.id}/issues`}
                    onClick={handleClick}
                >
                    {project.name}
                </Link>
            );
        }
    }

    if (results?.issues) {
        for (let issue of results.issues) {
            if (issues.length >= 5) {
                break;
            }

            issues.push(
                <Link
                    key={issue.id}
                    to={`/projects/${issue.project_id}/issues`}
                    onClick={handleClick}
                >
                    {issue.title}
                </Link>
            );
        }
    }

    return (
        <div className="flex flex-col text-base">
            {results?.detail &&
                <div className="text-center">
                    <span>No results</span>
                </div>
            }
            {projects.length > 0 &&
                <div className="flex flex-col">
                    <span>{t("projectsList_header")}:</span>
                    {projects}
                </div>
            }
            {issues.length > 0 &&
                <div
                    className={projects.length > 0
                        ? "flex flex-col mt-3"
                        : "flex flex-col"
                    }
                >
                    <span>{t("issuesBoard_header")}:</span>
                    {issues}
                </div>
            }
        </div>
    );
}
