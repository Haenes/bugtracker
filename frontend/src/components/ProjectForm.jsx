import { useState } from 'react';

import {Button, Select, Checkbox, Input, message} from 'antd';

import { Form, useActionData } from "react-router-dom";


/*
Unfortunately, due to the fact that the data validation results
becomes known only after submitting the form, it's impossible
to make the modal close only when the project is successfully created.
At the moment, after submitting the form, the modal is active
and it needs to be closed independently.
But at least it doesn't close when validation fails and
the user understands what went wrong and how to fix it.
*/


export function ProjectForm() {
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
