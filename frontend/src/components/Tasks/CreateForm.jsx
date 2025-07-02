import { useState, useEffect } from 'react';

import { useTranslation } from "react-i18next";

import { Button, Select, Input } from 'antd';

import { Form } from "react-router";

import { DeadlinePicker } from "./DeadlinePicker.jsx";

const { TextArea } = Input;


export function CreateTaskForm({ errors, setModalOpen }) {
    const { t } = useTranslation();
    const [type, setType] = useState("");
    const [priority, setPriority] = useState("");
    const [deadline, setDeadline] = useState("");

    const handleTypeChange = () => {
        errors?.createType && delete errors.createType;
    };

    const handlePriorityChange = () => {
        errors?.createPriority && delete errors.createPriority;
    }

    // Close Modal with form after successful creation.
    useEffect(() => {
        if (errors?.id) {
            setModalOpen({visible: false, modalId: 1});
            delete errors.id;
        }
    }, [errors?.id])

    return (
        <Form method="post" name="createTask" className="flex flex-col gap-y-3 mt-4">

            {errors?.createName || errors?.createType || errors?.createPriority ?
                <div className='flex flex-col text-center text-red-500'>
                    {errors?.createName}
                    {errors?.createType && <span>{errors.createType}</span>}
                    {errors?.createPriority && <span>{errors.createPriority}</span>}
                </div> : <></>
            }

            <Input
                name="name"
                status={errors?.createName && "error"}
                type="text"
                required
                placeholder={t("name")}
                minLength={3}
                maxLength={100}
            />

            <TextArea
                name="description"
                placeholder={t("description")}
            />

            <Select
                placeholder={t("type")}
                className="w-2/5 md:w-1/3"
                status={errors?.createType && "error"}
                options={[
                    {label: t("taskTypeFeature"), value: 3},
                    {label: t("taskTypeMisc"), value: 4},
                    {label: t("taskTypeFix"), value: 2},
                    {label: t("taskTypeBug"), value: 1},
                ]}
                onChange={value => {setType(value); handleTypeChange}}
            />
            <input name="type_id" type="hidden" value={type} />

            <Select
                placeholder={t("priority")}
                className="w-3/5 md:w-2/5"
                status={errors?.createPriority && "error"}
                options={[
                    {label: t("taskPriorityLow"), value: 1},
                    {label: t("taskPriorityMedium"), value:2},
                    {label: t("taskPriorityHigh"), value: 3},
                    {label: t("taskPriorityCritical"), value: 4}
                ]}
                onChange={value => {setPriority(value), handlePriorityChange}}
            />
            <input name="priority_id" type="hidden" value={priority} />

            <DeadlinePicker deadline={deadline} setDeadline={setDeadline} />

            <Button
                name="intent"
                value="create"
                className="self-center"
                type="primary"
                htmlType="submit"
            >
                {t("createBtn")}
            </Button>
        </Form>
    );
}
