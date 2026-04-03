import { useMemo, useState } from 'react';

const AssistantIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="currentColor" d="M12 3c-4.97 0-9 3.58-9 8 0 2.29 1.04 4.35 2.77 5.8L4.5 21l4.61-1.73c.9.19 1.84.29 2.89.29 4.97 0 9-3.58 9-8s-4.03-8-9-8Zm-3 8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm3 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm3 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
        {open ? <path fill="currentColor" d="M8 12.75h8a.75.75 0 0 0 0-1.5H8a.75.75 0 0 0 0 1.5Z" /> : null}
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path fill="currentColor" d="M3.4 20.4 20.7 12 3.4 3.6c-.7-.3-1.4.4-1.1 1.1l2.5 6.2L15 12l-10.2 1.1-2.5 6.2c-.3.7.4 1.4 1.1 1.1Z" />
    </svg>
);

const formatDate = (value) => {
    if (!value) return 'TBA';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBA';
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const buildLiveStats = (items = []) => {
    const total = items.length;
    const active = items.filter((item) => item.isActive !== false).length;
    const upcoming = items.filter((item) => item.nextSession?.date).length;
    return { total, active, upcoming };
};

const buildItemList = (items = []) => {
    const names = items.map((item) => item?.name).filter(Boolean);
    if (!names.length) return 'I do not have any live items loaded right now.';
    if (names.length === 1) return `I only have one live item loaded: ${names[0]}.`;
    if (names.length === 2) return `I have ${names[0]} and ${names[1]}.`;
    const head = names.slice(0, -1).join(', ');
    return `I have ${head}, and ${names[names.length - 1]}.`;
};

const ModuleAssistant = ({
    moduleName,
    moduleTitle,
    items = [],
    loading = false,
    anchorId,
    onResetFilters,
    onShowSchedules,
    showReset = false,
}) => {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Ask me about joining, schedules, active items, or what you can do in this section.' },
    ]);

    const stats = useMemo(() => buildLiveStats(items), [items]);
    const upcomingItems = useMemo(() => {
        return [...items]
            .filter((item) => item.nextSession?.date)
            .sort((a, b) => new Date(a.nextSession.date) - new Date(b.nextSession.date))
            .slice(0, 3);
    }, [items]);

    const moduleLabel = moduleTitle || moduleName || 'this module';
    const assistantName = `${moduleLabel} Assistant`;

    const scrollToList = () => {
        if (!anchorId) return;
        const element = document.getElementById(anchorId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const respond = (input) => {
        const normalized = (input || '').trim().toLowerCase();
        if (!normalized) return;

        let text = '';
        if (/(what (clubs|teams) do you have|what are the (clubs|teams) you have|which (clubs|teams) do you have|list (clubs|teams)|show (clubs|teams)|available (clubs|teams)|what clubs|what teams|clubs you have|teams you have|which clubs|which teams)/.test(normalized)) {
            text = `${buildItemList(items)} Live count: ${stats.total} loaded, ${stats.active} active.`;
        } else if (/(join|apply|request|membership)/.test(normalized)) {
            text = moduleName === 'sports'
                ? 'To join a sports team, sign in and use the Join button on a team card. If the team requires approval, your request will be sent to the admins.'
                : 'To join a club, sign in and use the Join button on a club card. If approval is needed, the request is submitted for review.';
        } else if (/(schedule|session|meeting|training|fixture)/.test(normalized)) {
            text = stats.upcoming > 0
                ? `I can see ${stats.upcoming} live item(s) with scheduled sessions. Use the Session button on a card or open schedules to check the next date and time.`
                : 'No upcoming session is currently scheduled in the live data. Check back later or ask an admin to add one.';
        } else if (/(active|inactive|status)/.test(normalized)) {
            text = `Live data currently shows ${stats.active} active item(s) out of ${stats.total} loaded ${moduleLabel.toLowerCase()}.`;
        } else if (/(create|new|add|manage)/.test(normalized)) {
            text = moduleName === 'sports'
                ? 'Creating or managing sports teams is handled by admins and authorized creators in the admin dashboard.'
                : 'Creating or managing clubs is handled by admins and authorized creators in the admin dashboard.';
        } else if (/(what can i do|help|actions|options)/.test(normalized)) {
            text = moduleName === 'sports'
                ? 'You can explore teams, filter by sport type, open schedules, view members, and join or request membership.'
                : 'You can explore clubs, open schedules, view members, and join or request membership.';
        } else {
            text = `I’m scoped to ${moduleLabel.toLowerCase()}. Try asking about joining, schedules, live counts, or admin actions.`;
        }

        setMessages((prev) => [...prev, { role: 'user', text: input }, { role: 'assistant', text }]);
        setQuestion('');
    };

    const quickQuestions = [
        'How do I join?',
        'Show live sessions',
        'What can I do here?',
        'Is this data live?',
    ];

    const liveAnswer = moduleName === 'sports'
        ? `Live sports data: ${stats.total} teams, ${stats.active} active, ${stats.upcoming} with upcoming sessions.`
        : `Live clubs data: ${stats.total} clubs, ${stats.active} active, ${stats.upcoming} with upcoming meetings.`;
    const visibleItems = items.slice(0, 4).map((item) => item?.name).filter(Boolean);

    return (
        <div className="fixed bottom-5 right-5 z-40 pointer-events-none">
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
                {open && (
                    <div className="w-[min(92vw,23rem)] rounded-3xl border border-white/70 bg-white/95 shadow-2xl overflow-hidden backdrop-blur-xl">
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-3 text-white flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-blue-100 font-bold">Live module assistant</div>
                                <h3 className="text-lg font-black leading-tight">{assistantName}</h3>
                                <p className="text-xs text-blue-100 mt-1">FAQ + quick actions for this page only</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">✕</button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3">
                                    <div className="text-lg font-black text-[#1E3A8A]">{stats.total}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total</div>
                                </div>
                                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
                                    <div className="text-lg font-black text-emerald-700">{stats.active}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Active</div>
                                </div>
                                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3">
                                    <div className="text-lg font-black text-orange-700">{stats.upcoming}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Scheduled</div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Live answer</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{liveAnswer}</p>
                                {visibleItems.length > 0 && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        {moduleName === 'sports' ? 'Teams: ' : 'Clubs: '}{visibleItems.join(', ')}{items.length > visibleItems.length ? '...' : ''}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">FAQ</div>
                                <div className="flex flex-wrap gap-2">
                                    {quickQuestions.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => respond(item)}
                                            className="text-xs font-semibold px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {upcomingItems.length > 0 && (
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Next up</div>
                                    <div className="space-y-2 max-h-40 overflow-auto pr-1">
                                        {upcomingItems.map((item) => (
                                            <div key={item._id || item.id} className="rounded-2xl border border-slate-200 p-3 bg-white">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-800 truncate">{item.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5 truncate">{item.nextSession?.location || 'No location yet'}</div>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-[#1E3A8A] whitespace-nowrap">{formatDate(item.nextSession?.date)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-500">Ask me</div>
                                <div className="flex gap-2">
                                    <input
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                respond(question);
                                            }
                                        }}
                                        placeholder={`Ask about ${moduleLabel.toLowerCase()}`}
                                        className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                    <button
                                        onClick={() => respond(question)}
                                        className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-4 py-3 text-white text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#1e4fc2] transition-colors"
                                    >
                                        <SendIcon />
                                        Ask
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-auto pr-1">
                                {messages.slice(-4).map((message, index) => (
                                    <div key={`${message.role}-${index}`} className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === 'assistant' ? 'bg-slate-50 text-slate-700 border border-slate-200' : 'bg-blue-50 text-blue-900 border border-blue-100 ml-6'}`}>
                                        {message.text}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                    onClick={scrollToList}
                                    className="text-xs font-bold px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                                >
                                    Go to list
                                </button>
                                {onShowSchedules && (
                                    <button
                                        onClick={onShowSchedules}
                                        className="text-xs font-bold px-3 py-2 rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors"
                                    >
                                        Open schedules
                                    </button>
                                )}
                                {showReset && onResetFilters && (
                                    <button
                                        onClick={onResetFilters}
                                        className="text-xs font-bold px-3 py-2 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] transition-colors"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-[#1E3A8A] px-4 py-3 text-white shadow-2xl shadow-blue-200 hover:bg-[#1e4fc2] transition-all"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                        <AssistantIcon open={open} />
                    </span>
                    <span className="text-left">
                        <span className="block text-[10px] uppercase tracking-[0.24em] text-blue-100 font-bold">Assistant</span>
                        <span className="block text-sm font-bold">{moduleLabel}</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ModuleAssistant;
