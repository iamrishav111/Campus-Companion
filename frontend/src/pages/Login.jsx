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
        <div className="h-screen w-full relative overflow-hidden flex items-center justify-center font-sans bg-[#fafaff]">
            {/* Sophisticated Background Layers */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                
                {/* Branding Side - High-End Editorial Style */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/80 shadow-sm">
                        <SettingOutlined className="text-purple-600 font-bold" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Facility Command Center</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-[56px] lg:text-[72px] font-black text-slate-900 leading-[0.95] tracking-tighter m-0">
                            Campus <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Companion</span>
                        </h1>
                        <p className="text-slate-500 text-xl lg:text-2xl font-bold leading-relaxed max-w-md">
                            One stop place for tracking <br />
                            <span className="text-slate-900">Campus Complaints</span>
                        </p>
                    </div>


                </div>

                {/* Login Card - Glassmorphism */}
                <div className="w-full lg:w-[450px] animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <Card 
                        className="overflow-hidden border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-2xl" 
                        style={{ borderRadius: '32px' }}
                        bodyStyle={{ padding: '48px 40px' }}
                    >
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-500 font-medium italic">Please sign in to your secure portal</p>
                        </div>

                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                showIcon
                                className="mb-8 rounded-2xl border-red-100 bg-red-50/50 text-red-700 font-medium"
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
                                label={<span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</span>}
                                rules={[
                                    { required: true, message: 'Required' },
                                    { type: 'email', message: 'Invalid email' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-slate-300 mr-2" />}
                                    placeholder="admin@spjimr.org"
                                    className="rounded-2xl h-[56px] bg-white border-slate-100 hover:border-purple-300 focus:border-purple-500 shadow-sm transition-all text-base font-medium"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-slate-300 mr-2" />}
                                    placeholder="••••••••"
                                    className="rounded-2xl h-[56px] bg-white border-slate-100 hover:border-purple-300 focus:border-purple-500 shadow-sm transition-all text-base font-medium"
                                />
                            </Form.Item>

                            <Form.Item className="mt-10 mb-2">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-[60px] rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 font-black text-lg tracking-tight shadow-[0_20px_40px_-10px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)] transition-all duration-300 active:scale-[0.98]"
                                >
                                    Access Portal
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Operations Control</span>
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 w-full group transition-colors hover:bg-white hover:shadow-sm">
                                <div className="bg-purple-100/80 p-2.5 rounded-xl text-purple-600">
                                    <SettingOutlined className="text-lg" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Admin</div>
                                    <div className="text-sm font-bold text-slate-700 leading-none">admin@spjimr.org <span className="opacity-20 mx-1">/</span> admin123</div>
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
