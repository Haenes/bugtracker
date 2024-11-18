import { useState } from 'react';

import { Button, Select, Checkbox, Input } from 'antd';

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


// TODO: CHANGE ACTION (NEED TO ADD NEW ROUTE FOR ABILITY TO CHANGE PROJECT)
export function UpdateProjectForm({ project }) {
    const errors = useActionData();
    const [selectedValue, setSelectedValue] = useState(project.type);

    const handleChange = () => {
        errors?.errorType && delete errors.errorType;
    };

    return (
        <Form method="post" name="createProject" className="flex flex-col gap-3">

            {errors?.errorName || errors?.errorKey || errors?.errorType ?
                <div className='text-center text-red-500'>
                    {errors?.errorName}
                    {errors?.errorKey}
                    {errors?.errorType}
                </div> : <></>
            }

            <Input
            width="300"
                name="name"
                status={errors?.errorName && "error"}
                type="text"
                defaultValue={project.name}
                required
                minLength={3}
            />

            <Input
                name="key"
                status={errors?.errorKey && "error"}
                type="text"
                defaultValue={project.key}
                required
                minLength={3}
                maxLength={10}
            />

            <Select
                placeholder="Project type"
                status={errors?.errorType && "error"}
                defaultValue={project.type}
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

            <Checkbox name="starred" defaultChecked={project.starred}>Favorite</Checkbox>

            <div className="flex flex-row gap-4">
                <Button className="self-center" danger type="text" htmlType="submit">
                    Delete project
                </Button>

                <Button className="self-center" type="primary" htmlType="submit">
                    Change project
                </Button>
            </div>
 
        </Form>
    );
}
