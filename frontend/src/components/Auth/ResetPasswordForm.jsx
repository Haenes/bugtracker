import { useState } from "react";

import { Button, Card, Tooltip, Input } from 'antd';

import { Form, useActionData } from "react-router";


export function ResetPasswordForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const errors = useActionData();

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <Card title="Set new password" className="text-center w-4/5 md:w-2/5 lg:w-1/4">

                <Form method="post" name="forgotPassword" className="flex flex-col">

                    {errors ?
                        <div className="mb-4 text-center text-red-500">
                            <span>{errors?.password}</span>
                            <span>{errors?.confirm_password}</span>
                        </div> : <></>
                    }

                    <Tooltip title={passwordTooltip}>
                        <Input.Password
                            name="password"
                            autoComplete="new-password"
                            autoFocus
                            status={errors?.password && "error"}
                            type="password"
                            placeholder="Password"
                            minLength={8}
                            maxLength={32}
                            required
                            visibilityToggle={() => (!setPasswordVisible)}
                        />
                    </Tooltip>

                    <Input.Password
                        name="confirm_password"
                        autoComplete="new-password"
                        status={errors?.confirm_password && "error"}
                        className="my-4"
                        type="password"
                        placeholder="Confirm password"
                        minLength={8}
                        maxLength={32}
                        required
                        visibilityToggle={() => (!setPasswordVisible)}
                    />

                    <Button type="primary" htmlType="submit">
                        Set    
                    </Button>

                </Form>

            </Card>
        </div>
    );
}


const passwordTooltip = (
    <div>
        Your password must have:
        <p>1) a 8 - 32 characters.</p>
        <p>2) at least one uppercase and lowercase letters.</p>
        <p>3) at least one digit.</p>
        <p>4) at least one special character</p>
    </div>
);
