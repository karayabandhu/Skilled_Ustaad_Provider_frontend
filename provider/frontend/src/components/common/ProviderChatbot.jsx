import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Mail, ChevronRight, Phone, Info, Loader2, Sparkles, SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

const ProviderChatbot = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            type: 'bot',
            text: t('profile.chatbot.welcome'),
            timestamp: new Date()
        }
    ]);
    const [showSupport, setShowSupport] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const text = input.trim();
        if (!text) return;

        const userMsg = { id: Date.now(), type: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        processBotQuery(text);
    };

    const handleQuickQuestion = (question) => {
        const userMsg = { id: Date.now(), type: 'user', text: question, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        processBotQuery(question);
    };

    const processBotQuery = async (text) => {

        try {
            const res = await api.post("/chatbot/query", {
                query: text,
                role: 'provider'
            });

            setTimeout(() => {
                const botMsg = {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: res.data.answer,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);

                if (res.data.suggestedAction === "escalate") {
                    setShowSupport(true);
                }
            }, 1000);
        } catch (err) {
            console.error("Bot Query Failed:", err);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    type: 'bot',
                    text: t('profile.chatbot.error'),
                    timestamp: new Date()
                }]);
                setIsTyping(false);
                setShowSupport(true);
            }, 1000);
        }
    }

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] font-sans max-w-[calc(100vw-32px)] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[calc(100vh-120px)] bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="relative">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                                        <Bot className="text-white" size={24} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-base uppercase tracking-widest leading-none">{t('profile.chatbot.title')}</h3>
                                    <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t('profile.chatbot.online_status')}</span>
                                </div>
                            </div>

                        </div>

                        {/* Chat Body */}
                        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.type === 'bot' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm ${msg.type === 'bot'
                                        ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-800"
                                        : "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-indigo-500/20"
                                        }`}>
                                        <p className="leading-relaxed font-medium">{msg.text}</p>
                                        <p className={`text-[8px] mt-2 font-black uppercase tracking-[0.1em] ${msg.type === 'bot' ? 'text-gray-400' : 'text-indigo-100/60'}`}>
                                            {msg.timestamp.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-indigo-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">{t('profile.chatbot.thinking')}</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick Suggestions (Only show initially or after bot replies) */}
                             {!isTyping && messages.length < 5 && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic px-2">{t('profile.chatbot.popular_questions')}</p>
                                    <div className="flex flex-wrap gap-2 text-left justify-start">
                                        {[
                                            t('profile.chatbot.q1'),
                                            t('profile.chatbot.q2'),
                                            t('profile.chatbot.q3'),
                                            t('profile.chatbot.q4'),
                                            t('profile.chatbot.q5'),
                                            t('profile.chatbot.q6')
                                        ].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => handleQuickQuestion(q)}
                                                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-full text-[10px] font-black uppercase tracking-tight hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Support Info Card */}
                            {showSupport && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-gradient-to-br from-gray-900 to-indigo-950 rounded-[2rem] text-white shadow-2xl border border-white/10 space-y-4"
                                >
                                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                        <div className="p-2 bg-indigo-500 rounded-xl">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400">{t('profile.chatbot.escalation')}</span>
                                            <h4 className="font-bold text-sm">{t('profile.chatbot.human_team')}</h4>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <a href="mailto:support@skilledustaad.com" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                            <span className="text-xs font-bold font-mono">support@skilledustaad.com</span>
                                            <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </a>
                                        <div className="flex items-center gap-3 px-4">
                                            <Phone size={14} className="text-indigo-400" />
                                            <span className="text-xs font-bold">+91 1800-KB-ADMIN</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 italic text-center uppercase tracking-widest">{t('profile.chatbot.availability')}</p>
                                </motion.div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Footer */}
                        <div className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/50 transition-all shadow-inner"
                            >
                                <input
                                    type="text"
                                    placeholder={t('profile.chatbot.placeholder')}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-grow bg-transparent border-none outline-none px-4 py-2 text-sm dark:text-gray-100 placeholder:text-gray-400 font-medium"
                                />
                                <button
                                    id="chat-send-btn"
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center group"
                                >
                                    <SendHorizontal size={20} className="group-hover:translate-x-0.5 transition-all" />
                                </button>
                            </form>
                            <div className="flex justify-center mt-3">
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">{t('profile.chatbot.ecosystem')}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05, shadow: '0 20px 40px rgba(79, 70, 229, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all duration-500 group ${isOpen
                    ? "bg-rose-500 text-white rotate-90"
                    : "bg-gradient-to-br from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500"
                    }`}
                title="Support Assistance"
            >
                {isOpen ? <X size={32} /> :
                    <div className="relative">
                        <MessageCircle size={32} className="group-hover:rotate-12 transition-all" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-4 border-white dark:border-indigo-900 animate-bounce" />
                    </div>
                }
            </motion.button>
        </div>
    );
};

export default ProviderChatbot;
