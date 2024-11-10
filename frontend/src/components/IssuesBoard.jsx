import { useLoaderData } from "react-router-dom";

import { Card } from "antd";


export function IssuesBoard() {
    const issues = useLoaderData();
    console.log("ISSUES", issues)

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
    console.log("LIST DATA", listData)

    const issueType = ["TO DO", "IN PROGRESS", "DONE"];

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-2 h-full text-center">
            <Card className="col-span-12 md:col-span-4" title="TO DO">
                <Card
                    className="text-start"
                    type="inner"
                    hoverable
                    size="small"
                    title={listData[0].title}
                    extra={<a href="#">More</a>}
                >
                    <div className="flex flex-col">
                        <i>{listData[0].type}</i>
                        <i>{listData[0].priority}</i>
                        <i>{listData[0].created}</i>
                    </div>
                </Card>

            </Card>

            <Card className="col-span-12 md:col-span-4" title="IN PROGRESS">

            </Card>

            <Card className="col-span-12 md:col-span-4" title="DONE">

            </Card>
        </div>

        // Need to write inner loop with condition to check status of the issue and place it 
        // OR leave status cards as above + loop for inner cards (issues)

        // <div className="grid grid-cols-12 gap-4 md:gap-2 h-screen text-center">
        //     {Array.from(issueType).map((_, i) => (
        //         <Card className="col-span-12 md:col-span-4" title={issueType[i]}>
        //         </Card>
        //     ))}
        // </div>
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
