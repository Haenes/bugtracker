import { useState, useEffect } from 'react';

import { useTranslation } from "react-i18next";

import { Button, Select, Input } from 'antd';

import { Form } from "react-router";

const { TextArea } = Input;


export function CreateIssueForm({ errors, setModalOpen }) {
    const { t } = useTranslation();
    const [type, setType] = useState("");
    const [priority, setPriority] = useState("");

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
        <Form method="post" name="createIssue" className="flex flex-col gap-y-3 mt-4">

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
                placeholder={t("createIssue_title")}
                minLength={3}
                maxLength={255}
            />

            <TextArea
                name="description"
                autoSize={{ minRows: 1, maxRows: 4 }}
                maxLength={255}
                placeholder={t("createIssue_description")}
            />

            <Select
                placeholder={t("createIssue_type")}
                className="w-1/2"
                status={errors?.createType && "error"}
                options={[
                    {label: t("issue_typeFeature"), value: "Feature"},
                    {label: t("issue_typeBug"), value: "Bug"}
                ]}
                onChange={value => {setType(value); handleTypeChange()}}
            />
            <input name="type" type="hidden" value={type} />

            <Select
                placeholder={t("createIssue_priority")}
                className="w-2/3"
                status={errors?.createPriority && "error"}
                options={[
                    {label: t("issue_priorityLowest"), value: "Lowest"},
                    {label: t("issue_priorityLow"), value: "Low"},
                    {label: t("issue_priorityMedium"), value: "Medium"},
                    {label: t("issue_priorityHigh"), value: "High"},
                    {label: t("issue_priorityHighest"), value: "Highest"}
                ]}
                onChange={value => {setPriority(value), handlePriorityChange()}}
            />
            <input name="priority" type="hidden" value={priority} />

            <Button
                name="intent"
                value="create"
                className="self-center"
                type="primary"
                htmlType="submit"
            >
                {t("btn_create")}
            </Button>
        </Form>
    );
}
