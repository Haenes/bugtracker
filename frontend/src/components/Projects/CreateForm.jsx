import { useState } from 'react';

import { Button, Select, Checkbox, Input } from 'antd';

import { Form, useActionData } from "react-router";


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
    const [type, setType] = useState("");

    const handleChange = () => {
        errors?.createType && delete errors.createType;
    };

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

            <Button name="intent" value="create" className="self-center" type="primary" htmlType="submit">
                Create new
            </Button>
        </Form>
    );
}
