import { useActionData, useLoaderData } from "react-router";

import { Card, Empty } from "antd";

import { CreateModal, useModalContext, useModalDataContext } from "../ModalProvider.jsx";
import { CreateIssueForm } from "./CreateForm.jsx"
import { EditIssueForm } from "./EditForm.jsx";


export function IssuesBoard() {
    const issues = useLoaderData();
    const errors = useActionData();
    const modalTitle = "Issue";

    const [modalOpen, setModalOpen] = useModalContext();
    const [modalData, setModalData] = useModalDataContext();

    if (!issues) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

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
                    setModalOpen({visible: true, modalId: 2});
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

            <CreateModal modalId={1} title={modalTitle} errors={errors}>
                <CreateIssueForm errors={errors} setModalOpen={setModalOpen} />
            </CreateModal>

            <CreateModal modalId={2} title={modalTitle} errors={errors}>
                <EditIssueForm issue={modalData} errors={errors} setModalOpen={setModalOpen} />
            </CreateModal>
        </div>
    );
}
