import { useState } from "react";

import {
    useActionData,
    useOutletContext,
    useLoaderData,
    useFetcher,
    useFetchers
} from "react-router";

import { useTranslation } from "react-i18next";

import { Card, Empty, Spin } from "antd";

import { CreateModal } from "../ModalProvider.jsx";
import { CreateIssueForm } from "./CreateForm.jsx";
import { EditIssueForm } from "./EditForm.jsx";

export function IssuesBoard() {
    const issues = useLoaderData();
    const errors = useActionData();
    const fetchers = useFetchers();
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const createModalTitle = t("createIssue_header");
    const editModalTitle = t("issuesBoard_modalTitle");

    const [modalOpen, setModalOpen] = useOutletContext();
    const [formData, setFormData] = useState(null);

    if (!issues) {
        return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} >
                <CreateModal modalId={1} title={createModalTitle} errors={errors}>
                    <CreateIssueForm setModalOpen={setModalOpen} />
                </CreateModal>
            </Empty>
        );
    }

    const toDo = issues.results.filter(issue => issue.status === "To do");
    const inProgress = issues.results.filter(issue => issue.status === "In progress");
    const done = issues.results.filter(issue => issue.status === "Done");

    return (
        <div className="grid grid-cols-12 h-full gap-4 md:gap-2 text-center">
            {fetchers[0] && fetchers[0].state !== "idle" && <Spin fullscreen delay={50}/>}

            <StatusCard id="To do" title={t("issuesBoard_toDo")} fetcher={fetcher}>
                {IssueCard(toDo, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>

            <StatusCard
                id="In progress"
                title={t("issuesBoard_inProgress")}
                fetcher={fetcher}
            >
                {IssueCard(inProgress, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>

            <StatusCard
                id="Done"
                title={t("issuesBoard_done")}
                fetcher={fetcher}
            >
                {IssueCard(done, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>

            <CreateModal modalId={1} title={createModalTitle} errors={errors}>
                <CreateIssueForm errors={errors} setModalOpen={setModalOpen} />
            </CreateModal>

            <CreateModal modalId={2} title={editModalTitle} errors={errors}>
                <EditIssueForm
                    issue={formData}
                    errors={errors} 
                    setModalOpen={setModalOpen}
                />
            </CreateModal>
        </div>
    );
}


function StatusCard({ id, title, children, fetcher }) {
    const handlers = dragAndDropHandlers("status", fetcher);

    return (
        <Card
            id={id}
            className="col-span-12 md:col-span-4"
            title={title}
            classNames={{body: "status"}}
            onDrop={handlers.statusDrop}
            onDragOver={handlers.statusDragOver}
        >
            {children}
        </Card>
    );
}


function IssueCard(issueStatus, setModalOpen, setFormData, t, fetcher) {
    const handlers = dragAndDropHandlers("card", fetcher);

    return (issueStatus.map((issue, i) => (
        <Card
            id={issue.id}
            title={issue.title}
            key={issue.id}
            type="inner"
            size="small"
            hoverable
            draggable
            className={
                issueStatus[i + 1]
                ? "text-start mb-4"
                : "text-start"
            }
            onClick={() => {
                setModalOpen({visible: true, modalId: 2});
                setFormData(issue);
            }}
            onDragStart={handlers.cardDragStart}
            onDragOver={handlers.cardDragOver}
        >
            <div className="flex flex-col">
                <i>
                    {t("editIssue_type")} {t("issue_type" + issue.type)}
                </i>
                <i>
                    {t("editIssue_priority")} {t("issue_priority" + issue.priority)}
                </i>
            </div>
        </Card>
    )));
}


function dragAndDropHandlers(item, fetcher) {
    const statusDrop = (e) => {
        const cardId = e.dataTransfer.getData("cardId");
        const sourceStatus = e.dataTransfer.getData("sourceStatus");
        // Support drop inside the ant-card-body div (inner div of status card)
        // If this is the case, get the parent's ID.
        const targetStatus = e.target.id || e.target.offsetParent.id;

        // Can't block ability to drop the card to it's current status.
        // At least, don't make a request when this happens.
        if (sourceStatus != targetStatus) {
            fetcher.submit(
                {
                    intent: "edit",
                    issueId: cardId,
                    status: targetStatus
                },
                {method: "PATCH"}
            );
        }
    };
    const statusDragOver = (e) => {
        if (e.target.className !== "ant-card-head-title") {
            e.preventDefault();
        }
    };

    if (item === "status") return {statusDrop, statusDragOver};

    const cardDragStart = (e) => {
        e.dataTransfer.setData("cardId", e.target.id);
        e.dataTransfer.setData("sourceStatus", e.target.offsetParent.id);
    };
    const cardDragOver = (e) => e.stopPropagation();

    return {cardDragStart, cardDragOver};
}
