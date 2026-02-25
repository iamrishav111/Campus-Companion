import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Typography, Statistic, Table, Tag, Button,
    Input, Select, Space, Drawer, Form, DatePicker, message, Skeleton
} from 'antd';
import {
    ContainerOutlined,
    WarningOutlined,
    ToolOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    FilterOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import CountUp from 'react-countup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// --- DUMMY DATA SERVICES ---
const generateDummyTickets = () => {
    return [
        { id: 'TKT-1001', category: 'AC', summary: 'AC not cooling in Room 201', status: 'Open', assigned_to: null, sla_deadline: dayjs().add(2, 'hour').toISOString(), created_at: dayjs().subtract(3, 'hour').toISOString(), urgency: 'High', room: '201', description: 'The AC blows warm air.' },
        { id: 'TKT-1002', category: 'Water Cooler', summary: 'Water leaking on 3rd floor', status: 'Assigned', assigned_to: 'Tech 04 (Water Cooler)', sla_deadline: dayjs().subtract(1, 'hour').toISOString(), created_at: dayjs().subtract(5, 'hour').toISOString(), urgency: 'High', room: '3rd Floor Lobby', description: 'Massive puddle forming.', resolved_time_hours: null },
        { id: 'TKT-1003', category: 'Cleaning', summary: 'Room 405 needs deep clean', status: 'Closed', assigned_to: 'Tech 06 (Cleaning)', sla_deadline: dayjs().subtract(1, 'day').toISOString(), created_at: dayjs().subtract(2, 'day').toISOString(), urgency: 'Low', room: '405', description: 'Dust everywhere post holiday.', resolved_time_hours: 4 },
        { id: 'TKT-1004', category: 'AC', summary: 'Strange noise from vent', status: 'Open', assigned_to: null, sla_deadline: dayjs().add(5, 'hour').toISOString(), created_at: dayjs().subtract(1, 'hour').toISOString(), urgency: 'Medium', room: '102', description: 'Clicking sound constantly.' },
        { id: 'TKT-1005', category: 'Electrical', summary: 'Tube light broken', status: 'Assigned', assigned_to: 'Tech 02 (Electrical)', sla_deadline: dayjs().add(1, 'day').toISOString(), created_at: dayjs().subtract(4, 'hour').toISOString(), urgency: 'Low', room: 'Library', description: 'Flickers then dies.', resolved_time_hours: null },
    ];
};

const initialTickets = generateDummyTickets();

// --- API HELPERS ---
const getCategory = (rawCat) => {
    if (!rawCat) return 'Other';
    const lower = rawCat.toLowerCase();
    switch (lower) {
        case 'ac': return 'AC';
        case 'cleaning': return 'Cleaning';
        case 'water_disp': return 'Water Cooler';
        case 'water cooler': return 'Water Cooler';
        case 'wifi': return 'Wifi';
        case 'wash_mach': return 'Washing Machine';
        case 'washing machine': return 'Washing Machine';
        case 'geyser': return 'Electrical';
        case 'electrical': return 'Electrical';
        default: return rawCat;
    }
};

const getAssignedTech = (mappedCategory) => {
    switch (mappedCategory) {
        case 'Water Cooler': return 'Tech 04 (Water Cooler)';
        case 'Washing Machine': return 'Tech 05 (Washing Machine)';
        case 'Cleaning': return 'Tech 06 (Cleaning)';
        case 'Wifi': return 'Tech 07 (Wifi)';
        case 'AC': return 'Tech 01 (AC)';
        case 'Electrical': return 'Tech 02 (Electrical)';
        default: return `Tech 00 (${mappedCategory})`;
    }
};

const mapApiTicket = (data) => {
    const mappedCategory = getCategory(data.category);
    const toSentenceCase = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    return {
        id: data.id.substring(0, 8).toUpperCase(), // Simplify UUID
        raw_id: data.id, // Backend exact ID
        category: mappedCategory,
        summary: `${toSentenceCase(data.description)} in ${data.room}`,
        status: data.status,
        assigned_to: data.assigned_to || getAssignedTech(mappedCategory),
        sla_deadline: data.created_at ? dayjs(data.created_at).add(4, 'hour').toISOString() : dayjs().add(2, 'hour').toISOString(), // Setup dummy SLA based on creation for demo
        created_at: data.created_at || new Date().toISOString(),
        urgency: data.priority === 'high' ? 'High' : (data.priority === 'low' ? 'Low' : 'Medium'),
        room: data.room,
        description: data.description,
        resolved_time_hours: data.status === 'Closed' ? 2 : null
    };
};

const AdminDashboard = () => {
    const [tickets, setTickets] = useState(initialTickets);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(dayjs());

    // Advanced Multi-Filters State
    const [activeKpiFilter, setActiveKpiFilter] = useState(null); // 'Total', 'Open', 'Assigned', 'Closed'
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterStatus, setFilterStatus] = useState([]);
    const [filterTechnician, setFilterTechnician] = useState([]);
    const [searchText, setSearchText] = useState('');

    // Drawer state
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('https://campus-companion-backend-nk3b.onrender.com/tickets');
                if (response.ok) {
                    const data = await response.json();
                    const liveTickets = data.map(mapApiTicket);
                    setTickets([...initialTickets, ...liveTickets]);
                }
            } catch (error) {
                console.error("Failed to fetch live tickets", error);
                // Fallback is just maintaining initialTickets
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
        const timer = setInterval(() => setCurrentTime(dayjs()), 60000); // Live aging update
        return () => clearInterval(timer);
    }, []);

    // --- KPI COMPUTATION ---
    const kpiData = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        assigned: tickets.filter(t => t.status === 'Assigned').length,
        closed: tickets.filter(t => t.status === 'Closed').length,
    };

    const formatter = (value) => <CountUp end={value} duration={1.5} className="kpi-number" />;

    // --- CHART COMPUTATIONS ---
    // 1. Most Common Issues Data
    const getCommonIssues = () => {
        const counts = {};
        tickets.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
        return Object.keys(counts).map(key => ({ name: key, count: counts[key] })).sort((a, b) => b.count - a.count);
    };
    const commonIssuesData = getCommonIssues();
    const CATEGORY_COLORS = { 'AC': '#4F46E5', 'Water Cooler': '#0EA5E9', 'Cleaning': '#10B981', 'Electrical': '#F59E0B' };

    // --- FILTERING LOGIC ---
    const handleKpiClick = (kpi) => {
        if (activeKpiFilter === kpi) {
            setActiveKpiFilter(null);
            setFilterStatus([]);
        } else {
            setActiveKpiFilter(kpi);
            if (kpi !== 'Total') setFilterStatus([kpi]);
            else setFilterStatus([]);
        }
    };

    const handleChartClick = (data) => {
        if (!data || !data.activePayload) return;
        const cat = data.activePayload[0].payload.name;
        if (filterCategory.includes(cat)) {
            setFilterCategory(filterCategory.filter(c => c !== cat));
        } else {
            setFilterCategory([...filterCategory, cat]);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchCat = filterCategory.length > 0 ? filterCategory.includes(t.category) : true;
        const matchStatus = filterStatus.length > 0 ? filterStatus.includes(t.status) : true;
        const matchTech = filterTechnician.length > 0 ? filterTechnician.includes(t.assigned_to) : true;
        const matchSearch = searchText ? t.id.toLowerCase().includes(searchText.toLowerCase()) || t.summary.toLowerCase().includes(searchText.toLowerCase()) : true;
        const matchKpi = activeKpiFilter && activeKpiFilter !== 'Total' ? t.status === activeKpiFilter : true;

        return matchCat && matchStatus && matchTech && matchSearch && matchKpi;
    });

    const clearAllFilters = () => {
        setFilterCategory([]);
        setFilterStatus([]);
        setFilterTechnician([]);
        setSearchText('');
        setActiveKpiFilter(null);
    };

    // --- DRAWER ACTIONS ---
    const openDrawer = (record) => {
        setEditingTicket(record);
        form.setFieldsValue({
            status: record.status,
            assigned_to: record.assigned_to,
            category: record.category,
            sla_deadline: record.sla_deadline ? dayjs(record.sla_deadline) : null,
            admin_notes: record.admin_notes || ''
        });
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
        setEditingTicket(null);
    };

    const handleUpdateTicket = async (values) => {
        const updatedTickets = tickets.map(t => {
            if (t.id === editingTicket.id) {
                return {
                    ...t,
                    status: values.status,
                    assigned_to: values.assigned_to,
                    category: values.category,
                    sla_deadline: values.sla_deadline ? values.sla_deadline.toISOString() : t.sla_deadline,
                    admin_notes: values.admin_notes
                };
            }
            return t;
        });
        setTickets(updatedTickets);

        if (editingTicket.raw_id) {
            try {
                await fetch('https://campus-companion-backend-nk3b.onrender.com/update-ticket', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ticket_id: editingTicket.raw_id,
                        status: values.status,
                        assigned_to: values.assigned_to
                    })
                });
            } catch (error) {
                console.error("Failed to sync Admin changes", error);
            }
        }

        message.success(`Ticket ${editingTicket.id} updated successfully`);
        onCloseDrawer();
    };

    // --- HELPERS ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'error';
            case 'Assigned': return 'warning';
            case 'Closed': return 'success';
            default: return 'default';
        }
    };

    const checkSlaBreach = (deadline, status) => {
        if (status === 'Closed' || !deadline) return false;
        return dayjs(deadline).isBefore(currentTime);
    };

    // --- TABLE COLUMNS ---
    const columns = [
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
            filters: [
                { text: 'AC', value: 'AC' },
                { text: 'Water Cooler', value: 'Water Cooler' },
                { text: 'Cleaning', value: 'Cleaning' },
                { text: 'Electrical', value: 'Electrical' },
            ],
            onFilter: (value, record) => record.category === value,
            render: (text) => (
                <span className="font-medium text-slate-800">{text}</span>
            ),
        },
        {
            title: 'Issue Summary',
            dataIndex: 'summary',
            key: 'summary',
            width: '25%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Open', value: 'Open' },
                { text: 'Assigned', value: 'Assigned' },
                { text: 'Closed', value: 'Closed' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={getStatusColor(status)} className="rounded-full px-3 uppercase tracking-wider text-[10px] font-bold border-0">
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assigned_to',
            key: 'assigned_to',
            filters: [
                { text: 'Tech 01', value: 'tech_01' },
                { text: 'Tech 02', value: 'tech_02' },
                { text: 'Tech 03', value: 'tech_03' },
            ],
            onFilter: (value, record) => record.assigned_to === value,
            render: (text) => text ? <Tag className="border-slate-200 text-slate-600 bg-slate-50">{text}</Tag> : <span className="text-gray-300 italic">Unassigned</span>,
        },
        {
            title: 'Ticket Aging',
            key: 'aging',
            sorter: (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(),
            render: (_, record) => {
                // Render human readable time clean format (e.g., Opened 2 hours ago -> we strip "ago" using native string interpolation or fromNow logic cleanly)
                const timeAgo = dayjs(record.created_at).fromNow(true); // true removes the "ago" suffix
                return (
                    <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                        <ClockCircleOutlined className="text-slate-400" />
                        <span>Created {timeAgo} ago</span>
                    </div>
                );
            }
        },
        {
            title: 'SLA Status',
            key: 'sla',
            sorter: (a, b) => dayjs(a.sla_deadline).valueOf() - dayjs(b.sla_deadline).valueOf(),
            render: (_, record) => {
                const isBreached = checkSlaBreach(record.sla_deadline, record.status);
                if (record.status === 'Closed') return <span className="text-slate-300">Resolved</span>;

                return isBreached ? (
                    <Tag className="rounded-full border-red-200 bg-red-50 text-red-700 font-bold m-0 border border-solid">
                        🔴 BREACHED
                    </Tag>
                ) : (
                    <span className="text-slate-600 font-medium whitespace-nowrap">
                        Due: {dayjs(record.sla_deadline).format('DD MMM YYYY')}
                    </span>
                );
            }
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    ghost
                    size="small"
                    onClick={() => openDrawer(record)}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-medium px-4"
                >
                    Manage
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="mb-6"><Skeleton title active paragraph={{ rows: 1 }} className="w-64" /></div>
                <Row gutter={[24, 24]}>
                    {[1, 2, 3, 4].map(i => <Col xs={24} sm={12} lg={6} key={i}><Card><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>)}
                </Row>
                <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
            </div>
        );
    }

    // EXPECTED RENDER SEQUENCE
    // 1. Title/Header
    // 2. KPI Cards
    // 3. Most Common Issues Chart (Full Width)
    // 4. Quick Filters
    // 5. Table

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={1} className="m-0 text-slate-800 tracking-tight" style={{ fontSize: '28px' }}>Hostel operations dashboard</Title>
                    <Text type="secondary" className="text-base text-slate-500">Live overview of active facility tickets requiring attention.</Text>
                </div>
            </div>

            <Row gutter={[24, 24]} className="mb-6 h-full lg:h-[280px]">
                <Col xs={24} lg={10} xl={10} className="h-full">
                    <Row gutter={[16, 16]} className="h-full">
                        <Col xs={24} sm={12} className="h-1/2 pb-2">
                            <div
                                onClick={() => handleKpiClick('Total')}
                                className={`h-full cursor-pointer rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col justify-center
              ${activeKpiFilter === 'Total' ? 'bg-indigo-50 border-indigo-300 shadow-md transform -translate-y-1' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100 hover:-translate-y-1 hover:shadow-lg'}
            `}
                            >
                                <Statistic
                                    title={<span className="text-slate-500 font-semibold tracking-wider uppercase text-xs flex items-center gap-2"><ContainerOutlined className="text-indigo-400" /> Total Tickets</span>}
                                    value={kpiData.total}
                                    formatter={formatter}
                                    valueStyle={{ color: '#1E293B' }}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} className="h-1/2 pb-2">
                            <div
                                onClick={() => handleKpiClick('Open')}
                                className={`h-full cursor-pointer rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col justify-center
              ${activeKpiFilter === 'Open' ? 'bg-red-50 border-red-300 shadow-md transform -translate-y-1' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100 hover:-translate-y-1 hover:shadow-lg'}
            `}
                            >
                                <Statistic
                                    title={<span className="text-slate-500 font-semibold tracking-wider uppercase text-xs flex items-center gap-2"><WarningOutlined className="text-red-400" /> Open Tickets</span>}
                                    value={kpiData.open}
                                    formatter={formatter}
                                    valueStyle={{ color: '#EF4444' }}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} className="h-1/2 pt-2">
                            <div
                                onClick={() => handleKpiClick('Assigned')}
                                className={`h-full cursor-pointer rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col justify-center
              ${activeKpiFilter === 'Assigned' ? 'bg-amber-50 border-amber-300 shadow-md transform -translate-y-1' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100 hover:-translate-y-1 hover:shadow-lg'}
            `}
                            >
                                <Statistic
                                    title={<span className="text-slate-500 font-semibold tracking-wider uppercase text-xs flex items-center gap-2"><ToolOutlined className="text-amber-400" /> Assigned</span>}
                                    value={kpiData.assigned}
                                    formatter={formatter}
                                    valueStyle={{ color: '#F59E0B' }}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} className="h-1/2 pt-2">
                            <div
                                onClick={() => handleKpiClick('Closed')}
                                className={`h-full cursor-pointer rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col justify-center
              ${activeKpiFilter === 'Closed' ? 'bg-emerald-50 border-emerald-300 shadow-md transform -translate-y-1' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100 hover:-translate-y-1 hover:shadow-lg'}
            `}
                            >
                                <Statistic
                                    title={<span className="text-slate-500 font-semibold tracking-wider uppercase text-xs flex items-center gap-2"><CheckCircleOutlined className="text-emerald-400" /> Recently Closed</span>}
                                    value={kpiData.closed}
                                    formatter={formatter}
                                    valueStyle={{ color: '#10B981' }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} lg={14} xl={14} className="h-full">
                    {/* Most Common Issues Chart (Beside KPIs) */}
                    <Card
                        title={<span className="flex items-center gap-2 section-header font-semibold text-slate-800"><DashboardOutlined className="text-indigo-500" /> Most Common Issues Pipeline</span>}
                        className="shadow-sm border-slate-200 h-full"
                        bodyStyle={{ height: 'calc(100% - 58px)', display: 'flex', flexDirection: 'column', padding: '12px 24px' }}
                    >
                        <div className="w-full flex-grow relative min-h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={commonIssuesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} onClick={handleChartClick}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                                    <YAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#F8FAFC' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontWeight: 600, color: '#1E293B' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40} className="cursor-pointer">
                                        {commonIssuesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'}
                                                style={{ opacity: filterCategory.includes(entry.name) || filterCategory.length === 0 ? 1 : 0.3 }}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-slate-400 mt-auto pt-4 text-right tracking-tight font-medium">Click a vertical bar segment above to actively filter the ticket queue below.</div>
                    </Card>
                </Col>
            </Row>

            {/* Persistent Quick Filters Panel */}
            <Card bodyStyle={{ padding: '16px 24px' }} className="border-slate-200 sticky top-0 z-20 shadow-md backdrop-blur bg-white/90">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <span className="font-semibold text-slate-700 mr-2 flex items-center gap-2"><FilterOutlined /> Quick Filters:</span>

                        <Select
                            mode="multiple"
                            placeholder="Category"
                            value={filterCategory}
                            onChange={setFilterCategory}
                            className="w-40"
                            maxTagCount="responsive"
                            bordered={true}
                        >
                            <Option value="AC">AC</Option>
                            <Option value="Water Cooler">Water Cooler</Option>
                            <Option value="Cleaning">Cleaning</Option>
                            <Option value="Electrical">Electrical</Option>
                        </Select>

                        <Select
                            mode="multiple"
                            placeholder="Status"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            className="w-40"
                            maxTagCount="responsive"
                        >
                            <Option value="Open">Open</Option>
                            <Option value="Assigned">Assigned</Option>
                            <Option value="Closed">Closed</Option>
                        </Select>

                        <Select
                            mode="multiple"
                            placeholder="Technician"
                            value={filterTechnician}
                            onChange={setFilterTechnician}
                            className="w-40"
                            maxTagCount="responsive"
                        >
                            <Option value="Tech 01 (AC)">Tech 01 (AC)</Option>
                            <Option value="Tech 02 (Electrical)">Tech 02 (Electrical)</Option>
                            <Option value="Tech 03 (Other)">Tech 03 (Other)</Option>
                            <Option value="Tech 04 (Water Cooler)">Tech 04 (Water Cooler)</Option>
                            <Option value="Tech 05 (Washing Machine)">Tech 05 (Washing Machine)</Option>
                            <Option value="Tech 06 (Cleaning)">Tech 06 (Cleaning)</Option>
                            <Option value="Tech 07 (Wifi)">Tech 07 (Wifi)</Option>
                        </Select>

                        {(filterCategory.length > 0 || filterStatus.length > 0 || filterTechnician.length > 0 || searchText || activeKpiFilter) && (
                            <Button type="link" onClick={clearAllFilters} className="text-slate-500 hover:text-indigo-600 font-medium">
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    <div className="w-full lg:w-auto">
                        <Input
                            placeholder="Search ID or Summary..."
                            prefix={<SearchOutlined className="text-slate-300" />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full lg:w-64 rounded-lg"
                            allowClear
                        />
                    </div>
                </div>
            </Card>

            {/* Main Tickets Table */}
            <Card className="shadow-sm border-slate-200 mt-6">
                <Table
                    columns={columns}
                    dataSource={filteredTickets}
                    rowKey="id"
                    pagination={{ pageSize: 8, position: ['bottomCenter'] }}
                    rowClassName={(record) => {
                        let classes = 'transition-colors hover:bg-slate-50 cursor-pointer';
                        if (checkSlaBreach(record.sla_deadline, record.status)) {
                            classes += ' border-l-[3px] border-l-red-500 bg-red-50/20';
                        } else {
                            classes += ' border-l-[3px] border-l-transparent';
                        }
                        return classes;
                    }}
                    onRow={(record) => ({
                        onClick: () => openDrawer(record),
                    })}
                    className="table-reflow-enter"
                />
            </Card>

            {/* Ticket Details Drawer */}
            <Drawer
                title={
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        Manage Ticket: <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">{editingTicket?.id}</span>
                    </div>
                }
                placement="right"
                width={480}
                onClose={onCloseDrawer}
                open={drawerVisible}
                destroyOnClose
                className="custom-drawer"
                extra={
                    <Space>
                        <Button onClick={onCloseDrawer} className="rounded-lg">Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()} className="bg-indigo-600 text-white rounded-lg shadow-md font-medium">
                            Save Changes
                        </Button>
                    </Space>
                }
            >
                {editingTicket && (
                    <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{editingTicket.summary}</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">{editingTicket.description}</p>

                        <div className="grid grid-cols-2 gap-y-4 text-sm bg-white p-4 rounded-xl border border-slate-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Room</span>
                                <span className="font-semibold text-slate-700">{editingTicket.room}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Urgency</span>
                                <span className={`font-bold ${editingTicket.urgency === 'High' ? 'text-red-500' : 'text-amber-500'}`}>{editingTicket.urgency}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Elapsed Time</span>
                                <span className="font-semibold text-slate-700">{dayjs(editingTicket.created_at).fromNow(true)} ago</span>
                            </div>
                        </div>

                        {checkSlaBreach(editingTicket.sla_deadline, editingTicket.status) && (
                            <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <WarningOutlined className="text-red-500 text-xl mt-0.5" />
                                <div>
                                    <h4 className="text-red-800 font-bold m-0 mb-1">SLA Breached</h4>
                                    <p className="text-red-600 text-sm m-0">This ticket has exceeded its resolution deadline. Proceed with urgency.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Form layout="vertical" form={form} onFinish={handleUpdateTicket} requiredMark={false} size="large">
                    <Form.Item label={<span className="font-medium text-slate-700">Ticket Status</span>} name="status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Open"><div className="flex items-center gap-2"><Tag color="error" className="m-0 border-0 rounded">Open</Tag> Needs assignment</div></Option>
                            <Option value="Assigned"><div className="flex items-center gap-2"><Tag color="warning" className="m-0 border-0 rounded">Assigned</Tag> Work in progress</div></Option>
                            <Option value="Closed"><div className="flex items-center gap-2"><Tag color="success" className="m-0 border-0 rounded">Closed</Tag> Issue resolved</div></Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">Category</span>} name="category" rules={[{ required: true }]}>
                        <Select>
                            <Option value="AC">AC</Option>
                            <Option value="Water Cooler">Water Cooler</Option>
                            <Option value="Cleaning">Cleaning</Option>
                            <Option value="Electrical">Electrical</Option>
                            <Option value="Washing Machine">Washing Machine</Option>
                            <Option value="Wifi">Wifi</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">Assign Technician</span>} name="assigned_to">
                        <Select allowClear placeholder="Select assigned technician">
                            <Option value="Tech 01 (AC)">Tech 01 (AC)</Option>
                            <Option value="Tech 02 (Electrical)">Tech 02 (Electrical)</Option>
                            <Option value="Tech 03 (Other)">Tech 03 (Other)</Option>
                            <Option value="Tech 04 (Water Cooler)">Tech 04 (Water Cooler)</Option>
                            <Option value="Tech 05 (Washing Machine)">Tech 05 (Washing Machine)</Option>
                            <Option value="Tech 06 (Cleaning)">Tech 06 (Cleaning)</Option>
                            <Option value="Tech 07 (Wifi)">Tech 07 (Wifi)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">SLA Deadline (Target Resolution Time)</span>} name="sla_deadline">
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full rounded-lg" />
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">Admin Notes</span>} name="admin_notes" className="mt-6">
                        <TextArea rows={4} placeholder="Enter internal supervisor notes here..." className="rounded-xl border-slate-200" />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default AdminDashboard;
