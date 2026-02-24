import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Skeleton } from 'antd';
import { LineChartOutlined, BarChartOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
    LineChart, Line, Legend
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// --- DUMMY DATA SERVICES ---
const generateDummyTickets = () => {
    return [
        { id: 'TKT-1002', category: 'Water Cooler', status: 'Assigned', assigned_to: 'tech_01', resolved_time_hours: null },
        { id: 'TKT-1003', category: 'Cleaning', status: 'Closed', assigned_to: 'tech_02', resolved_time_hours: 4 },
        { id: 'TKT-1006', category: 'AC', status: 'Closed', assigned_to: 'tech_01', resolved_time_hours: 2 },
        { id: 'TKT-1007', category: 'Water Cooler', status: 'Closed', assigned_to: 'tech_02', resolved_time_hours: 6 },
        { id: 'TKT-1008', category: 'Electrical', status: 'Closed', assigned_to: 'tech_03', resolved_time_hours: 1 },
        { id: 'TKT-1009', category: 'Electrical', status: 'Open', assigned_to: null, resolved_time_hours: null },
    ];
};

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const tickets = generateDummyTickets();

    useEffect(() => {
        setTimeout(() => setLoading(false), 900);
    }, []);

    // 1. Avg Resolution Time by Category
    const getAvgResolutionData = () => {
        const closed = tickets.filter(t => t.status === 'Closed' && t.resolved_time_hours);
        const aggs = {};
        closed.forEach(t => {
            if (!aggs[t.category]) aggs[t.category] = { total: 0, count: 0 };
            aggs[t.category].total += t.resolved_time_hours;
            aggs[t.category].count += 1;
        });
        return Object.keys(aggs).map(cat => ({
            name: cat,
            AvgHours: Number((aggs[cat].total / aggs[cat].count).toFixed(1))
        }));
    };
    const avgResolutionData = getAvgResolutionData();

    // 2. Resolution Trend Chart (Dummy dates mapping)
    const resolutionTrendData = [
        { date: '01 Mar 2026', 'Avg Resolution Time (hours)': 4.2 },
        { date: '02 Mar 2026', 'Avg Resolution Time (hours)': 3.8 },
        { date: '03 Mar 2026', 'Avg Resolution Time (hours)': 5.1 },
        { date: '04 Mar 2026', 'Avg Resolution Time (hours)': 2.5 },
        { date: '05 Mar 2026', 'Avg Resolution Time (hours)': 3.0 },
        { date: '06 Mar 2026', 'Avg Resolution Time (hours)': 4.5 },
        { date: '07 Mar 2026', 'Avg Resolution Time (hours)': 2.2 },
    ];

    // 3. Technician Comparison
    const getTechCompData = () => {
        const counts = {};
        tickets.filter(t => t.assigned_to).forEach(t => {
            if (!counts[t.assigned_to]) counts[t.assigned_to] = { active: 0, closed: 0, totalHours: 0 };
            if (t.status === 'Closed') {
                counts[t.assigned_to].closed += 1;
                counts[t.assigned_to].totalHours += (t.resolved_time_hours || 0);
            }
        });

        return [
            { name: 'Arjun P.', AvgHours: 2.5 },
            { name: 'Vikram S.', AvgHours: 4.1 },
            { name: 'Neha R.', AvgHours: 1.8 }
        ];
    };
    const techCompData = getTechCompData();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="mb-6"><Skeleton title active paragraph={{ rows: 1 }} className="w-64" /></div>
                <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={1} className="m-0 text-slate-800 tracking-tight" style={{ fontSize: '28px' }}>Resolution Time Analytics</Title>
                    <Text type="secondary" className="text-base text-slate-500">Executive overview of operational efficiency mapping.</Text>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {/* Chart 1: Avg Resolution by Category */}
                <Col xs={24} lg={24} xl={8}>
                    <Card
                        title={<span className="text-slate-800 font-semibold text-lg flex items-center gap-2"><BarChartOutlined className="text-indigo-500" /> Avg Resolution Time by Category</span>}
                        className="shadow-sm border-slate-200"
                    >
                        <div className="aspect-square min-h-[300px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={avgResolutionData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Category', position: 'insideBottom', offset: -15, fill: '#64748B', fontSize: 13 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 13, fill: '#475569' }}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Avg Resolution Time (hours)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748B', fontSize: 13 }}
                                    />
                                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Bar dataKey="AvgHours" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Chart 2: Trend Over Time */}
                <Col xs={24} lg={24} xl={8}>
                    <Card
                        title={<span className="text-slate-800 font-semibold text-lg flex items-center gap-2"><LineChartOutlined className="text-emerald-500" /> Resolution Trend Over Time</span>}
                        className="shadow-sm border-slate-200"
                    >
                        <div className="aspect-square min-h-[300px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={resolutionTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12, fill: '#475569' }}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Date', position: 'insideBottom', offset: -15, fill: '#64748B', fontSize: 13 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 13, fill: '#475569' }}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Avg Resolution Time (hours)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748B', fontSize: 13 }}
                                    />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600, color: '#10B981' }} />
                                    <Line type="monotone" dataKey="Avg Resolution Time (hours)" stroke="#10B981" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Chart 3: Tech Comparison */}
                <Col xs={24} xl={8}>
                    <Card
                        title={<span className="text-slate-800 font-semibold text-lg flex items-center gap-2"><UsergroupAddOutlined className="text-amber-500" /> Technician Comparison</span>}
                        className="shadow-sm border-slate-200"
                    >
                        <div className="aspect-square min-h-[300px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={techCompData} layout="vertical" margin={{ top: 10, right: 40, left: 40, bottom: 20 }} barCategoryGap={30}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 13, fill: '#475569' }}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Avg Resolution Time (hours)', position: 'insideBottomRight', offset: -10, fill: '#64748B', fontSize: 13 }}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 13, fill: '#1E293B', fontWeight: 600 }}
                                        label={{ value: 'Technician Name', angle: -90, position: 'insideLeft', offset: -25, fill: '#64748B', fontSize: 13 }}
                                    />
                                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Bar dataKey="AvgHours" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={35} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsDashboard;
