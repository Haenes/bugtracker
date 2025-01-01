import { useState } from "react";

import {
    useActionData,
    useOutletContext,
    useLoaderData,
} from "react-router";

import { useTranslation } from "react-i18next";

import { Card, Empty } from "antd";

import { createModal } from "../ModalProvider.jsx";


export function IssuesBoard() {
    const issues = useLoaderData();
    const errors = useActionData();
    const { t } = useTranslation();

    const modalTitle = t("issuesBoard_modalTitle");

    const [modalOpen, setModalOpen] = useOutletContext();
    const [formData, setFormData] = useState(null);

    if (!issues) {
        return (
            <>
                {createModal(1, "createIssue", modalTitle, errors)}
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </>
        );
    }

    const toDo = issues.results.filter(issue => issue.status === "To do");
    const inProgress = issues.results.filter(issue => issue.status === "In progress");
    const done = issues.results.filter(issue => issue.status === "Done");

    const issueCard = (issueStatus) => {
        return (issueStatus.map((issue, i) => (
            <Card
                title={issue.title}
                key={issue.id}
                type="inner"
                size="small"
                hoverable
                className={
                    issueStatus[i + 1] ?
                    "text-start mb-4" :
                    "text-start"
                }
                onClick={() => {
                    setModalOpen({visible: true, modalId: 2});
                    setFormData(issue)
                }}
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
    };

    return (
        <div className="grid grid-cols-12 h-full gap-4 md:gap-2 text-center">
            <Card autoFocus className="focus-visible:focus:*: col-span-12 md:col-span-4" title={t("issuesBoard_toDo")}>
                {issueCard(toDo)}
            </Card>

            <Card className="col-span-12 md:col-span-4" title={t("issuesBoard_inProgress")}>
                {issueCard(inProgress)}
            </Card>

            <Card className="col-span-12 md:col-span-4" title={t("issuesBoard_done")}>
                {issueCard(done)}
            </Card>

            {createModal(1, "createIssue",  modalTitle, errors)}
            {createModal(2, "editIssue", modalTitle, errors, formData)}
        </div>
    );
}
