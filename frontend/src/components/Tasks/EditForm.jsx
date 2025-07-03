import { useEffect, useState } from 'react';

import { Button, Empty, Table, Select, Input, Popconfirm, Tabs } from 'antd';
import dayjs from 'dayjs';

import { Form, useFetcher } from "react-router";
import { useTranslation } from "react-i18next";

import { SelectAssignee } from "./SelectAssignee.jsx";
import { DeadlinePicker, getDateTimeFormat } from "./DeadlinePicker.jsx";
import { convertDate } from "../PageLayout.jsx";
import { getTaskChanges } from "../../client/base.js";

const { TextArea } = Input;


function EditTaskForm({ task, userId, roleId, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const isPermitted = task.assignee_id == userId || [1, 2].includes(roleId);
    
    const [assignee, setAssignee] = useState(task.assignee_id);
    const [type, setType] = useState(task.type_id);
    const [status, setStatus] = useState(task.status_id);
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
        <Form method="post" name="editTask">
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

            <SelectAssignee
                projectId={task.project_id}
                assignee={assignee}
                setAssignee={setAssignee}
                status={status}
                setStatus={setStatus}
            />

            <div className="grid grid-cols-2 justify-items-stretch">
                <label>{t("type")}</label>
                <label>{t("editTaskStatus")}</label>
            </div>

            <div className="grid grid-cols-2 justify-items-stretch mb-3">
                <Select
                    value={type}
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
                    value={status}
                    className="md:w-4/5"
                    disabled={!isPermitted}
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("taskStatusNotAssign"), value: 1},
                        {label: t("taskStatusToDo"), value: 2},
                        {label: t("taskStatusInProgress"), value: 3},
                        {label: t("taskStatusDone"), value: 4}
                    ]}
                    onChange={value => setStatus(value)}
                />
                <input name="status_id" type="hidden" value={status} />
            </div>

            <div className="grid grid-cols-2 justify-items-stretch">
                <label className="mr-2">{t("priority")}</label>
                <label>{t("deadline")}</label>
            </div>

            <div className="grid grid-cols-2 justify-items-stretch mb-3">
                <Select
                    value={priority}
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

                <DeadlinePicker
                    deadline={deadline}
                    setDeadline={setDeadline}
                    value={task.deadline_at}
                />
            </div>

            <div className="my-3">
                <label className="mr-2">{t("editCreated")}</label>
                {convertDate(task.created_at)}
            </div>

            <div className="mb-4">
                <label className="mr-2">{t("editUpdated")}</label>
                {/* Get updated datetime from PATCH response to synchronize data */}
                {errors?.created_at == task.created_at ?
                    convertDate(errors.updated_at) : convertDate(task.updated_at)
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


function TaskChanges({ projectId, taskId }) {
    const { t } = useTranslation();
    const [changes, setChanges] = useState([]);
    const [expandChanges, setExpandChanges] = useState([]);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title: t("operationId"),
            dataIndex: "operation_id",
            key: "operationId",
            align: "center"
        },
        {
            title: t("changedBy"),
            dataIndex: "changed_by",
            key: "changedBy",
            align: "center"
        },
        {
            title: t("createdAt"),
            dataIndex: "created_at",
            key: "createdAt",
            align: "center",
            render: (createdAt) => dayjs(createdAt).format(getDateTimeFormat())
        },
    ];
    const expandColumns = [
        {title: t("field"), dataIndex: "field", key: "field", align: "center"},
        {title: t("oldValue"), dataIndex: "old_value", key: "oldValue", align: "center"},
        {title: t("newValue"), dataIndex: "new_value", key: "newValue", align: "center"},
    ]
    const expandedRowRender = () => (
       <Table
            bordered
            columns={expandColumns}
            dataSource={expandChanges}
            pagination={false}
        />
    );

    const fetchChanges = async () => {
        setLoading(true);
        const changes = await getTaskChanges(projectId, taskId);

        if (!changes?.results) {
            for (let change of changes) {
                change.key = change.operation_id;
 
                setExpandChanges(change.changes.map((change) => ({
                    key: change.operation_id = change.field,
                    field: change.field,
                    old_value: change.old_value,
                    new_value: change.new_value
                })))
            };
        }

        setChanges(changes);
        setLoading(false);
    }

    useEffect(() => {fetchChanges()}, []);

    return (
        changes?.results ? <Empty description={t("noChanges")} />
        : <Table
            bordered
            loading={loading}
            rowClassName="text-center"
            columns={columns}
            expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
            dataSource={changes}
            pagination={false}
            size="small"
        />
    )
}

export function TaskDetails({ task, userId, roleId, errors, setModalOpen }) {
    const { t } = useTranslation();
    const items = [
        {
            label: t("taskDetails"),
            key: 1,
            children: <EditTaskForm
                task={task}
                userId={userId}
                roleId={roleId}
                errors={errors}
                setModalOpen={setModalOpen}
            />
        },
        {
            label: t("taskComments"),
            key: 2,
            children: "Work in Progress"
        },
        {
            label: t("taskChanges"),
            key: 3,
            children: <TaskChanges projectId={task.project_id} taskId={task.id} />
        },
    ];

    return (
        <Tabs tabPosition="top" items={items.map((_, i) => {return items[i]})} />
    )
}
