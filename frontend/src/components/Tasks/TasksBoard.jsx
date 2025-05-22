import { useState } from "react";

import {
    useActionData,
    useOutletContext,
    useLoaderData,
    useFetcher,
    useFetchers
} from "react-router";

import { useTranslation } from "react-i18next";

import { Button, Card, Empty, Spin } from "antd";

import { CreateModal } from "../ModalProvider.jsx";
import { CreateTaskForm } from "./CreateForm.jsx";
import { EditTaskForm } from "./EditForm.jsx";

export function TasksBoard() {
    const {tasks, userId} = useLoaderData();
    const roleId = tasks.role_id;
    const isPermitted = [1, 2].includes(roleId);
    const errors = useActionData();
    const fetchers = useFetchers();
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const createModalTitle = t("createTask_header");
    const editModalTitle = t("tasksBoard_modalTitle");

    const [modalOpen, setModalOpen] = useOutletContext();
    const [formData, setFormData] = useState(null);

    if (!tasks) {
        return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} >
                {isPermitted ?
                    <CreateModal modalId={1} title={createModalTitle} errors={errors}>
                        <CreateTaskForm errors={errors} setModalOpen={setModalOpen} />
                    </CreateModal>
                    : <></>
                }
            </Empty>
        );
    }

    const notAssign = tasks.results.filter(task => task.status === "Not assign");
    const toDo = tasks.results.filter(task => task.status === "To do");
    const inProgress = tasks.results.filter(task => task.status === "In progress");
    const done = tasks.results.filter(task => task.status === "Done");

    return (
        <div className="grid grid-cols-12 h-full gap-4 md:gap-2 text-center">
            {fetchers[0] && fetchers[0].state !== "idle" && <Spin fullscreen delay={50}/>}

            <StatusCard id={1} title={t("taskStatus_notAssign").toUpperCase()} fetcher={fetcher}>
                {TaskCard(notAssign, userId, isPermitted, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>

            <StatusCard id={2} title={t("taskStatus_toDo").toUpperCase()} fetcher={fetcher}>
                {TaskCard(toDo, userId, isPermitted, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>

            <StatusCard
                id={3}
                title={t("taskStatus_inProgress").toUpperCase()}
                fetcher={fetcher}
            >
                {TaskCard(inProgress, userId, isPermitted, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>

            <StatusCard
                id={4}
                title={t("taskStatus_done").toUpperCase()}
                fetcher={fetcher}
            >
                {TaskCard(done, userId, isPermitted, setModalOpen, setFormData, t, fetcher)}
            </StatusCard>
            
            {isPermitted ?
                <CreateModal modalId={1} title={createModalTitle} errors={errors}>
                    <CreateTaskForm errors={errors} setModalOpen={setModalOpen} />
                </CreateModal>
                : <></>
            }

            <CreateModal modalId={2} title={editModalTitle} errors={errors}>
                <EditTaskForm
                    task={formData}
                    userId={userId}
                    roleId={roleId}
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
            className="col-span-12 md:col-span-3"
            title={title}
            classNames={{body: "status"}}
            onDrop={handlers.statusDrop}
            onDragOver={handlers.statusDragOver}
        >
            {children}
        </Card>
    );
}


function TaskCard(taskStatus, userId, isPermitted, setModalOpen, setFormData, t, fetcher) {
    const handlers = dragAndDropHandlers("card", fetcher);

    return (taskStatus.map((task, i) => (
        <Card
            id={task.id}
            title={task.name}
            key={task.id}
            type="inner"
            size="small"
            hoverable
            draggable={task.assignee_id == userId || isPermitted}
            className={
                taskStatus[i + 1]
                ? "text-start mb-4"
                : "text-start"
            }
            onClick={() => {
                setModalOpen({visible: true, modalId: 2});
                setFormData(task);
            }}
            onDragStart={handlers.cardDragStart}
            onDragOver={handlers.cardDragOver}
        >
            <div className="flex flex-col">
                <i>
                    {t("editTask_type")} {t("task_type" + task.type)}
                </i>
                <i>
                    {t("editTask_priority")} {t("task_priority" + task.priority)}
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
                    taskId: cardId,
                    status_id: targetStatus
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
