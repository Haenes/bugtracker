import { useState } from 'react';

import {Button, Select, Input} from 'antd';

import { Form, useActionData } from "react-router";

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

    const handleTypeChange = () => {
        errors?.createType && delete errors.createType;
    };

    const handlePriorityChange = () => {
        errors?.createPriority && delete errors.createPriority;
    }

    return (
        <Form method="post" name="createIssue" className="flex flex-col gap-y-4">

            {errors?.createTitle || errors?.createType || errors?.createPriority ?
                <div className='flex flex-col text-center text-red-500'>
                    {errors?.createTitle}
                    {errors?.createType && <span>{errors.createType}</span>}
                    {errors?.createPriority && <span>{errors.createPriority}</span>}
                </div> : <></>
            }

            <Input
                name="title"
                status={errors?.createTitle && "error"}
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
                status={errors?.createType && "error"}
                options={[
                    {label: "Feature", value: "Feature"},
                    {label: "Bug", value: "Bug"}
                ]}
                onChange={value => {setType(value); handleTypeChange()}}
            />
            <input name="type" type="hidden" value={type} />

            <Select
                placeholder="Issue priority"
                status={errors?.createPriority && "error"}
                options={[
                    {label: "Lowest", value: "Lowest"},
                    {label: "Low", value: "Low"},
                    {label: "Medium", value: "Medium"},
                    {label: "High", value: "High"},
                    {label: "Highest", value: "Highest"}
                ]}
                onChange={value => {setPriority(value), handlePriorityChange()}}
            />
            <input name="priority" type="hidden" value={priority} />

            <Button name="intent" value="create" className="self-center" type="primary" htmlType="submit">
                Create new
            </Button>
        </Form>
    );
}
