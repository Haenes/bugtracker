import { useContext } from "react";

import { useLoaderData } from "react-router-dom";

import { Card } from "antd";

import { ModalContext, ModalDataContext } from "./Page";


export function IssuesBoard() {
    const issues = useLoaderData();
    const handleClickModal = useContext(ModalContext);
    const setModalData = useContext(ModalDataContext);

    if (!issues) return "You don't have any issues for this project yet!"

    const toDo = issues.results.filter(issue => issue.status === "To do");
    const inProgress = issues.results.filter(issue => issue.status === "In progress");
    const done = issues.results.filter(issue => issue.status === "Done");

    const issueCard = (issueStatus) => {
        return (Array.from(issueStatus).map((_, i) => (
            <Card
                title={issueStatus[i].title}
                key={issueStatus[i].key}
                type="inner"
                size="small"
                hoverable
                className={
                    issueStatus[i+1] ?
                    "text-start mb-4" :
                    "text-start"
                }
                onClick={() => {
                    handleClickModal({visible: true, modalId: 3});
                    setModalData(issueStatus[i])
                }}
            >
                <div className="flex flex-col">
                    <i>{issueStatus[i].type}</i>
                    <i>{issueStatus[i].priority}</i>
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
