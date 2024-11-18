import { useState, useContext } from 'react';

import { useSubmit } from "react-router-dom";

import { Button, Select, Checkbox, Input } from 'antd';

import { Form, useActionData } from "react-router-dom";
import { testContext } from "./Page";


/*
Unfortunately, due to the fact that the data validation results
becomes known only after submitting the form, it's impossible
to make the modal close only when the project is successfully created.
At the moment, after submitting the form, the modal is active
and it needs to be closed independently.
But at least it doesn't close when validation fails and
the user understands what went wrong and how to fix it.
*/


export function CreateProjectForm() {
    const errors = useActionData();
    const [selectedValue, setSelectedValue] = useState("");

    const handleChange = () => {
        errors?.errorType && delete errors.errorType;
    };

    return (
        <Form method="post" name="createProject" className="flex flex-col gap-y-4 w-full">

            {errors?.errorName || errors?.errorKey || errors?.errorType ?
                <div className='text-center text-red-500'>
                    {errors?.errorName}
                    {errors?.errorKey}
                    {errors?.errorType}
                </div> : <></>
            }

            <Input
                name="name"
                status={errors?.errorName && "error"}
                type="text"
                placeholder="Project name"
                required
                minLength={3}
            />

            <Input
                name="key"
                status={errors?.errorKey && "error"}
                type="text"
                placeholder="Project key"
                required
                minLength={3}
                maxLength={10}
            />

            <Select
                placeholder="Project type"
                status={errors?.errorType && "error"}
                options={[
                    {label: "Fullstack", value: "Fullstack"},
                    {label: "Back-end", value: "Back-end"},
                    {label: "Front-end", value: "Front-end"}
                ]}
                onChange={value => {setSelectedValue(value), handleChange()}}
            />
            {
                /*
                That input field helps to circumvent the Select
                restriction, which makes it impossible to pass the name
                with the selected option value inside the form
                */
            }
            <input name="type" type="hidden" value={selectedValue} />

            <Checkbox name="starred">Favorite</Checkbox>

            <Button className="self-center" type="primary" htmlType="submit">
                Create project
            </Button>
        </Form>
    );
}


// Create new component for this form
// or rename current to ProjectForms?
export function UpdateProjectForm({ project }) {
    const errors = useActionData();
    const submit = useSubmit();
    const setModalOpen = useContext(testContext);
    const [selectedValue, setSelectedValue] = useState(project.type);

    const handleChange = () => {
        errors?.errorType && delete errors.errorType;
    };

    const handleDelete = () => {
        submit(null, {method: "POST", action: `${project.id}/delete`});
        setModalOpen({visible: false, modalId: 2});
    };

    return (
        <Form
            method="post"
            action={`${project.id}/update`}
            name="createProject"
            className="flex flex-col gap-3 mt-4"
        >

            {errors?.errorName || errors?.errorKey || errors?.errorType ?
                <div className='text-center text-red-500'>
                    {errors?.errorName}
                    {errors?.errorKey}
                    {errors?.errorType}
                </div> : <></>
            }

            <div className="flex flex-row items-center w-2/3">
                <span className="mr-2">Name:</span>
                <Input
                    name="name" 
                    status={errors?.errorName && "error"}
                    type="text"
                    defaultValue={project.name}
                    required
                    minLength={3}
                />
            </div>

            <div className="flex flex-row items-center w-1/3">
                <span className="mr-5">Key:</span>
                <Input
                    name="key"
                    status={errors?.errorKey && "error"}
                    type="text"
                    defaultValue={project.key}
                    required
                    minLength={3}
                    maxLength={10}
                />
            </div>

            <div className="items-center">
                <span className="mr-3.5">Type:</span>
                <Select
                    status={errors?.errorType && "error"}
                    defaultValue={project.type}
                    options={[
                        {label: "Fullstack", value: "Fullstack"},
                        {label: "Back-end", value: "Back-end"},
                        {label: "Front-end", value: "Front-end"}
                    ]}
                    onChange={value => {setSelectedValue(value), handleChange()}}
                />
                <input name="type" type="hidden" value={selectedValue} />
            </div>

            <div>
                <span className="mr-3">Favorite:</span>
                <Checkbox name="starred" defaultChecked={project.starred} />
            </div>

            <div>
                <span className="mr-2">Created:</span>
                {convertDate(project.created)}
            </div>

            <div>
                <span className="mr-2">Updated:</span>
                {convertDate(project.updated)}
            </div>

            <div className="flex flex-row gap-3 justify-end">
                <Button danger type="text" htmlType="button" onClick={handleDelete}>
                    Delete
                </Button>

                <Button type="primary" htmlType="submit">
                    Change
                </Button>
            </div>
 
        </Form>
    );
}


function convertDate(date) {
    const dateObj = new Date(Date.parse(date));
    const dateFormat = new Intl.DateTimeFormat(
        ["ru-RU", "en-US"],
        {dateStyle: "short", timeStyle: "medium"}
    )

    return dateFormat.format(dateObj);
}
