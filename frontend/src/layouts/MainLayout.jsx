import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Select, Empty, Card, Typography, Button } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    BellOutlined,
    BankOutlined,
    CoffeeOutlined,
    DribbbleOutlined,
    BookOutlined,
    LineChartOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation, useParams } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { module } = useParams();

    const currentModule = module || 'hostel';

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleModuleChange = (value) => {
        // Switch module while preserving the sub-route if possible, or defaulting to tickets
        const subRoute = location.pathname.includes('/analytics') ? 'analytics' : 'tickets';
        navigate(`/admin/${value}/${subRoute}`);
    };

    const menuItems = [
        ...(role === 'admin' ? [
            {
                key: `/admin/${currentModule}/tickets`,
                icon: <DashboardOutlined />,
                label: 'Tickets',
            },
            {
                key: `/admin/${currentModule}/analytics`,
                icon: <LineChartOutlined />,
                label: 'Analytics',
            }
        ] : [
            {
                key: '/technician/tickets',
                icon: <DashboardOutlined />,
                label: 'My Tickets',
            },
            {
                key: '/technician/history',
                icon: <HistoryOutlined />,
                label: 'Closed History',
            }
        ])
    ];

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />,
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout
            },
        ],
    };

    const moduleOptions = [
        { value: 'hostel', label: <span className="flex items-center gap-2"><BankOutlined /> Hostel (Active)</span> },
        { value: 'mess', label: <span className="flex items-center gap-2"><CoffeeOutlined /> Mess</span> },
        { value: 'academic', label: <span className="flex items-center gap-2"><BookOutlined /> Academic Block</span> },
    ];

    return (
        <Layout className="min-h-screen">
            <Sider
                width={250}
                theme="light"
                className="shadow-sm border-r border-slate-100"
                breakpoint="lg"
                collapsedWidth="0"
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3 mb-4 transition-colors hover:bg-slate-50">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                        <SettingOutlined />
                    </div>
                    <span className="font-bold text-lg text-slate-800 tracking-tight">Campus Companion</span>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="px-3 border-r-0"
                    style={{ background: 'transparent' }}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout>
                <Header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-slate-100 z-10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="font-medium text-slate-500 hidden md:block">
                            {role === 'admin' ? 'Admin Gateway' : 'Technician Portal'}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Module Selector - Top Right */}
                        {role === 'admin' && (
                            <div className="hidden sm:flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Module:</span>
                                <Select
                                    value={currentModule}
                                    onChange={handleModuleChange}
                                    bordered={false}
                                    className="w-48 font-medium text-slate-700"
                                    popupMatchSelectWidth={false}
                                    options={moduleOptions}
                                />
                            </div>
                        )}

                        <span className="text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors relative">
                            <BellOutlined className="text-xl" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </span>
                        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
                                <Avatar
                                    style={{ backgroundColor: role === 'admin' ? '#4F46E5' : '#F59E0B' }}
                                    icon={<UserOutlined />}
                                />
                                <div className="hidden sm:block">
                                    <div className="text-sm font-medium text-slate-700 leading-none">
                                        {role === 'admin' ? 'Admin User' : 'Technician User'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 capitalize leading-none">{role}</div>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="p-6 overflow-auto bg-[#F8FAFC]">
                    {role === 'admin' && currentModule !== 'hostel' ? (
                        <div className="flex-grow flex items-center justify-center animate-fade-in-up min-h-[60vh]">
                            <Card className="max-w-md w-full text-center border-dashed border-2 border-slate-200 bg-slate-50 hover:border-indigo-300 transition-colors shadow-sm">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className="space-y-2 mt-4">
                                            <Title level={4} className="text-slate-700 m-0">🚧 Feature coming soon</Title>
                                            <Text type="secondary" className="block text-center whitespace-normal leading-relaxed">
                                                The <strong>
                                                    {currentModule === 'mess' ? 'Mess' :
                                                        currentModule === 'academic' ? 'Academic Block' : 'Hostel'}
                                                </strong> module is currently under development.
                                            </Text>
                                        </div>
                                    }
                                >
                                    <Button type="primary" onClick={() => handleModuleChange('hostel')} className="mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm border-0 font-medium">
                                        Return to Hostel
                                    </Button>
                                </Empty>
                            </Card>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up h-full">
                            <Outlet />
                        </div>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
