import { useState } from 'react';

import { Form, useActionData } from "react-router";

import { Button, Select, Checkbox, Input } from 'antd';

import { useModalContext } from "../ModalProvider.jsx";
import { convertDate } from "../PageLayout.jsx";


export function EditProjectForm({ project }) {
    const errors = useActionData();
    const [modalOpen, setModalOpen] = useModalContext();
    const [type, setType] = useState(project.type);

    return (
        <Form method="post" name="editProject" className="flex flex-col gap-3 mt-4">
            {errors?.editName || errors?.editKey ?
                <div className='text-center text-red-500'>
                    {errors?.editName}
                    {errors?.editKey}
                </div> : <></>
            }

            <input name="projectId" value={project.id} type="hidden" />

            <div className="flex flex-row items-center">
                <span className="mr-2">Name:</span>
                <Input
                    name="name" 
                    status={errors?.editName && "error"}
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
                    status={errors?.editKey && "error"}
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
                    onChange={value => setType(value)}
                />
                <input name="type" type="hidden" value={type} />
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
                <Button
                    danger
                    name="intent"
                    value="delete"
                    type="text"
                    htmlType="submit"
                    onClick={() => setModalOpen({visible: false, modalId: 2})}
                >
                    Delete
                </Button>

                <Button name="intent" value="edit" type="primary" htmlType="submit">
                    Change
                </Button>
            </div>
        </Form>
    );
}