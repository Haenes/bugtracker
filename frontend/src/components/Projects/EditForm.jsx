import { useState, useContext } from 'react';

import { useSubmit } from "react-router-dom";

import { Button, Select, Checkbox, Input } from 'antd';

import { Form, useActionData } from "react-router-dom";

import { ModalContext } from "../ModalProvider.jsx";
import { convertDate } from "../Page.jsx";


export function EditProjectForm({ project }) {
    const errors = useActionData();
    const submit = useSubmit();
    const setModalOpen = useContext(ModalContext);
    const [selectedValue, setSelectedValue] = useState(project.type);

    const handleDelete = () => {
        submit(null, {method: "POST", action: `${project.id}/delete`});
        setModalOpen({visible: false, modalId: 2});
    };

    return (
        <Form
            method="post"
            action={`${project.id}/update`}
            name="editProject"
            className="flex flex-col gap-3 mt-4"
        >
            {errors?.errorName || errors?.errorKey ?
                <div className='text-center text-red-500'>
                    {errors?.errorName}
                    {errors?.errorKey}
                </div> : <></>
            }

            <div className="flex flex-row items-center">
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

            <div className="flex flex-row items-center w-2/3">
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