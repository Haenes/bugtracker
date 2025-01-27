import { useState } from 'react';

import { Button, Select, Input, Popconfirm } from 'antd';

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import { convertDate } from "../PageLayout.jsx";

const { TextArea } = Input;


export function EditIssueForm({ issue, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const [type, setType] = useState(issue.type);
    const [issueStatus, setIssueStatus] = useState(issue.status);
    const [priority, setPriority] = useState(issue.priority);

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", issueId: issue.id},
            {method: "POST"}
        );
    };

    return (
        <Form method="post" name="editIssue" className="grid grid-cols-2 gap-x-8 mt-4">
            <input name="issueId" value={issue.id} type="hidden" />

            <div className="col-span-2">

                {errors?.editTitle ?
                    <div className='text-center text-red-500'>
                        <span className='text-center text-red-500'>
                            {errors.editTitle}
                        </span>
                    </div> : <></>
                }

                <Input
                    name="title"
                    status={errors?.editTitle && "error"}
                    type="text"
                    defaultValue={issue.title}
                    required
                    minLength={3}
                    maxLength={255}
                />

                <TextArea
                    name="description"
                    defaultValue={issue.description}
                    className="my-3"
                    placeholder={t("editIssue_description")}
                    maxLength={255}
                />

                <div>
                    <span className="mr-2">{t("editIssue_type")}</span>
                    <Select
                        defaultValue={issue.type}
                        className="w-1/3 md:w-1/5"
                        popupMatchSelectWidth={false}
                        options={[
                            {label: t("issue_typeFeature"), value: "Feature"},
                            {label: t("issue_typeBug"), value: "Bug"}
                        ]}
                        onChange={value => setType(value)}
                    />
                    <input name="type" type="hidden" value={type} />
                </div>

                <div className="my-3">
                    <span className="mr-2">{t("editIssue_status")}</span>
                    <Select
                        defaultValue={issue.status}
                        className="w-2/5 md:w-1/4"
                        popupMatchSelectWidth={false}
                        options={[
                            {label: t("issue_statusToDo"), value: "To do"},
                            {label: t("issue_statusInProgress"), value: "In progress"},
                            {label: t("issue_statusDone"), value: "Done"}
                        ]}
                        onChange={value => setIssueStatus(value)}
                    />
                    <input name="status" type="hidden" value={issueStatus} />
                </div>

                <span className="mr-2">{t("editIssue_priority")}</span>
                <Select
                    defaultValue={issue.priority}
                    className="w-1/2 md:w-1/3"
                    popupMatchSelectWidth={false}
                    options={[
                        {label: t("issue_priorityLowest"), value: "Lowest"},
                        {label: t("issue_priorityLow"), value: "Low"},
                        {label: t("issue_priorityMedium"), value: "Medium"},
                        {label: t("issue_priorityHigh"), value: "High"},
                        {label: t("issue_priorityHighest"), value: "Highest"}
                    ]}
                    onChange={value => setPriority(value)}
                />
                <input name="priority" type="hidden" value={priority} />

                <div className="my-3">
                    <span className="mr-2">{t("editCreated")}</span>
                    {convertDate(issue.created)}
                </div>

                <div className="mb-4">
                    <span className="mr-1">{t("editUpdated")}</span>
                    {/* Get updated datetime from PATCH response to synchronize data */}
                    {errors?.created == issue.created ?
                    convertDate(errors.updated) :
                    convertDate(issue.updated)
                }
                </div>

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
            </div>
        </Form>
    );
}
