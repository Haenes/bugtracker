import { useLoaderData } from "react-router-dom";

import { Card } from "antd";


export function IssuesBoard() {
    const issues = useLoaderData();

    if (!issues) return "You don't have any issues for this project yet!"

    const listData = Array.from(issues.results).map((_, i) => ({
        id: issues.results[i].id,
        title: issues.results[i].title,
        description: issues.results[i].description,
        type: issues.results[i].type,
        priority: issues.results[i].priority,
        status: issues.results[i].status,
        key: issues.results[i].key,
        created: convertDate(issues.results[i].created),
        updated: convertDate(issues.results[i].updated)
    }));
    const toDo = listData.filter(issue => issue.status === "To do");
    const inProgress = listData.filter(issue => issue.status === "In progress");
    const done = listData.filter(issue => issue.status === "Done");

    const issueCard = (issueStatus) => {
        return (Array.from(issueStatus).map((_, i) => (
            <Card
                className={
                    issueStatus[i+1] ?
                    "text-start mb-4" :
                    "text-start"
                }
                key={issueStatus[i].key}
                type="inner"
                hoverable
                size="small"
                title={issueStatus[i].title}
            >
                <div className="flex flex-col">
                    <i>{issueStatus[i].type}</i>
                    <i>{issueStatus[i].priority}</i>
                    <i>{issueStatus[i].created}</i>
                </div>
            </Card>
        )));
    }

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-2 h-full text-center">
            <Card className="col-span-12 md:col-span-4" title="TO DO">
                {issueCard(toDo)}
            </Card>

            <Card className="col-span-12 md:col-span-4" title="IN PROGRESS">
                {issueCard(inProgress)}
            </Card>

            <Card className="col-span-12 md:col-span-4" title="DONE">
                {issueCard(done)}
            </Card>
        </div>
    );
}


function convertDate(date) {
    const dateObj = new Date(Date.parse(date));
    const dateFormat = new Intl.DateTimeFormat(
        ["ru-RU", "en-US"],
        {dateStyle: "short", timeStyle: "medium"}
    )

    return dateFormat.format(dateObj);
}
