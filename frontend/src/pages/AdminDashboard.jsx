import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Typography, Statistic, Table, Tag, Button,
    Input, Select, Space, Drawer, Form, DatePicker, message, Skeleton, Radio
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
    FireOutlined,
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
const { RangePicker } = DatePicker;

// --- DUMMY DATA SERVICES ---
const generateDummyTickets = () => {
    return [
        { id: 'TKT-1001', category: 'AC', summary: 'AC not cooling in Room 201', status: 'Open', assigned_to: null, sla_deadline: dayjs().add(2, 'hour').toISOString(), created_at: dayjs().subtract(3, 'hour').toISOString(), urgency: 'High', room: '201', description: 'The AC blows warm air.', hostel_building: 'B26' },
        { id: 'TKT-1002', category: 'Water Dispenser', summary: 'Water leaking on 3rd floor', status: 'Assigned', assigned_to: 'Tech 04 (Water Dispenser)', sla_deadline: dayjs().subtract(1, 'hour').toISOString(), created_at: dayjs().subtract(5, 'hour').toISOString(), urgency: 'High', room: '3rd Floor Lobby', description: 'Massive puddle forming.', resolved_time_hours: null, hostel_building: 'B27' },
        { id: 'TKT-1003', category: 'Cleaning', summary: 'Room 405 needs deep clean', status: 'Closed', assigned_to: 'Tech 06 (Cleaning)', sla_deadline: dayjs().subtract(1, 'day').toISOString(), created_at: dayjs().subtract(2, 'day').toISOString(), urgency: 'Low', room: '405', description: 'Dust everywhere post holiday.', resolved_time_hours: 4, hostel_building: 'LH' },
        { id: 'TKT-1004', category: 'AC', summary: 'Strange noise from vent', status: 'Open', assigned_to: null, sla_deadline: dayjs().add(5, 'hour').toISOString(), created_at: dayjs().subtract(1, 'hour').toISOString(), urgency: 'Medium', room: '102', description: 'Clicking sound constantly.', hostel_building: 'B29' },
        { id: 'TKT-1005', category: 'Electrical', summary: 'Tube light broken', status: 'Closed', assigned_to: 'Tech 02 (Electrical)', sla_deadline: dayjs().add(1, 'day').toISOString(), created_at: dayjs().subtract(4, 'day').toISOString(), urgency: 'Low', room: 'Library', description: 'Flickers then dies.', resolved_time_hours: 2, hostel_building: 'B30' },
    ];
};

const initialTickets = generateDummyTickets();

// --- API HELPERS ---
const getCategory = (rawCat) => {
    if (!rawCat) return 'Other';
    const lower = rawCat.toLowerCase();

    // Strict mapping 
    if (lower.includes('cleaning')) return 'Cleaning';
    if (lower.includes('wash_mach') || lower.includes('washing')) return 'Washing Machine';
    if (lower.includes('vending')) return 'Vending Machine';
    if (lower.includes('geyser')) return 'Geyser';
    if (lower.includes('oven')) return 'Oven';
    if (lower.includes('fridge')) return 'Fridge';
    if (lower.includes('water_disp') || lower.includes('dispenser') || lower.includes('cooler')) return 'Water Dispenser';
    if (lower.includes('washroom') || lower.includes('plumbing') || lower.includes('leak')) return 'Washroom Issues';
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network')) return 'WiFi';
    if (lower.includes('ac') || lower.includes('air_cond')) return 'AC';
    if (lower.includes('electrical') || lower.includes('light') || lower.includes('fan')) return 'Electrical';
    if (lower.includes('furniture') || lower.includes('bed') || lower.includes('chair') || lower.includes('table')) return 'Furniture';
    if (lower.includes('elevator') || lower.includes('lift')) return 'Electrical'; // Fallback

    return 'Other';
};

const getAssignedTech = (mappedCategory) => {
    switch (mappedCategory) {
        case 'AC': return 'Tech 01 (AC)';
        case 'Electrical': return 'Tech 02 (Electrical)';
        case 'Washroom Issues': return 'Tech 03 (Washroom Issues)';
        case 'Water Dispenser': return 'Tech 04 (Water Dispenser)';
        case 'Washing Machine': return 'Tech 05 (Washing Machine)';
        case 'Cleaning': return 'Tech 06 (Cleaning)';
        case 'WiFi': return 'Tech 07 (WiFi)';
        case 'Vending Machine': return 'Tech 08 (Vending Machine)';
        case 'Geyser': return 'Tech 09 (Geyser)';
        case 'Oven': return 'Tech 10 (Oven)';
        case 'Fridge': return 'Tech 11 (Fridge)';
        case 'Furniture': return 'Tech 12 (Furniture)';
        default: return `Tech 00 (${mappedCategory})`;
    }
};

