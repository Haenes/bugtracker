import { useState } from 'react';

import { Button, Select, Input, Popconfirm } from 'antd';

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import { DeadlinePicker } from "./DeadlinePicker.jsx";
import { convertDate } from "../PageLayout.jsx";

const { TextArea } = Input;


export function EditTaskForm({ task, userId, roleId, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const isPermitted = task.assignee_id == userId || [1, 2].includes(roleId);

    const [type, setType] = useState(task.type_id);
    const [taskStatus, setTaskStatus] = useState(task.status_id);
    const [priority, setPriority] = useState(task.priority_id);
    const [deadline, setDeadline] = useState("");

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", taskId: task.id},
            {method: "POST"}
        );
    };

    return (
        <Form method="post" name="editTask" className="mt-4">
            <input name="taskId" value={task.id} type="hidden" />

            {errors?.editName ?
                <div className='text-center text-red-500'>
                    <span className='text-center text-red-500'>
                        {errors.editName}
                    </span>
                </div> : <></>
            }
            
            <label>{t("name")}</label>
            <Input
                name="name"
                className="mb-3"
                status={errors?.error_taskName && "error"}
                type="text"
                defaultValue={task.name}
                disabled={!isPermitted}
                required
                minLength={3}
                maxLength={100}
            />

            <label>{t("description")}</label>
            <TextArea
                name="description"
                className="mb-3"
                defaultValue={task.description}
                disabled={!isPermitted}
                placeholder={t("editEmptyDescription")}
            />

            <div className="grid grid-cols-2 justify-items-stretch">
                <label>{t("type")}</label>
                <label>{t("editTask_status")}</label>
            </div>

            <div className="grid grid-cols-2 justify-items-stretch mb-3">
                <Select
                    defaultValue={task.type_id}
                    disabled={!isPermitted}
                    className="w-5/6"
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("task_typeFeature"), value: 3},
                        {label: t("task_typeMisc"), value: 4},
                        {label: t("task_typeFix"), value: 2},
                        {label: t("task_typeBug"), value: 1}
                    ]}
                    onChange={value => setType(value)}
                />
                <input name="type_id" type="hidden" value={type} />

                <Select
                    defaultValue={task.status_id}
                    disabled={!isPermitted}
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("taskStatus_notAssign"), value: 1},
                        {label: t("taskStatus_toDo"), value: 2},
                        {label: t("taskStatus_inProgress"), value: 3},
                        {label: t("taskStatus_done"), value: 4}
                    ]}
                    onChange={value => setTaskStatus(value)}
                />
                <input name="status_id" type="hidden" value={taskStatus || 999} />
            </div>

            <div className="grid grid-cols-2 justify-items-stretch">
                <label className="mr-2">{t("priority")}</label>
                <label>{t("deadline")}</label>
            </div>

            <div className="grid grid-cols-2 justify-items-stretch mb-3">
                <Select
                    defaultValue={task.priority_id}
                    disabled={!isPermitted}
                    className="w-5/6"
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("task_priorityLow"), value: 1},
                        {label: t("task_priorityMedium"), value: 2},
                        {label: t("task_priorityHigh"), value: 3},
                        {label: t("task_priorityCritical"), value: 4}
                    ]}
                    onChange={value => setPriority(value)}
                />
                <input name="priority_id" type="hidden" value={priority} />

                <DeadlinePicker deadline={deadline} setDeadline={setDeadline} value={task.deadline_at} />
            </div>

            <div className="my-3">
                <label className="mr-2">{t("editCreated")}</label>
                {convertDate(task.created_at)}
            </div>

            <div className="mb-4">
                <label className="mr-2">{t("editUpdated")}</label>
                {/* Get updated datetime from PATCH response to synchronize data */}
                {errors?.created_at == task.created_at ?
                convertDate(errors.updated_at) :
                convertDate(task.updated_at)
            }
            </div>

            {isPermitted ? 
                <div className="flex flex-row gap-3 justify-end">
                    <Popconfirm
                        title={t("confirm_title")}
                        description={t("confirm_description")}
                        cancelText={t("confirm_cancel")}
                        okText={t("confirm_ok")}
                        onConfirm={handleDelete}
                    >
                        <Button
                            danger
                            name="intent"
                            value="delete"
                            type="text"
                        >
                            {t("btn_delete")}
                        </Button>
                    </Popconfirm>

                    <Button name="intent" value="edit" type="primary" htmlType="submit">
                        {t("btn_change")}
                    </Button>
                </div>
                : <></>
            }
        </Form>
    );
}
