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
                status={errors?.errorTaskNameAlreadyExist && "error"}
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
                <label>{t("editTaskStatus")}</label>
            </div>

            <div className="grid grid-cols-2 justify-items-stretch mb-3">
                <Select
                    defaultValue={task.type_id}
                    disabled={!isPermitted}
                    className="w-5/6"
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("taskTypeFeature"), value: 3},
                        {label: t("taskTypeMisc"), value: 4},
                        {label: t("taskTypeFix"), value: 2},
                        {label: t("taskTypeBug"), value: 1}
                    ]}
                    onChange={value => setType(value)}
                />
                <input name="type_id" type="hidden" value={type} />

                <Select
                    defaultValue={task.status_id}
                    disabled={!isPermitted}
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("taskStatusNotAssign"), value: 1},
                        {label: t("taskStatusToDo"), value: 2},
                        {label: t("taskStatusInProgress"), value: 3},
                        {label: t("taskStatusDone"), value: 4}
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
                        {label: t("taskPriorityLow"), value: 1},
                        {label: t("taskPriorityMedium"), value: 2},
                        {label: t("taskPriorityHigh"), value: 3},
                        {label: t("taskPriorityCritical"), value: 4}
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
                        title={t("confirmTitle")}
                        description={t("confirmDescription")}
                        cancelText={t("confirmCancel")}
                        okText={t("confirmOk")}
                        onConfirm={handleDelete}
                    >
                        <Button
                            danger
                            name="intent"
                            value="delete"
                            type="text"
                        >
                            {t("deleteBtn")}
                        </Button>
                    </Popconfirm>

                    <Button name="intent" value="edit" type="primary" htmlType="submit">
                        {t("changeBtn")}
                    </Button>
                </div>
                : <></>
            }
        </Form>
    );
}
