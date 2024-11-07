import { useState } from 'react';

import {Button, Select, Checkbox, Input} from 'antd';

import { Form, useActionData } from "react-router-dom";

export function ProjectForm({ onCreate }) {
    const [selectedValue, setSelectedValue] = useState("");
    // const errors = useActionData();
    
    // console.log("errors", errors);

    return (
        <Form method="post" name="createProject" className="flex flex-col my-4 gap-y-4 w-full">

            {/* {errors?.auth &&
                <div className='text-center text-red-500'>
                    {errors.auth}
                </div>
            } */}

            <Input
                name="name"
                // status={errors?.auth && "error"}
                type="text"
                placeholder="Project name"
                autoFocus
                required
                minLength={3}
            />
            <Input
                name="key"
                // status={errors?.auth && "error"}
                type="text"
                placeholder="Project key"
                autoFocus
                required
                minLength={3}
                maxLength={10}
            />

            <Select
                placeholder="Project type"
                options={[
                    {label: "Fullstack", value: "Fullstack"},
                    {label: "Back-end", value: "Back-end"},
                    {label: "Front-end", value: "Front-end"}
                ]}
                onChange={value => setSelectedValue(value)}
                required
            />
            {
                /*
                That input field helps to circumvent the Select
                restriction, which makes it impossible to pass the name
                with the selected option value inside the form
                */
            }
            <input name="type" type="hidden" value={selectedValue}/>

            <Checkbox name="starred">Favorite</Checkbox>

            <Button className="self-center" type="primary" htmlType="submit" onClick={onCreate}>
                Create project
            </Button>
        </Form>
    );
}
