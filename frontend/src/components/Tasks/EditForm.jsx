import { useState } from 'react';

import { Button, Select, Input, Popconfirm } from 'antd';

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import { convertDate } from "../PageLayout.jsx";

const { TextArea } = Input;


export function EditTaskForm({ task, userId, roleId, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();
    const isPermitted = task.assignee_id == userId || [1, 2].includes(roleId);
    const [type, setType] = useState(task.type_id);
    const [taskStatus, setTaskStatus] = useState(task.status_id);
    const [priority, setPriority] = useState(task.priority_id);

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", taskId: task.id},
            {method: "POST"}
        );
    };

    return (
        <Form method="post" name="editTask" className="grid grid-cols-2 gap-x-8 mt-4">
            <input name="taskId" value={task.id} type="hidden" />

            <div className="col-span-2">

                {errors?.editName ?
                    <div className='text-center text-red-500'>
                        <span className='text-center text-red-500'>
                            {errors.editName}
                        </span>
                    </div> : <></>
                }

                <Input
                    name="name"
                    status={errors?.editName && "error"}
                    type="text"
                    defaultValue={task.name}
                    disabled={!isPermitted}
                    required
                    minLength={3}
                    maxLength={100}
                />

                <TextArea
                    name="description"
                    defaultValue={task.description}
                    disabled={!isPermitted}
                    className="my-3"
                    placeholder={t("editTask_description")}
                />

                <div>
                    <span className="mr-2">{t("editTask_type")}</span>
                    <Select
                        className="w-1/3 md:w-1/3"
                        defaultValue={task.type_id}
                        disabled={!isPermitted}
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
                </div>

                <div className="my-3">
                    <span className="mr-2">{t("editTask_status")}</span>
                    <Select
                        className="w-2/5 md:w-1/3"
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

                <span className="mr-2">{t("editTask_priority")}</span>
                <Select
                    className="w-1/2 md:w-1/3"
                    defaultValue={task.priority_id}
                    disabled={!isPermitted}
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

                <div className="my-3">
                    <span className="mr-2">{t("editCreated")}</span>
                    {convertDate(task.created_at)}
                </div>

                <div className="mb-4">
                    <span className="mr-1">{t("editUpdated")}</span>
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
            </div>
        </Form>
    );
}
