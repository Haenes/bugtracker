import { useState } from 'react';

import {
  Col, Row,
  Button,
  Card,
  Form,
  Input,
  Popover,
} from 'antd';

import { userRegistration } from '../client/auth.js';


const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 16,
      offset: 8,
    },
    sm: {
      span: 18,
      offset: 9,
    },
  },
};


function validateName(value) {
  if (/^[a-zA-Z]+$/.test(value)) {
    return true;
  }
  return false;
}


const minLengthNameRule = () => ({
    validator(_, value) {
      if (value.length >= 2) {
        if (validateName(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Only letters are allowed!'));
      }
      return Promise.reject(new Error('The min length of name is two letters'));
    }});


export function RegisterForm() {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Registration res:', userRegistration(values));
    };

    const [clicked, setClicked] = useState(false);
    const handleClickChange = (open) => setClicked(open);

    const clickContent = (
        <div>
            <p>Your password must have:</p>
            <p>1) a 8 - 32 characters.</p>
            <p>2) at least one uppercase and lowercase letters.</p>
            <p>3) at least one digit.</p>
            <p>4) at least one special character</p>
        </div>
    );

    return (
        <Row className='h-screen w-screen items-center justify-center'>
            <Col>
                <Card title="Create an account">
                    <Form
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        scrollToFirstError
                    >
                        <Form.Item
                            name="email"
                            label="E-mail"
                            hasFeedback
                            rules={[
                                {
                                    type: 'email',
                                    message: 'The input is not valid E-mail!',
                                },
                                {
                                    required: true,
                                    message: 'Please input your E-mail!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            label="Username"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your username!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="first_name"
                            label="First name"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your first name!',
                                },
                                minLengthNameRule,
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="last_name"
                            label="Last name"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your last name!',
                                },
                                minLengthNameRule,
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Popover
                            placement="top"
                            content={clickContent}
                            color='#EEEEEE'
                            trigger="click"
                            open={clicked}
                            onOpenChange={handleClickChange}
                        >
                            <Form.Item
                                name="password"
                                label="Password"
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Popover>

                        <Form.Item
                            name="password_confirm"
                            label="Confirm Password"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please confirm your password!',
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The password doesn\'t match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">
                                Register
                            </Button>
                        </Form.Item>

                    </Form>
                </Card>
            </Col>
        </Row>
    );
}
