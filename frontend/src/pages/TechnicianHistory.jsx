import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Input } from 'antd';
import { HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// --- DUMMY HISTORY DATA ---
const generateHistory = () => {
    return [
        { id: 'TKT-0994', category: 'Electrical', summary: 'Fan regulator replaced', room: '104', closed_date: dayjs().subtract(1, 'day').toISOString(), resolution_time: '2h 15m' },
        { id: 'TKT-0982', category: 'AC', summary: 'Filter cleaned', room: '202', closed_date: dayjs().subtract(2, 'day').toISOString(), resolution_time: '45m' },
        { id: 'TKT-0975', category: 'Cleaning', summary: 'Spill on 2nd floor corridor', room: 'Corridor 2', closed_date: dayjs().subtract(3, 'day').toISOString(), resolution_time: '20m' },
        { id: 'TKT-0960', category: 'Water Cooler', summary: 'Tap replaced', room: 'Ground Floor', closed_date: dayjs().subtract(5, 'day').toISOString(), resolution_time: '1h 30m' },
        { id: 'TKT-0951', category: 'Plumbing', summary: 'Blockage cleared', room: 'Men\'s Washroom 1F', closed_date: dayjs().subtract(6, 'day').toISOString(), resolution_time: '3h 10m' },
    ];
};

const TechnicianHistory = () => {
    const [history, setHistory] = useState(generateHistory());
    const [searchText, setSearchText] = useState('');

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
            render: (text) => <Tag className="border-slate-200 text-slate-600 bg-slate-50">{text}</Tag>
        },
        {
            title: 'Issue Summary',
            dataIndex: 'summary',
            key: 'summary',
            width: '40%',
            render: (text, record) => (
                <div>
                    <div className="font-semibold text-slate-800">{text}</div>
                    <div className="text-xs text-slate-400 mt-1">{record.room}</div>
                </div>
            )
        },
        {
            title: 'Closed Date',
            dataIndex: 'closed_date',
            key: 'closed_date',
            sorter: (a, b) => dayjs(b.closed_date).valueOf() - dayjs(a.closed_date).valueOf(),
            defaultSortOrder: 'descend',
            render: (text) => <span className="text-slate-600 font-medium">{dayjs(text).format('DD MMM YYYY, hh:mm A')}</span>
        },
        {
            title: 'Resolution Time',
            dataIndex: 'resolution_time',
            key: 'resolution_time',
            align: 'right',
            render: (text) => <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">{text}</span>
        },
    ];

    const filteredHistory = history.filter(t =>
        t.id.toLowerCase().includes(searchText.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchText.toLowerCase()) ||
        t.room.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Title level={2} className="m-0 text-slate-800 tracking-tight flex items-center gap-3">
                        <HistoryOutlined className="text-indigo-500" /> Closed History
                    </Title>
                    <Text type="secondary" className="text-base text-slate-500">Log of your recently completed assignments.</Text>
                </div>

                <Input
                    placeholder="Search by ID, summary, or room..."
                    prefix={<SearchOutlined className="text-slate-300" />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="w-full sm:w-72 rounded-xl h-10 border-slate-200"
                    allowClear
                />
            </div>

            <Card className="shadow-sm border-slate-200" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={filteredHistory}
                    rowKey="id"
                    pagination={{ pageSize: 15, position: ['bottomCenter'] }}
                    className="mobile-optimized-table"
                />
            </Card>
        </div>
    );
};

export default TechnicianHistory;
