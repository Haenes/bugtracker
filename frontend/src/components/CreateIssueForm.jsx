import { useState, useContext } from 'react';

import {Button, Select, Input} from 'antd';

import { Form, useActionData, useSubmit } from "react-router-dom";

import { ModalContext, convertDate } from "./Page";

const { TextArea } = Input;

/* 
Default input fields helps to circumvent the Select
restriction, which makes it impossible to pass the name
with the selected option value inside the form.

Unfortunately, due to the fact that the data validation results
becomes known only after submitting the form, it's impossible
to make the modal close only when the project is successfully created.
At the moment, after submitting the form, the modal is active
and it needs to be closed independently.
But at least it doesn't close when validation fails and
the user understands what went wrong and how to fix it.
*/


export function CreateIssueForm() {
    const errors = useActionData();
    const [type, setType] = useState("");
    const [priority, setPriority] = useState("");

    const handleChange = (value) => {
        if (errors?.errorType && value === "Feature" || value === "Bug") {
            delete errors.errorType;
        }
        else if (
            errors?.errorPriority &&
            value === "Lowest" ||
            value === "Low" ||
            value === "Medium" ||
            value === "High" ||
            value === "Highest"
        ) delete errors.errorPriority;
    };

    return (
        <Form method="post" name="createIssue" className="flex flex-col gap-y-4">

            {errors?.errorTitle || errors?.errorType || errors?.errorPriority ?
                <div className='flex flex-col text-center text-red-500'>
                    {errors?.errorTitle && <span>{errors.errorTitle}</span>}
                    {errors?.errorType && <span>{errors.errorType}</span>}
                    {errors?.errorPriority && <span>{errors.errorPriority}</span>}
                </div> : <></>
            }

            <Input
                name="title"
                status={errors?.errorTitle && "error"}
                type="text"
                required
                placeholder="Issue title"
                minLength={3}
                maxLength={255}
            />

            <TextArea
                name="description"
                maxLength={255}
                placeholder="Issue description"
            />

            <Select
                placeholder="Issue type"
                status={errors?.errorType && "error"}
                options={[
                    {label: "Feature", value: "Feature"},
                    {label: "Bug", value: "Bug"}
                ]}
                onChange={value => {setType(value); handleChange(value)}}
            />
            <input name="type" type="hidden" value={type} />

            <Select
                placeholder="Issue priority"
                status={errors?.errorPriority && "error"}
                options={[
                    {label: "Lowest", value: "Lowest"},
                    {label: "Low", value: "Low"},
                    {label: "Medium", value: "Medium"},
                    {label: "High", value: "High"},
                    {label: "Highest", value: "Highest"}
                ]}
                onChange={value => {setPriority(value), handleChange(value)}}
            />
            <input name="priority" type="hidden" value={priority} />

            <Button className="self-center" type="primary" htmlType="submit">
                Create issue
            </Button>
        </Form>
    );
}


export function UpdateIssueForm({ issue }) {
    const errors = useActionData();
    const submit = useSubmit();
    const setModalOpen = useContext(ModalContext);

    const [type, setType] = useState(issue.type);
    const [issueStatus, setIssueStatus] = useState(issue.status);
    const [priority, setPriority] = useState(issue.priority);

    const handleDelete = () => {
        submit(null, {method: "POST", action: `${issue.id}/delete`});
        setModalOpen({visible: false, modalId: 3});
    };

    return (
        <Form
            method="post"
            action={`${issue.id}/update`}
            name="updateIssue"
            className="grid grid-cols-2 gap-x-8 mt-4"
        >
            {errors?.errorTitle ?
                <div className='flex flex-col text-center text-red-500'>
                    <span>{errors.errorTitle}</span>
                </div> : <></>
            }

            <div className="col-span-2">
                <Input
                    name="title"
                    status={errors?.errorTitle && "error"}
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
                    {convertDate(issue.updated)}
                </div>

                <div className="flex flex-row gap-3 justify-end">
                    <Button danger type="text" htmlType="button" onClick={handleDelete}>
                        Delete
                    </Button>

                    <Button type="primary" htmlType="submit">
                        Change
                    </Button>
                </div>
            </div>
        </Form>
    );
}
