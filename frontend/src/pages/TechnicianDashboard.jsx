import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Typography, Table, Tag, Button,
    Input, Space, Drawer, Form, message, Skeleton, Tooltip, Avatar, Upload
} from 'antd';
import {
    DashboardOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    PlayCircleOutlined,
    HistoryOutlined,
    FileImageOutlined,
    PictureOutlined,
    InboxOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Sector
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CountUp from 'react-countup';

dayjs.extend(relativeTime);
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// --- DUMMY DATA FOR TECHNICIAN "tech@spjimr.org" ---
const generateTechTickets = () => {
    return [
        { id: 'TKT-1002', category: 'Water Cooler', summary: 'Water leaking on 3rd floor', status: 'Assigned', sla_deadline: dayjs().endOf('day').toISOString(), created_at: dayjs().subtract(5, 'hour').toISOString(), urgency: 'High', room: '3rd Floor Lobby', description: 'Massive puddle forming.', closed_date: null },
        { id: 'TKT-1005', category: 'Electrical', summary: 'Tube light broken', status: 'In Progress', sla_deadline: dayjs().add(1, 'day').toISOString(), created_at: dayjs().subtract(4, 'hour').toISOString(), urgency: 'Low', room: 'Library', description: 'Flickers then dies.', closed_date: null },
        { id: 'TKT-1011', category: 'Plumbing', summary: 'Tap continuously dripping', status: 'Assigned', sla_deadline: dayjs().subtract(2, 'hour').toISOString(), created_at: dayjs().subtract(1, 'day').toISOString(), urgency: 'Medium', room: 'Men\'s Washroom GF', description: 'Wasting water.', closed_date: null },
    ];
};

const TechnicianDashboard = () => {
    const [tickets, setTickets] = useState(generateTechTickets());
    const [loading, setLoading] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeTicket, setActiveTicket] = useState(null);
    const [form] = Form.useForm();
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [fileList, setFileList] = useState([]);

    // Quick Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDueToday, setFilterDueToday] = useState(false);
    const [filterOverdue, setFilterOverdue] = useState(false);

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
        const timer = setInterval(() => setCurrentTime(dayjs()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- COMPUTATIONS FOR TOP CHIPS & CHARTS ---
    const isDueToday = (deadline) => dayjs(deadline).isSame(currentTime, 'day');
    const isOverdue = (deadline) => dayjs(deadline).isBefore(currentTime);

    const activeTicketsCount = tickets.filter(t => t.status !== 'Closed').length;
    const dueTodayCount = tickets.filter(t => t.status !== 'Closed' && isDueToday(t.sla_deadline)).length;
    const overdueCount = tickets.filter(t => t.status !== 'Closed' && isOverdue(t.sla_deadline)).length;

    const assignedCount = tickets.filter(t => t.status === 'Assigned').length;
    const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
    // For Donut Chart, we might want to show recently closed if we track state here, but requirements say "Assigned, In Progress, Closed"
    // Let's assume the tech closed 3 tickets recently for the dummy visual
    const donutData = [
        { name: 'Assigned', value: assignedCount, color: '#F59E0B' },
        { name: 'In Progress', value: inProgressCount, color: '#4F46E5' },
        { name: 'Closed (Today)', value: 2, color: '#10B981' }, // Dummy for visual
    ];

    const weeklyBarData = [
        { day: 'Mon', closed: 3 },
        { day: 'Tue', closed: 5 },
        { day: 'Wed', closed: 2 },
        { day: 'Thu', closed: 6 },
        { day: 'Fri', closed: 4 },
        { day: 'Sat', closed: 0 },
        { day: 'Sun', closed: 1 },
    ];

    // --- ACTIONS ---
    const handleStartWork = (id, e) => {
        if (e) e.stopPropagation();
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'In Progress' } : t));
        message.success(`Ticket ${id} marked as In Progress`);
    };

    const handleMarkDone = (id, e) => {
        if (e) e.stopPropagation();
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Closed', closed_date: dayjs().toISOString() } : t));
        message.success(<span>🎉 Ticket {id} officially closed!</span>);
    };

    const openDrawer = (record) => {
        setActiveTicket(record);
        form.resetFields();
        setFileList([]);
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
        setActiveTicket(null);
    };

    const handleDrawerSubmit = () => {
        // Handle notes/photo save logic here
        message.success('Notes and attachments saved successfully');
        onCloseDrawer();
    };

    // --- FILTERING ---
    const filteredTickets = tickets.filter(t => {
        if (t.status === 'Closed') return false; // Hide closed from main queue
        if (filterStatus !== 'All' && t.status !== filterStatus) return false;
        if (filterDueToday && !isDueToday(t.sla_deadline)) return false;
        if (filterOverdue && !isOverdue(t.sla_deadline)) return false;
        return true;
    }).sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()); // Default Sort: Aging desc (oldest first)

    // --- COLUMNS ---
    const columns = [
        {
            title: 'Urgency',
            key: 'urgency_indicator',
            width: 60,
            align: 'center',
            render: (_, record) => {
                const breached = isOverdue(record.sla_deadline);
                const nearing = isDueToday(record.sla_deadline) && !breached;
                if (breached) return <Tooltip title="SLA Breached"><div className="w-3 h-3 rounded-full bg-red-500 mx-auto animate-pulse"></div></Tooltip>;
                if (nearing) return <Tooltip title="Due Today"><div className="w-3 h-3 rounded-full bg-amber-400 mx-auto"></div></Tooltip>;
                return <div className="w-2 h-2 rounded-full bg-slate-200 mx-auto"></div>;
            }
        },
        {
            title: 'Ticket ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <span className="font-semibold text-slate-700">{text}</span>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text) => <span className="text-slate-600 font-medium">{text}</span>,
            responsive: ['md']
        },
        {
            title: 'Summary',
            dataIndex: 'summary',
            key: 'summary',
            width: '30%',
            render: (text, record) => (
                <div>
                    <div className="font-semibold text-slate-800">{text}</div>
                    <div className="text-xs text-slate-400 mt-1 md:hidden">
                        {record.room} • {isOverdue(record.sla_deadline) ? <span className="text-red-500 font-bold">Overdue</span> : dayjs(record.sla_deadline).format('DD MMM')}
                    </div>
                </div>
            )
        },
        {
            title: 'Room',
            dataIndex: 'room',
            key: 'room',
            responsive: ['md']
        },
        {
            title: 'Due Date',
            dataIndex: 'sla_deadline',
            key: 'sla_deadline',
            responsive: ['lg'],
            render: (text) => <span className={isOverdue(text) ? 'text-red-600 font-bold' : 'text-slate-600'}>{dayjs(text).format('DD MMM YYYY')}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'In Progress' ? 'processing' : 'warning'} className="rounded-full px-3 uppercase tracking-wider text-[10px] font-bold border-0">
                    {status}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                    {record.status === 'Assigned' && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={(e) => handleStartWork(record.id, e)}
                            className="bg-indigo-600 font-medium rounded-lg text-xs hover:bg-indigo-700 border-0 flex items-center gap-1"
                        >
                            <PlayCircleOutlined /> Start
                        </Button>
                    )}
                    {record.status === 'In Progress' && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={(e) => handleMarkDone(record.id, e)}
                            className="bg-emerald-500 font-medium rounded-lg text-xs hover:bg-emerald-600 border-0 flex items-center gap-1"
                        >
                            <CheckCircleOutlined /> Done
                        </Button>
                    )}
                </Space>
            ),
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton title active paragraph={{ rows: 1 }} />
                <Row gutter={16}>
                    <Col span={8}><Skeleton.Button active block style={{ height: 100 }} /></Col>
                    <Col span={8}><Skeleton.Button active block style={{ height: 100 }} /></Col>
                    <Col span={8}><Skeleton.Button active block style={{ height: 100 }} /></Col>
                </Row>
                <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
            </div>
        );
    }

    if (filteredTickets.length === 0 && tickets.filter(t => t.status !== 'Closed').length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in-up">
                <div className="text-6xl mb-4">🎉</div>
                <Title level={3} className="text-slate-700 mb-2">You're all caught up!</Title>
                <Text type="secondary" className="text-base text-slate-500">No active tickets currently assigned to you.</Text>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Title level={2} className="m-0 text-slate-800 tracking-tight">My Tickets</Title>
                    <Text type="secondary" className="text-base text-slate-500">Everything assigned to you, sorted by urgency.</Text>
                </div>

                {/* Top Summary Strip */}
                <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-2 gap-2 overflow-x-auto">
                    <div className="flex flex-col px-4 border-r border-slate-100 min-w-[120px]">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Assigned</span>
                        <span className="text-2xl font-bold text-slate-800"><CountUp end={activeTicketsCount} duration={1} /></span>
                    </div>
                    <div className="flex flex-col px-4 border-r border-slate-100 min-w-[120px]">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Due Today</span>
                        <span className="text-2xl font-bold text-amber-500"><CountUp end={dueTodayCount} duration={1} /></span>
                    </div>
                    <div className="flex flex-col px-4 min-w-[120px]">
                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Overdue</span>
                        <span className="text-2xl font-bold text-red-500"><CountUp end={overdueCount} duration={1} /></span>
                    </div>
                </div>
            </div>

            {/* My Work Summary Section */}
            <div>
                <Title level={5} className="text-slate-500 uppercase tracking-wider font-semibold mb-4 mt-8 flex items-center gap-2">
                    <DashboardOutlined /> My Work Summary
                </Title>

                <Row gutter={[24, 24]}>
                    {/* Chart 1: Donut (Primary Workload) */}
                    <Col xs={24} md={8}>
                        <Card className="shadow-sm border-slate-200 h-full flex flex-col items-center justify-center p-0" bodyStyle={{ width: '100%', height: '100%', padding: '16px' }}>
                            <div className="text-sm font-semibold text-slate-700 text-center mb-2">Current Queue Breakdown</div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-xs font-medium text-slate-500 w-full">
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Assigned</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> Working</div>
                            </div>
                        </Card>
                    </Col>

                    {/* Chart 2: Weekly Bar */}
                    <Col xs={24} md={8}>
                        <Card className="shadow-sm border-slate-200 h-full" bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="text-sm font-semibold text-slate-700 text-center mb-2">Tickets Closed (Last 7 Days)</div>
                            <div className="flex-grow w-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="closed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>

                    {/* Chart 3: SLA Risk Tiles */}
                    <Col xs={24} md={8}>
                        <Card className="shadow-sm border-slate-200 h-full" bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700"><CheckCircleOutlined /></div>
                                    <span className="font-semibold text-emerald-800">On Time Target</span>
                                </div>
                                <span className="text-lg font-bold text-emerald-600">92%</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700"><WarningOutlined /></div>
                                    <span className="font-semibold text-red-800">SLA Breached</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">{overdueCount}</span>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Table Section */}
            <div className="mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <Title level={5} className="text-slate-500 uppercase tracking-wider font-semibold m-0 flex items-center gap-2">
                        <HistoryOutlined /> Active Queue
                    </Title>

                    {/* Quick Lightweight Filters */}
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <Button
                            type={filterStatus === 'All' ? 'primary' : 'default'}
                            shape="round"
                            size="small"
                            onClick={() => setFilterStatus('All')}
                            className={filterStatus === 'All' ? 'bg-indigo-600 text-white border-0' : 'text-slate-500 bg-white'}
                        >All</Button>
                        <Button
                            type={filterStatus === 'Assigned' ? 'primary' : 'default'}
                            shape="round"
                            size="small"
                            onClick={() => setFilterStatus('Assigned')}
                            className={filterStatus === 'Assigned' ? 'bg-indigo-600 text-white border-0' : 'text-slate-500 bg-white'}
                        >Assigned</Button>
                        <Button
                            type={filterStatus === 'In Progress' ? 'primary' : 'default'}
                            shape="round"
                            size="small"
                            onClick={() => setFilterStatus('In Progress')}
                            className={filterStatus === 'In Progress' ? 'bg-indigo-600 text-white border-0' : 'text-slate-500 bg-white'}
                        >In Progress</Button>
                        <Button
                            type={filterDueToday ? 'primary' : 'default'}
                            shape="round"
                            size="small"
                            onClick={() => setFilterDueToday(!filterDueToday)}
                            className={filterDueToday ? 'bg-amber-500 text-white border-0' : 'text-slate-500 bg-white'}
                        >Due Today</Button>
                    </div>
                </div>

                <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: 0 }}>
                    <Table
                        columns={columns}
                        dataSource={filteredTickets}
                        rowKey="id"
                        pagination={false}
                        className="mobile-optimized-table"
                        onRow={(record) => ({
                            onClick: () => openDrawer(record),
                            className: 'cursor-pointer hover:bg-slate-50 transition-colors'
                        })}
                    />
                </Card>
            </div>

            {/* Technician Action Drawer */}
            <Drawer
                title={
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex flex-col gap-1 pointer-events-auto">
                            <span className="text-lg font-bold text-slate-800">{activeTicket?.id}</span>
                            <span className="text-xs text-slate-400 font-medium">Click outside to close overlay</span>
                        </div>
                        {activeTicket && (
                            <Tag color={activeTicket.status === 'In Progress' ? 'processing' : 'warning'} className="m-0 rounded-full px-4 border-0 font-bold uppercase tracking-wide">
                                {activeTicket.status}
                            </Tag>
                        )}
                    </div>
                }
                placement="right"
                width={window.innerWidth > 768 ? 450 : '100%'}
                onClose={onCloseDrawer}
                open={drawerVisible}
                className="custom-technician-drawer"
                footer={
                    <div className="flex gap-3">
                        {activeTicket?.status === 'Assigned' && (
                            <Button
                                type="primary"
                                size="large"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl flex items-center justify-center gap-2 h-12"
                                onClick={() => { handleStartWork(activeTicket.id); onCloseDrawer(); }}
                            >
                                <PlayCircleOutlined /> Start Working Now
                            </Button>
                        )}
                        {activeTicket?.status === 'In Progress' && (
                            <Button
                                type="primary"
                                size="large"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-xl flex items-center justify-center gap-2 h-12"
                                onClick={() => { handleMarkDone(activeTicket.id); onCloseDrawer(); }}
                            >
                                <CheckCircleOutlined /> Mark as Completed
                            </Button>
                        )}
                    </div>
                }
            >
                {activeTicket && (
                    <div className="flex flex-col h-full gap-6">
                        {/* Read-Only Info Block */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{activeTicket.summary}</h3>
                            <p className="text-slate-600 text-sm mb-4">{activeTicket.description}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Location</div>
                                    <div className="font-semibold text-slate-700">{activeTicket.room}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Category</div>
                                    <div className="font-semibold text-slate-700">{activeTicket.category}</div>
                                </div>
                                <div className="col-span-2 bg-white p-3 rounded-lg border border-slate-100 mt-2 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Target Resolution</span>
                                        <span className={isOverdue(activeTicket.sla_deadline) ? 'text-red-600 font-bold' : 'text-slate-800 font-medium'}>
                                            {dayjs(activeTicket.sla_deadline).format('DD MMM YYYY, hh:mm A')}
                                        </span>
                                    </div>
                                    {isOverdue(activeTicket.sla_deadline) && (
                                        <Tag color="error" className="m-0 rounded font-bold border-0">OVERDUE</Tag>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Editable Actions Block */}
                        <div className="flex-grow">
                            <Form form={form} layout="vertical" onFinish={handleDrawerSubmit}>
                                <Form.Item
                                    name="work_notes"
                                    label={<span className="font-semibold text-slate-700 text-base">Work Notes</span>}
                                    className="mb-6"
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="Briefly describe the work done or parts used..."
                                        className="rounded-xl border-slate-200 text-sm p-3"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-semibold text-slate-700 text-base flex justify-between w-full">Proof of Work <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>}
                                >
                                    <Dragger
                                        name="file"
                                        multiple={false}
                                        listType="picture"
                                        fileList={fileList}
                                        onChange={(info) => setFileList(info.fileList.slice(-1))}
                                        beforeUpload={() => false} // Prevent auto upload
                                        className="bg-slate-50 hover:bg-slate-100 transition-colors border-dashed border-2 rounded-xl"
                                    >
                                        <p className="ant-upload-drag-icon text-indigo-400">
                                            <InboxOutlined />
                                        </p>
                                        <p className="ant-upload-text font-medium text-slate-700">Tap or drag photo to upload</p>
                                        <p className="ant-upload-hint text-xs text-slate-400 px-4">Support for a single image upload. Required for material replacement.</p>
                                    </Dragger>
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default TechnicianDashboard;