const isValidBlock = (block) => ['B26', 'B27', 'B29', 'B30', 'LH'].includes(block);

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
        urgency: data.priority ? toSentenceCase(data.priority) : 'Medium',
        room: data.room,
        hostel_building: isValidBlock(data.hostel_building) ? data.hostel_building : '',
        description: data.description,
        resolved_time_hours: data.status === 'Closed' ? 2 : null,
        admin_notes: data.admin_comment || '',
        phone: data.phone ? String(data.phone).substring(2) : '',
        name: data.name ? toSentenceCase(data.name) : ''
    };
};

const AdminDashboard = () => {
    const [tickets, setTickets] = useState(initialTickets);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(dayjs());

    // Advanced Multi-Filters State
    const [activeKpiFilter, setActiveKpiFilter] = useState(null); // 'Total', 'Open', 'Assigned', 'Closed'
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterBlock, setFilterBlock] = useState([]);
    const [filterStatus, setFilterStatus] = useState([]);
    const [filterTechnician, setFilterTechnician] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [dateFilter, setDateFilter] = useState('1M'); // '1W', '1M', 'CUSTOM'
    const [customDateRange, setCustomDateRange] = useState([null, null]);
    const [chartView, setChartView] = useState('Category'); // 'Category' or 'Block'
    const [filterBreached, setFilterBreached] = useState(false);
    const [filterUrgent, setFilterUrgent] = useState(false);

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
                    setTickets(liveTickets);
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

    // --- CHART COMPUTATIONS ---
    const filteredByDateAndBlockTickets = tickets.filter(t => {
        // Date Logic
        const diffDays = dayjs().diff(dayjs(t.created_at), 'day');
        if (dateFilter === '1W') return diffDays <= 7;
        if (dateFilter === '1M') return diffDays <= 30;
        if (dateFilter === 'CUSTOM' && customDateRange[0] && customDateRange[1]) {
            return dayjs(t.created_at).isAfter(customDateRange[0].startOf('day')) &&
                dayjs(t.created_at).isBefore(customDateRange[1].endOf('day'));
        }
        return true;
    });

    const kpiData = {
        total: filteredByDateAndBlockTickets.length,
        open: filteredByDateAndBlockTickets.filter(t => t.status === 'Open').length,
        assigned: filteredByDateAndBlockTickets.filter(t => t.status === 'Assigned').length,
        closed: filteredByDateAndBlockTickets.filter(t => t.status === 'Closed').length,
    };

    const formatter = (value) => <CountUp end={value} duration={1.5} className="kpi-number" />;

    // 1. Most frequent issues Data
    const getCommonIssues = () => {
        const counts = {};
        if (chartView === 'Category') {
            filteredByDateAndBlockTickets.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
        } else {
            filteredByDateAndBlockTickets.forEach(t => {
                const block = t.hostel_building || (isValidBlock(t.room) ? t.room : ''); // fallback just in case
                if (isValidBlock(block)) {
                    counts[block] = (counts[block] || 0) + 1;
                }
            });
        }
        return Object.keys(counts).map(key => ({ name: key, count: counts[key] })).sort((a, b) => b.count - a.count).slice(0, 5);
    };
    const commonIssuesData = getCommonIssues();
    const CATEGORY_COLORS = { 'AC': '#4F46E5', 'Water Cooler': '#0EA5E9', 'Cleaning': '#10B981', 'Electrical': '#F59E0B', 'Washing Machine': '#8B5CF6', 'Washroom Issues': '#EC4899', 'WiFi': '#14B8A6', 'Furniture': '#F97316', 'Fridge': '#3B82F6', 'Oven': '#EF4444', 'Vending Machine': '#FBBF24', 'Geyser': '#06B6D4', 'Water Dispenser': '#84CC16' };

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
        if (!data || !data.activePayload) {
            if (chartView === 'Category') setFilterCategory([]);
            else setFilterBlock([]);
            return;
        }
        const val = data.activePayload[0].payload.name;
        if (chartView === 'Category') {
            setFilterCategory([val]);
            setFilterBlock([]); // mutually exclusive quick filtering from chart
        } else {
            setFilterBlock([val]);
            setFilterCategory([]);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const isBreached = checkSlaBreach(t.sla_deadline, t.status);
        const isUrgent = t.urgency?.toUpperCase() === 'HIGH';

        if (filterBreached && !isBreached) return false;
        if (filterUrgent && !isUrgent) return false;

        let matchDate = true;
        if (!filterBreached && !filterUrgent) {
            const diffDays = dayjs().diff(dayjs(t.created_at), 'day');
            if (dateFilter === '1W') matchDate = diffDays <= 7;
            if (dateFilter === '1M') matchDate = diffDays <= 30;
            if (dateFilter === 'CUSTOM' && customDateRange[0] && customDateRange[1]) {
                matchDate = dayjs(t.created_at).isAfter(customDateRange[0].startOf('day')) &&
                    dayjs(t.created_at).isBefore(customDateRange[1].endOf('day'));
            }
        }

        const matchCat = filterCategory.length > 0 ? filterCategory.includes(t.category) : true;
        const matchBlock = filterBlock.length > 0 ? filterBlock.includes(t.hostel_building) : true;
        const matchStatus = filterStatus.length > 0 ? filterStatus.includes(t.status) : true;
        const matchTech = filterTechnician.length > 0 ? filterTechnician.includes(t.assigned_to) : true;
        const matchSearch = searchText ? t.id.toLowerCase().includes(searchText.toLowerCase()) || t.summary.toLowerCase().includes(searchText.toLowerCase()) || (t.room && t.room.toLowerCase().includes(searchText.toLowerCase())) : true;
        const matchKpi = activeKpiFilter && activeKpiFilter !== 'Total' ? t.status === activeKpiFilter : true;

        return matchDate && matchCat && matchBlock && matchStatus && matchTech && matchSearch && matchKpi;
    });

    const clearAllFilters = () => {
        setFilterCategory([]);
        setFilterBlock([]);
        setFilterStatus([]);
        setFilterTechnician([]);
        setSearchText('');
        setActiveKpiFilter(null);
        setFilterBreached(false);
        setFilterUrgent(false);
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
                        assigned_to: values.assigned_to,
                        category: values.category,
                        admin_comment: values.admin_notes || ''
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

    function checkSlaBreach(deadline, status) {
        if (status === 'Closed' || !deadline) return false;
        return dayjs(deadline).isBefore(currentTime);
    }

    // Pre-calculate exact category frequencies from ALL valid tickets
    const categoryFrequencies = {};
    const ALL_CATEGORIES = [
        "Washing Machine", "Vending Machine", "Geyser", "Oven", "Fridge",
        "Water Dispenser", "Washroom Issues", "WiFi", "Electrical", "AC", "Furniture", "Cleaning"
    ];

    ALL_CATEGORIES.forEach(cat => categoryFrequencies[cat] = 0);
    tickets.forEach(t => {
        if (categoryFrequencies[t.category] !== undefined) {
            categoryFrequencies[t.category]++;
        }
    });

    // --- TABLE COLUMNS ---
    const columns = [
        {
            title: 'Ticket ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (text) => <span className="font-semibold text-slate-700">{text}</span>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 160,
            filters: ALL_CATEGORIES.map(cat => ({
                text: `${cat} (${categoryFrequencies[cat]})`,
                value: cat
            })),
            onFilter: (value, record) => record.category === value,
            render: (text) => (
                <Tag color={CATEGORY_COLORS[text] || 'default'} className="rounded-full px-3 font-medium border-0 shadow-sm whitespace-nowrap">
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Issue Summary',
            dataIndex: 'summary',
            key: 'summary',
            width: '25%',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-800 break-words line-clamp-2" title={text}>{text}</span>
                    <a className="text-indigo-600 text-xs mt-1 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); openDrawer(record); }}>
                        Read more
                    </a>
                </div>
            )
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
                { text: 'Tech 01', value: 'Tech 01 (AC)' },
                { text: 'Tech 02', value: 'Tech 02 (Electrical)' },
                { text: 'Tech 04', value: 'Tech 04 (Water Dispenser)' },
                { text: 'Tech 05', value: 'Tech 05 (Washing Machine)' },
                { text: 'Tech 06', value: 'Tech 06 (Cleaning)' },
                { text: 'Tech 07', value: 'Tech 07 (WiFi)' },
            ],
            onFilter: (value, record) => record.assigned_to === value,
            render: (text) => text ? <Tag className="border-slate-200 text-slate-600 bg-slate-50">{text}</Tag> : <span className="text-gray-300 italic">Unassigned</span>,
        },
        {
            title: 'Block Number',
            dataIndex: 'hostel_building',
            key: 'hostel_building',
            sorter: (a, b) => (a.hostel_building || '').localeCompare(b.hostel_building || ''),
            render: (text) => <span className="font-semibold text-slate-600">{text || 'N/A'}</span>,
        },
        {
            title: 'Room Number',
            dataIndex: 'room',
            key: 'room',
            sorter: (a, b) => (a.room || '').localeCompare(b.room || ''),
            render: (text) => <span className="font-medium text-slate-700">{text || 'N/A'}</span>,
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



            <Row gutter={[24, 24]} className="mb-6 lg:h-[280px] mt-6">
                <Col xs={24} lg={10} xl={10}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} className="h-[132px]">
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
                        <Col xs={24} sm={12} className="h-[132px]">
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
                        <Col xs={24} sm={12} className="h-[132px]">
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
                        <Col xs={24} sm={12} className="h-[132px]">
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
                    {/* Most frequent issues Chart (Beside KPIs) */}
                    <Card
                        title={
                            <div className="flex justify-between items-center w-full">
                                <span className="flex items-center gap-2 section-header font-semibold text-slate-800"><DashboardOutlined className="text-indigo-500" /> Active Issues Tracker</span>
                                <Radio.Group value={chartView} onChange={(e) => { setChartView(e.target.value); setFilterCategory([]); setFilterBlock([]); }} size="small" buttonStyle="solid" className="flex gap-2">
                                    <Radio.Button value="Category" className="rounded border">Category</Radio.Button>
                                    <Radio.Button value="Block" className="rounded border">Block</Radio.Button>
                                </Radio.Group>
                            </div>
                        }
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
                                        {commonIssuesData.map((entry, index) => {
                                            const isActive = chartView === 'Block' ? (filterBlock.length === 0 || filterBlock.includes(entry.name)) : (filterCategory.length === 0 || filterCategory.includes(entry.name));
                                            return (
                                                <Cell key={`cell-${index}`} fill={chartView === 'Block' ? '#F59E0B' : (CATEGORY_COLORS[entry.name] || '#94A3B8')}
                                                    style={{ opacity: isActive ? 1 : 0.3 }}
                                                />
                                            );
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-slate-400 mt-auto pt-4 text-right tracking-tight font-medium">Click a bar to filter the ticket queue. Click chart background to reset.</div>
                    </Card>
                </Col>
            </Row>

            {/* Persistent Quick Filters Panel */}
            <Card bodyStyle={{ padding: '12px 16px' }} className="border-slate-200 sticky top-0 z-20 shadow-md backdrop-blur bg-white/90">
                <div className="flex flex-nowrap items-center gap-2 w-full overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            type="default"
                            onClick={() => setFilterBreached(!filterBreached)}
                            className={filterBreached ? '!bg-orange-500 !border-orange-500 !text-white shadow-sm font-medium shrink-0 hover:!bg-orange-600 hover:!border-orange-600' : 'font-medium text-slate-600 border-slate-300 shrink-0 hover:border-orange-500 hover:text-orange-500'}
                            icon={<WarningOutlined />}
                        >
                            Breached
                        </Button>
                        <Button
                            type={filterUrgent ? 'primary' : 'default'}
                            danger={filterUrgent}
                            onClick={() => setFilterUrgent(!filterUrgent)}
                            className={filterUrgent ? 'bg-red-500 border-red-500 shadow-sm font-medium shrink-0' : 'font-medium text-slate-600 border-slate-300 shrink-0'}
                            icon={<FireOutlined />}
                        >
                            Urgent
                        </Button>
                    </div>

                    <Select
                        mode="multiple"
                        placeholder="Category"
                        value={filterCategory}
                        onChange={setFilterCategory}
                        className="w-[130px] shrink-0"
                        maxTagCount={1}
                        bordered={true}
                    >
                        <Option value="Washing Machine">Washing Machine</Option>
                        <Option value="Vending Machine">Vending Machine</Option>
                        <Option value="Geyser">Geyser</Option>
                        <Option value="Oven">Oven</Option>
                        <Option value="Fridge">Fridge</Option>
                        <Option value="Water Dispenser">Water Dispenser</Option>
                        <Option value="Washroom Issues">Washroom Issues</Option>
                        <Option value="WiFi">WiFi</Option>
                        <Option value="Electrical">Electrical</Option>
                        <Option value="AC">AC</Option>
                        <Option value="Furniture">Furniture</Option>
                    </Select>

                    <Select
                        mode="multiple"
                        placeholder="Block"
                        value={filterBlock}
                        onChange={setFilterBlock}
                        className="w-[100px] shrink-0"
                        maxTagCount={1}
                        bordered={true}
                    >
                        <Option value="B26">B26</Option>
                        <Option value="B27">B27</Option>
                        <Option value="B29">B29</Option>
                        <Option value="B30">B30</Option>
                        <Option value="LH">LH</Option>
                    </Select>

                    <div className="flex items-center gap-2 shrink-0">
                        <Select
                            value={dateFilter}
                            onChange={setDateFilter}
                            className="w-[110px]"
                            bordered={true}
                            disabled={filterBreached || filterUrgent}
                        >
                            <Option value="1W">1 Week</Option>
                            <Option value="1M">1 Month</Option>
                            <Option value="CUSTOM">Custom</Option>
                        </Select>

                        {dateFilter === 'CUSTOM' && !(filterBreached || filterUrgent) && (
                            <RangePicker
                                onChange={(dates) => setCustomDateRange(dates || [null, null])}
                                value={customDateRange}
                                className="rounded-lg w-[200px]"
                            />
                        )}
                    </div>

                    <Select
                        mode="multiple"
                        placeholder="Status"
                        value={filterStatus}
                        onChange={setFilterStatus}
                        className="w-[110px] shrink-0"
                        maxTagCount={1}
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
                        className="w-[130px] shrink-0"
                        maxTagCount={1}
                    >
                        <Option value="Tech 01 (AC)">Tech 01 (AC)</Option>
                        <Option value="Tech 02 (Electrical)">Tech 02 (Electrical)</Option>
                        <Option value="Tech 03 (Washroom Issues)">Tech 03 (Washroom Issues)</Option>
                        <Option value="Tech 04 (Water Dispenser)">Tech 04 (Water Dispenser)</Option>
                        <Option value="Tech 05 (Washing Machine)">Tech 05 (Washing Machine)</Option>
                        <Option value="Tech 06 (Cleaning)">Tech 06 (Cleaning)</Option>
                        <Option value="Tech 07 (WiFi)">Tech 07 (WiFi)</Option>
                        <Option value="Tech 08 (Vending Machine)">Tech 08 (Vending Machine)</Option>
                        <Option value="Tech 09 (Geyser)">Tech 09 (Geyser)</Option>
                        <Option value="Tech 10 (Oven)">Tech 10 (Oven)</Option>
                        <Option value="Tech 11 (Fridge)">Tech 11 (Fridge)</Option>
                        <Option value="Tech 12 (Furniture)">Tech 12 (Furniture)</Option>
                    </Select>

                    <Input
                        placeholder="Search..."
                        prefix={<SearchOutlined className="text-slate-300" />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="w-[140px] shrink-0 rounded-lg flex-1 min-w-[120px]"
                        allowClear
                    />

                    {(filterCategory.length > 0 || filterStatus.length > 0 || filterTechnician.length > 0 || searchText || activeKpiFilter || filterBreached || filterUrgent || filterBlock.length > 0) && (
                        <Button type="link" onClick={clearAllFilters} className="text-slate-500 hover:text-indigo-600 font-medium shrink-0 px-2">
                            Clear
                        </Button>
                    )}
                </div>
            </Card >

            {/* Main Tickets Table */}
            < Card id="tickets-table" className="shadow-sm border-slate-200 mt-6" >
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
            </Card >

            {/* Ticket Details Drawer */}
            < Drawer
                title={
                    < div className="flex items-center gap-2 text-xl font-semibold" >
                        Manage Ticket: <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">{editingTicket?.id}</span>
                    </div >
                }
                placement="right"
                width={480}
                onClose={onCloseDrawer}
                open={drawerVisible}
                destroyOnClose
                className="custom-drawer"
                extra={
                    < Space >
                        <Button onClick={onCloseDrawer} className="rounded-lg">Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()} className="bg-indigo-600 text-white rounded-lg shadow-md font-medium">
                            Save Changes
                        </Button>
                    </Space >
                }
            >
                {editingTicket && (
                    <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="grid grid-cols-2 gap-y-5 text-sm bg-white p-5 rounded-xl border border-slate-100">
                            <div className="flex flex-col gap-1 col-span-2 pb-4 border-b border-slate-100">
                                <span className="text-slate-800 text-sm uppercase tracking-wider font-bold">Issue</span>
                                <span className="font-normal text-slate-700 whitespace-pre-line text-sm leading-relaxed mt-1">{editingTicket.description || editingTicket.summary}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Hostel Building</span>
                                <span className="font-semibold text-slate-700">{editingTicket.hostel_building || 'Hostel 1'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Room</span>
                                <span className="font-semibold text-slate-700">{editingTicket.room || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Created On</span>
                                <span className="font-semibold text-slate-700">{dayjs(editingTicket.created_at).format('DD MMM YYYY, hh:mm A')}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Urgency</span>
                                <span className={`font-bold ${editingTicket.urgency?.toUpperCase() === 'HIGH' ? 'text-red-500' : (editingTicket.urgency?.toUpperCase() === 'LOW' ? 'text-purple-500' : 'text-amber-500')}`}>{editingTicket.urgency?.toUpperCase() || 'MEDIUM'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Contact Number</span>
                                {editingTicket.phone ? (
                                    <span className="font-semibold text-slate-700 font-mono">{editingTicket.phone}</span>
                                ) : (
                                    <span className="font-semibold text-slate-400 italic">Not provided</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Name</span>
                                {editingTicket.name ? (
                                    <span className="font-semibold text-slate-700">{editingTicket.name}</span>
                                ) : (
                                    <span className="font-semibold text-slate-400 italic">Not provided</span>
                                )}
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
                            <Option value="Washing Machine">Washing Machine</Option>
                            <Option value="Vending Machine">Vending Machine</Option>
                            <Option value="Geyser">Geyser</Option>
                            <Option value="Oven">Oven</Option>
                            <Option value="Fridge">Fridge</Option>
                            <Option value="Water Dispenser">Water Dispenser</Option>
                            <Option value="Washroom Issues">Washroom Issues</Option>
                            <Option value="WiFi">WiFi</Option>
                            <Option value="Electrical">Electrical</Option>
                            <Option value="AC">AC</Option>
                            <Option value="Furniture">Furniture</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">Assign Technician</span>} name="assigned_to">
                        <Select allowClear placeholder="Select assigned technician">
                            <Option value="Tech 01 (AC)">Tech 01 (AC)</Option>
                            <Option value="Tech 02 (Electrical)">Tech 02 (Electrical)</Option>
                            <Option value="Tech 03 (Washroom Issues)">Tech 03 (Washroom Issues)</Option>
                            <Option value="Tech 04 (Water Dispenser)">Tech 04 (Water Dispenser)</Option>
                            <Option value="Tech 05 (Washing Machine)">Tech 05 (Washing Machine)</Option>
                            <Option value="Tech 06 (Cleaning)">Tech 06 (Cleaning)</Option>
                            <Option value="Tech 07 (WiFi)">Tech 07 (WiFi)</Option>
                            <Option value="Tech 08 (Vending Machine)">Tech 08 (Vending Machine)</Option>
                            <Option value="Tech 09 (Geyser)">Tech 09 (Geyser)</Option>
                            <Option value="Tech 10 (Oven)">Tech 10 (Oven)</Option>
                            <Option value="Tech 11 (Fridge)">Tech 11 (Fridge)</Option>
                            <Option value="Tech 12 (Furniture)">Tech 12 (Furniture)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">SLA Deadline (Target Resolution Time)</span>} name="sla_deadline">
                        <DatePicker format="YYYY-MM-DD" className="w-full rounded-lg" />
                    </Form.Item>

                    <Form.Item label={<span className="font-medium text-slate-700">Admin Notes</span>} name="admin_notes" className="mt-6">
                        <TextArea rows={4} placeholder="Enter internal supervisor notes here..." className="rounded-xl border-slate-200" />
                    </Form.Item>
                </Form>
            </Drawer >
        </div >
    );
};

export default AdminDashboard;
