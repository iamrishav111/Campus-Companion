import React, { useState } from 'react';
import { Card, Button, Input, Form, Typography, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, ToolOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = (values) => {
        setLoading(true);
        setError('');

        // V2 Auth verification (Dummy but strictly matched to prompt)
        setTimeout(() => {
            const { email, password } = values;

            if (email === 'admin@spjimr.org' && password === 'admin123') {
                localStorage.setItem('userRole', 'admin');
                navigate('/admin');
            } else if (email === 'tech@spjimr.org' && password === 'tech123') {
                localStorage.setItem('userRole', 'technician');
                navigate('/technician');
            } else {
                setError('Invalid credentials');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 animate-fade-in-up">
            {/* Left side: Premium Branding/Visual (Splitscreen) */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center relative overflow-hidden">
                {/* Rich SaaS style gradient blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-700 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>

                <div className="relative z-10 text-white max-w-lg p-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-2xl">
                            <SettingOutlined className="text-3xl" />
                        </div>
                        <h1 className="text-white m-0 tracking-tight font-semibold" style={{ fontSize: '32px' }}>Campus Companion</h1>
                    </div>
                    <p className="text-indigo-100/90 text-[20px] font-medium leading-relaxed">
                        Enterprise-grade facility operations command center. <br />
                        <span className="font-light text-[16px] text-indigo-200 mt-2 block">Optimized for rapid resolution.</span>
                    </p>
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white/60 backdrop-blur-lg">
                <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="text-center mb-10 lg:hidden">
                        <Title level={2} className="text-gray-900 m-0">Campus Companion</Title>
                    </div>

                    <Card className="shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 bg-white" style={{ borderRadius: '24px', padding: '16px' }}>
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome Back</h2>
                            <p className="text-slate-500 text-sm">Please sign in to your operations portal</p>
                        </div>

                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                showIcon
                                className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700"
                            />
                        )}

                        <Form
                            name="login"
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                            requiredMark={false}
                        >
                            <Form.Item
                                name="email"
                                label={<span className="text-sm font-medium text-slate-700">Email Address</span>}
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-slate-400 mr-2" />}
                                    placeholder="name@spjimr.org"
                                    className="rounded-xl h-[48px] bg-slate-50 border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.1)] transition-all"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="text-sm font-medium text-slate-700">Password</span>}
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-slate-400 mr-2" />}
                                    placeholder="Enter your password"
                                    className="rounded-xl h-[48px] bg-slate-50 border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.1)] transition-all"
                                />
                            </Form.Item>

                            <Form.Item className="mt-8 mb-2">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] border-0 font-medium text-base transition-all duration-200"
                                >
                                    Sign In
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider className="text-slate-300 text-xs uppercase tracking-widest my-8">Demo Credentials</Divider>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 hover:border-indigo-100 transition-colors cursor-default group">
                                <div className="bg-indigo-100/50 p-2.5 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                    <SettingOutlined className="text-lg" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Admin Role</div>
                                    <div className="text-sm font-medium text-slate-700">admin@spjimr.org <span className="text-slate-300 mx-1">/</span> admin123</div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 hover:border-amber-100 transition-colors cursor-default group">
                                <div className="bg-amber-100/50 p-2.5 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
                                    <ToolOutlined className="text-lg" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Technician Role</div>
                                    <div className="text-sm font-medium text-slate-700">tech@spjimr.org <span className="text-slate-300 mx-1">/</span> tech123</div>
                                </div>
                            </div>
                        </div>

                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
