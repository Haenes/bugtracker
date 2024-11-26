import { useState, useEffect } from 'react';

import { Button, Select, Checkbox, Input } from 'antd';

import { Form } from "react-router";



export function CreateProjectForm({errors, setModalOpen}) {
    const [type, setType] = useState("");

    const handleChange = () => {
        errors?.createType && delete errors.createType;
    };

    // Close Modal with form after successful creation.
    useEffect(() => {
        if (errors?.created) {
            setModalOpen({visible: false, modalId: 1});
            delete errors.created;
        }
    }, [errors])

    return (
        <Form method="post" name="createProject" className="flex flex-col gap-y-4 w-full">

            {errors?.createName || errors?.createKey || errors?.createType ?
                <div className='text-center text-red-500'>
                    {errors?.createName}
                    {errors?.createKey}
                    {errors?.createType}
                </div> : <></>
            }

            <Input
                name="name"
                status={errors?.createName && "error"}
                type="text"
                placeholder="Project name"
                required
                minLength={3}
            />

            <Input
                name="key"
                status={errors?.createKey && "error"}
                type="text"
                placeholder="Project key"
                required
                minLength={3}
                maxLength={10}
            />

            <Select
                placeholder="Project type"
                status={errors?.createType && "error"}
                options={[
                    {label: "Fullstack", value: "Fullstack"},
                    {label: "Back-end", value: "Back-end"},
                    {label: "Front-end", value: "Front-end"}
                ]}
                onChange={value => {setType(value), handleChange()}}
            />
            {
                /*
                That input field helps to circumvent the Select
                restriction, which makes it impossible to pass the name
                with the selected option value inside the form
                */
            }
            <input name="type" type="hidden" value={type} />

            <Checkbox name="starred">Favorite</Checkbox>

            <Button
                name="intent"
                value="create"
                className="self-center"
                type="primary"
                htmlType="submit"
            >
                Create new
            </Button>
        </Form>
    );
}
