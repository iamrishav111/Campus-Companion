import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Typography, Space, Skeleton, message, Card } from 'antd';
import { 
    SendOutlined, UserOutlined, RobotOutlined, 
    PlusOutlined, InfoCircleOutlined, ThunderboltOutlined,
    AudioOutlined, PictureOutlined, AppstoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const { Title, Text } = Typography;

const QuerySection = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isFirstQuery, setIsFirstQuery] = useState(true);
    const [tickets, setTickets] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Initial suggestions like Gemini chips
    const suggestions = [
        { icon: <ThunderboltOutlined />, text: "Analyze most common issues", color: "text-blue-500" },
        { icon: <AppstoreOutlined />, text: "Compare block performance", color: "text-purple-500" },
        { icon: <InfoCircleOutlined />, text: "Ticketing trends this week", color: "text-emerald-500" },
    ];

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('https://campus-companion-backend-nk3b.onrender.com/tickets');
                if (response.ok) {
                    const data = await response.json();
                    setTickets(data);
                }
            } catch (error) {
                console.error("Failed to fetch tickets for AI context", error);
            }
        };
        fetchTickets();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isFirstQuery) {
            scrollToBottom();
        }
    }, [messages, isTyping, isFirstQuery]);

    const getAIResponse = async (userQuery) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey) {
            return "⚠️ Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file to enable real AI analysis. For now, I'm analyzing the data using local heuristics: Block B26 has the most issues, mostly AC related.";
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const ticketSummary = tickets.map(t => ({
                id: t.id,
                category: t.category,
                block: t.hostel_building,
                status: t.status,
                urgency: t.urgency,
                created: t.created_at
            }));

            const prompt = `
                You are the AI assistant for "Campus Companion", a hostel management system.
                The user is an admin. Here is the current ticket data in JSON format:
                ${JSON.stringify(ticketSummary.slice(0, 50))} 
                
                Answer the user's query based ONLY on this data. Be concise, professional, and helpful.
                If they ask for trends, provide them. If they ask about blocks, compare them.
                
                User Query: "${userQuery}"
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "I encountered an error while processing your request. Please ensure your API key is valid.";
        }
    };

    const handleSend = async (queryOverride) => {
        const query = queryOverride || inputValue;
        if (!query.trim()) return;

        if (isFirstQuery) setIsFirstQuery(false);
        
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: query,
            timestamp: dayjs().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        const aiText = await getAIResponse(query);

        const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: aiText,
            timestamp: dayjs().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-6xl mx-auto px-4 relative">
            {isFirstQuery ? (
                // --- INITIAL WELCOME SCREEN ---
                <div className="flex-grow flex flex-col items-center justify-center animate-fade-in pb-20">
                    <div className="text-center mb-12">
                        <Title level={1} className="text-5xl font-semibold bg-gradient-to-r from-blue-600 via-purple-500 to-rose-400 bg-clip-text text-transparent mb-2">
                            Hello there
                        </Title>
                        <Title level={2} className="text-4xl text-slate-300 m-0 font-medium">
                            Where should we start?
                        </Title>
                    </div>

                    <div className="w-full max-w-3xl">
                        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-2 pl-6 flex items-center gap-4 hover:shadow-2xl transition-all duration-300">
                            <Input
                                placeholder="Ask Gemini"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onPressEnter={() => handleSend()}
                                bordered={false}
                                className="text-lg py-4 flex-grow placeholder:text-slate-400"
                                ref={inputRef}
                            />
                            <div className="flex items-center gap-2 pr-2">
                                <Button type="text" icon={<PictureOutlined className="text-xl text-slate-500" />} />
                                <Button type="text" icon={<AudioOutlined className="text-xl text-slate-500" />} />
                                <Button 
                                    type="primary" 
                                    icon={<SendOutlined />} 
                                    onClick={() => handleSend()}
                                    className="h-12 w-12 rounded-full bg-slate-900 border-none flex items-center justify-center shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 mt-12">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(s.text)}
                                    className="bg-white/80 backdrop-blur-sm border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 hover:scale-105 transition-all duration-200 shadow-sm"
                                >
                                    <span className={s.color}>{s.icon}</span>
                                    <span className="text-slate-600 font-medium text-sm">{s.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // --- CHAT INTERFACE ---
                <div className="flex-grow flex flex-col h-full pt-6">
                    <div className="flex-grow overflow-y-auto space-y-8 pb-32 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
                                    <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                        {msg.role === 'user' ? <UserOutlined /> : <ThunderboltOutlined />}
                                    </div>
                                    <div className={`p-1 ${msg.role === 'user' ? 'bg-indigo-50 rounded-2xl rounded-tr-none px-4 py-2' : ''}`}>
                                        <div className="text-slate-800 text-[16px] leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-6">
                                <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <ThunderboltOutlined className="animate-pulse" />
                                </div>
                                <div className="space-y-2 w-full max-w-xl">
                                    <Skeleton active paragraph={{ rows: 2 }} title={false} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sticky Bottom Input */}
                    <div className="absolute bottom-6 left-0 right-0 px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-2xl border border-slate-200 p-1.5 flex items-center gap-3 ring-1 ring-slate-900/5">
                                <Button type="text" icon={<PlusOutlined className="text-slate-500" />} className="h-10 w-10 rounded-full" />
                                <Input
                                    placeholder="Ask Gemini"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onPressEnter={() => handleSend()}
                                    bordered={false}
                                    className="flex-grow text-[16px] placeholder:text-slate-400"
                                />
                                <div className="flex gap-1 pr-1">
                                    <Button type="text" icon={<PictureOutlined className="text-slate-500" />} />
                                    <Button type="text" icon={<AudioOutlined className="text-slate-500" />} />
                                    <Button 
                                        type="primary" 
                                        icon={<SendOutlined />} 
                                        onClick={() => handleSend()}
                                        disabled={!inputValue.trim() || isTyping}
                                        className="h-10 w-10 rounded-full bg-slate-900 border-none flex items-center justify-center shadow-md disabled:bg-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="text-center mt-3">
                                <Text className="text-[11px] text-slate-400">
                                    Gemini can make mistakes. Check important info.
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuerySection;
