import { useState } from 'react';

import {Button, Select, Input} from 'antd';

import { Form, useFetcher } from "react-router";

import { convertDate } from "../PageLayout.jsx";

const { TextArea } = Input;


export function EditIssueForm({ issue, errors, setModalOpen }) {
    const fetcher = useFetcher();

    const [type, setType] = useState(issue.type);
    const [issueStatus, setIssueStatus] = useState(issue.status);
    const [priority, setPriority] = useState(issue.priority);

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", issueId: issue.id},
            {method: "POST"}
        )
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
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    defaultValue={issue.description}
                    className="my-3"
                    placeholder="Description is empty."
                    maxLength={255}
                />

                <div>
                    <span className="mr-5">Type:</span>
                    <Select
                        defaultValue={issue.type}
                        popupMatchSelectWidth={false}
                        options={[
                            {label: "Feature", value: "Feature"},
                            {label: "Bug", value: "Bug"}
                        ]}
                        onChange={value => setType(value)}
                    />
                    <input name="type" type="hidden" value={type} />
                </div>

                <div className="my-3">
                    <span className="mr-3">Status:</span>
                    <Select
                        defaultValue={issue.status}
                        popupMatchSelectWidth={false}
                        options={[
                            {label: "To do", value: "To do"},
                            {label: "In progress", value: "In progress"},
                            {label: "Done", value: "Done"}
                        ]}
                        onChange={value => setIssueStatus(value)}
                    />
                    <input name="status" type="hidden" value={issueStatus} />
                </div>

                <span className="mr-1.5">Priority:</span>
                <Select
                    defaultValue={issue.priority}
                    popupMatchSelectWidth={false}
                    options={[
                        {label: "Lowest", value: "Lowest"},
                        {label: "Low", value: "Low"},
                        {label: "Medium", value: "Medium"},
                        {label: "High", value: "High"},
                        {label: "Highest", value: "Highest"}
                    ]}
                    onChange={value => setPriority(value)}
                />
                <input name="priority" type="hidden" value={priority} />

                <div className="my-3">
                    <span className="mr-2">Created:</span>
                    {convertDate(issue.created)}
                </div>

                <div className="mb-4">
                    <span className="mr-1">Updated:</span>
                    {/* Get updated datetime from PATCH response to synchronize data */}
                    {errors?.created == issue.created ?
                    convertDate(errors.updated) :
                    convertDate(issue.updated)
                }
                </div>

                <div className="flex flex-row gap-3 justify-end">
                    <Button
                        danger
                        name="intent"
                        value="delete"
                        type="text"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>

                    <Button name="intent" value="edit" type="primary" htmlType="submit">
                        Change
                    </Button>
                </div>
            </div>
        </Form>
    );
}
