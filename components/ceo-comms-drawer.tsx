"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageSquare, Send, Trash2, Loader2, Mail, Plus, Check, CheckCheck, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn, isValidAvatarUrl } from "@/lib/utils";
import { toast } from "sonner";
import { MessageDialog } from "./message-dialog";
import { format } from "date-fns";

const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

interface CEOCommsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    profile: {
        id: string;
        full_name?: string;
        role?: string;
        avatar_url?: string;
    } | null;
}

export function CEOCommsDrawer({ isOpen, onClose, profile }: CEOCommsDrawerProps) {
    const [messageTab, setMessageTab] = useState<'received' | 'sent'>('received');
    const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
    const [sentMessages, setSentMessages] = useState<any[]>([]);
    const [profilesList, setProfilesList] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [isNewMsgOpen, setIsNewMsgOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    
    // Reply states
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);

    const parseMessagePayload = (msgText: string) => {
        if (!msgText) return { senderId: null, cleanText: "" };
        const match = msgText.match(/^\[sender_id:([\w-]+)\](.*)/s);
        return {
            senderId: match ? match[1] : null,
            cleanText: match ? match[2].trim() : msgText
        };
    };

    const fetchData = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const { data: profs } = await supabase
                .from("profiles")
                .select("id, full_name, role, avatar_url, department, is_manager");
            if (profs) setProfilesList(profs);

            const { data: recData, error: recErr } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false });
            if (!recErr && recData) setReceivedMessages(recData);

            const { data: sentData, error: sentErr } = await supabase
                .from("notifications")
                .select("*, recipient:profiles!user_id(id, full_name, avatar_url)")
                .like("message", `[sender_id:${profile.id}]%`)
                .order("created_at", { ascending: false });
            if (!sentErr && sentData) setSentMessages(sentData);
        } catch (err) {
            console.error("Error fetching comms data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && profile?.id) {
            fetchData();
        }
        // Sync header button state
        if (!isOpen) {
            window.dispatchEvent(new CustomEvent("close-hq-messenger"));
        }
    }, [isOpen, profile?.id]);

    const findOriginalDirective = (senderId: string | null, replyMsg: any) => {
        if (!senderId || !replyMsg) return null;
        const original = sentMessages.find(sent => {
            const matchesUser = sent.user_id === senderId;
            const isBefore = new Date(sent.created_at) < new Date(replyMsg.created_at);
            return matchesUser && isBefore;
        });
        return original ? parseMessagePayload(original.message).cleanText : null;
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!confirm("Are you sure you want to permanently delete this message?")) return;
        setDeletingMessageId(msgId);
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", msgId);
            
            if (error) {
                toast.error("Failed to delete message: " + error.message);
            } else {
                toast.success("Message deleted successfully");
                setSentMessages(prev => prev.filter(m => m.id !== msgId));
                setReceivedMessages(prev => prev.filter(m => m.id !== msgId));
            }
        } catch (err: any) {
            toast.error("Error: " + err.message);
        } finally {
            setDeletingMessageId(null);
        }
    };

    const getStatusBadge = (title: string, message: string) => {
        const text = (title + " " + message).toLowerCase();
        if (text.includes("completed") || text.includes("finished") || text.includes("done")) {
            return { label: "Completed", className: "bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase" };
        }
        if (text.includes("pending review") || text.includes("under review") || text.includes("review")) {
            return { label: "Pending Review", className: "bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase" };
        }
        if (text.includes("in progress") || text.includes("started") || text.includes("duty")) {
            return { label: "In Progress", className: "bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase" };
        }
        return null;
    };

    const unreadCount = receivedMessages.filter(m => !m.read).length;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "110%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "110%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed right-4 top-4 bottom-4 w-80 md:w-[430px] flex flex-col z-[95] text-left font-sans"
                        style={{ filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.18))" }}
                    >
                        {/* Frosted Glass Panel */}
                        <div className="flex flex-col flex-1 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                            
                            {/* Subtle Gradient Top Bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-[#31267D] via-[#F14D24] to-[#31267D] opacity-80" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 flex-shrink-0 bg-white/60">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#31267D] to-[#4f3fbf] shadow-md shadow-[#31267D]/20">
                                        <MessageCircle className="w-4 h-4 text-white" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F14D24] text-[8px] font-black text-white flex items-center justify-center shadow-sm animate-pulse">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black tracking-tight text-slate-900">UA Messenger</h2>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Command Link</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={fetchData}
                                        disabled={loading}
                                        className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl text-slate-500 transition-colors disabled:opacity-50"
                                        title="Refresh"
                                    >
                                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                                    </button>
                                    <button
                                        onClick={() => setIsNewMsgOpen(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#F14D24] to-[#e03f14] hover:from-[#e03f14] hover:to-[#c93610] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-orange-500/25 active:scale-95 text-white"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Send Directive
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Apple-Style Segment Control */}
                            <div className="px-6 py-3 flex-shrink-0 bg-white/40">
                                <div className="relative flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
                                    {/* Floating Active Pill */}
                                    <motion.div
                                        layoutId="ceo-tab-pill"
                                        className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm border border-slate-200/60"
                                        style={{
                                            left: messageTab === 'received' ? '4px' : '50%',
                                            right: messageTab === 'received' ? '50%' : '4px',
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                    <button
                                        onClick={() => setMessageTab('received')}
                                        className={cn(
                                            "relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-200 rounded-xl flex items-center justify-center gap-1.5",
                                            messageTab === 'received' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                                        )}
                                    >
                                        Received
                                        {unreadCount > 0 && (
                                            <span className="bg-[#F14D24] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setMessageTab('sent')}
                                        className={cn(
                                            "relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-200 rounded-xl",
                                            messageTab === 'sent' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                                        )}
                                    >
                                        Sent
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Messages Section */}
                            <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {loading && (receivedMessages.length === 0 && sentMessages.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#31267D]" />
                                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Syncing communications...</span>
                                    </div>
                                ) : messageTab === 'sent' ? (
                                    sentMessages.length === 0 ? (
                                        <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <Mail className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No outbound directives</p>
                                                <p className="text-[9px] text-slate-300 mt-1 max-w-[200px] mx-auto leading-relaxed">Directives you send to staff will appear here.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 mt-2">
                                            {sentMessages.map((msg) => {
                                                const isAnnouncement = msg.title?.toLowerCase().includes("announcement") || msg.title?.toLowerCase().includes("broadcast");
                                                const formattedTime = format(new Date(msg.created_at), 'h:mm a');
                                                const formattedDate = format(new Date(msg.created_at), 'MMM d, h:mm a');
                                                const { cleanText } = parseMessagePayload(msg.message);
                                                const recipientName = msg.recipient?.full_name || msg.recipient?.email || "All Staff";
                                                const recipientAvatar = msg.recipient?.avatar_url;

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className="flex gap-3 items-start group relative transition-all duration-200"
                                                    >
                                                        {/* Avatar */}
                                                        <img 
                                                            src={isValidAvatarUrl(recipientAvatar) ? recipientAvatar : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(recipientName)}`}
                                                            alt={recipientName}
                                                            className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0"
                                                        />

                                                        {/* Chat bubble content */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Header: Name and Date */}
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-black text-slate-800 truncate">
                                                                        {recipientName}
                                                                    </span>
                                                                    <span className="bg-orange-50 text-[#F14D24] border border-orange-100 px-1.5 py-0.2 rounded-md text-[7px] font-black uppercase tracking-wider scale-95 origin-left">
                                                                        {isAnnouncement ? "Broadcast" : "Directive"}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">
                                                                    {formattedDate}
                                                                </span>
                                                            </div>

                                                            {/* Bubble */}
                                                            <div 
                                                                className={cn(
                                                                    "relative bg-[#d9fdd3] border border-[#ccebc4] rounded-2xl rounded-tl-none p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                                                                    "group-hover:shadow-md transition-shadow duration-300"
                                                                )}
                                                            >
                                                                {msg.title && (
                                                                    <span className="text-[8px] font-black tracking-widest text-[#F14D24]/80 uppercase block mb-1">
                                                                        {msg.title}
                                                                    </span>
                                                                )}
                                                                <p className="text-xs text-slate-800 leading-relaxed font-semibold break-words">
                                                                    {cleanText}
                                                                </p>

                                                                {/* Bottom Row inside bubble: Time + Ticks */}
                                                                <div className="flex items-center justify-end gap-1.5 mt-1.5 border-t border-[#ccebc4]/50 pt-1">
                                                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{formattedTime}</span>
                                                                    <div className="flex items-center">
                                                                        {msg.read ? (
                                                                            <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                                                                        ) : (
                                                                            <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Action Buttons (e.g. Delete button on hover) */}
                                                            <div className="flex justify-end gap-2 mt-1">
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                                    disabled={deletingMessageId === msg.id}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 border border-transparent hover:border-red-100 active:scale-95 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider"
                                                                    title="Delete directive"
                                                                >
                                                                    {deletingMessageId === msg.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Trash2 className="w-2.5 h-2.5" /> DELETE
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                ) : (
                                    receivedMessages.length === 0 ? (
                                        <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <Mail className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inbox Clear</p>
                                                <p className="text-[9px] text-slate-300 mt-1 max-w-[200px] mx-auto leading-relaxed">Staff replies and direct reports will appear here.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 mt-2">
                                            {receivedMessages.map((msg) => {
                                                const { senderId, cleanText } = parseMessagePayload(msg.message);
                                                const senderProfile = profilesList.find(p => p.id === senderId);
                                                const senderName = senderProfile?.full_name || "Staff Member";
                                                const senderRole = senderProfile?.role === "ceo" ? "CEO" : senderProfile?.is_manager ? `${senderProfile.department} Manager` : senderProfile?.role?.toUpperCase() || "STAFF";
                                                const senderAvatar = senderProfile?.avatar_url;
                                                
                                                const formattedTime = format(new Date(msg.created_at), 'h:mm a');
                                                const formattedDate = format(new Date(msg.created_at), 'MMM d, h:mm a');
                                                const isUnread = !msg.read;
                                                const statusBadge = getStatusBadge(msg.title || "", cleanText);
                                                const originalText = findOriginalDirective(senderId, msg);
                                                const cardId = msg.id;

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className="flex gap-3 items-start group relative transition-all duration-200"
                                                    >
                                                        {/* Avatar */}
                                                        <img 
                                                            src={isValidAvatarUrl(senderAvatar) ? senderAvatar : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderName)}`}
                                                            alt={senderName}
                                                            className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0"
                                                        />

                                                        {/* Chat bubble content */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Header: Name and Date */}
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-black text-slate-800 truncate">
                                                                        {senderName}
                                                                    </span>
                                                                    {senderRole && (
                                                                        <span className="text-[7px] font-black tracking-widest text-[#31267D] bg-[#31267D]/8 px-1.5 py-0.2 rounded-md uppercase border border-[#31267D]/15 scale-95 origin-left">
                                                                            {senderRole}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">
                                                                        {formattedDate}
                                                                    </span>
                                                                    {isUnread && (
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#31267D] animate-pulse shrink-0" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Bubble */}
                                                            <div 
                                                                className={cn(
                                                                    "relative bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                                                                    "group-hover:shadow-md transition-shadow duration-300",
                                                                    isUnread && "border-l-2 border-l-[#31267D]"
                                                                )}
                                                            >
                                                                {/* Reply box preview */}
                                                                {originalText && (
                                                                    <div className="text-[10px] text-slate-500 font-medium italic border-l-2 border-[#31267D]/30 pl-2 line-clamp-2 bg-slate-50 py-1 pr-2 rounded-r-lg mb-2">
                                                                        Replying to: &quot;{originalText}&quot;
                                                                    </div>
                                                                )}

                                                                {msg.title && (
                                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                                        <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                                                                            {msg.title}
                                                                        </span>
                                                                        {statusBadge && (
                                                                            <span className={cn(statusBadge.className, "text-[6px] tracking-widest px-1.5 py-0.2 scale-90 origin-right")}>
                                                                                {statusBadge.label}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <p className="text-xs text-slate-800 leading-relaxed font-semibold break-words">
                                                                    {cleanText}
                                                                </p>

                                                                {/* Time in bottom right */}
                                                                <div className="flex justify-end mt-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                                                    {formattedTime}
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons below bubble */}
                                                            <div className="flex items-center justify-between mt-1 px-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    {isUnread ? (
                                                                        <button
                                                                            onClick={async (e) => {
                                                                                e.stopPropagation();
                                                                                try {
                                                                                    const { error } = await supabase
                                                                                        .from("notifications")
                                                                                        .update({ 
                                                                                            read: true,
                                                                                            read_at: new Date().toISOString()
                                                                                        })
                                                                                        .eq("id", msg.id);
                                                                                    if (error) throw error;
                                                                                    setReceivedMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true, read_at: new Date().toISOString() } : m));
                                                                                    toast.success("Message marked as read");
                                                                                    fetchData();
                                                                                } catch (err: any) {
                                                                                    toast.error("Failed to mark read: " + err.message);
                                                                                }
                                                                            }}
                                                                            className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-all border border-emerald-100"
                                                                        >
                                                                            ✓ MARK READ
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[8px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                                                            <Check className="w-2.5 h-2.5 text-slate-300" /> Read
                                                                        </span>
                                                                    )}

                                                                    {senderId && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveReplyId(prev => prev === cardId ? null : cardId);
                                                                                setReplyMessage("");
                                                                            }}
                                                                            className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-[#31267D] hover:text-white bg-[#31267D]/8 hover:bg-[#31267D] px-2 py-0.5 rounded-md transition-all border border-[#31267D]/15"
                                                                        >
                                                                            REPLY
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                                    disabled={deletingMessageId === msg.id}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 border border-transparent hover:border-red-100 active:scale-95 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider"
                                                                    title="Delete message"
                                                                >
                                                                    {deletingMessageId === msg.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Trash2 className="w-2.5 h-2.5" /> DELETE
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>

                                                            {/* Reply form dropdown */}
                                                            {activeReplyId === cardId && (
                                                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                                                    <form 
                                                                        onSubmit={async (e) => {
                                                                            e.preventDefault();
                                                                            if (!replyMessage.trim()) return;
                                                                            setIsSendingReply(true);
                                                                            try {
                                                                                const payload = `[sender_id:${profile?.id}] ${replyMessage.trim()}`;
                                                                                
                                                                                const queries: any[] = [
                                                                                    fetch("/api/send-message", {
                                                                                        method: "POST",
                                                                                        headers: { "Content-Type": "application/json" },
                                                                                        body: JSON.stringify({
                                                                                            user_id: senderId,
                                                                                            title: `REPLY: ${msg.title || "DIRECTIVE"}`,
                                                                                            message: payload,
                                                                                            type: "direct"
                                                                                        })
                                                                                    })
                                                                                ];

                                                                                if (isUnread) {
                                                                                    queries.push(
                                                                                        supabase
                                                                                            .from("notifications")
                                                                                            .update({ 
                                                                                                read: true, 
                                                                                                read_at: new Date().toISOString() 
                                                                                            })
                                                                                            .eq("id", msg.id)
                                                                                    );
                                                                                }

                                                                                await Promise.all(queries);
                                                                                
                                                                                toast.success("Reply dispatched successfully");
                                                                                setReplyMessage("");
                                                                                setActiveReplyId(null);
                                                                                fetchData();
                                                                            } catch (err: any) {
                                                                                toast.error(err.message || "Failed to send reply");
                                                                            } finally {
                                                                                setIsSendingReply(false);
                                                                            }
                                                                        }}
                                                                        className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-[#31267D]/50 focus-within:shadow-[0_0_0_3px_rgba(49,38,125,0.08)] transition-all duration-300"
                                                                    >
                                                                        <input
                                                                            type="text"
                                                                            value={replyMessage}
                                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                                            placeholder="Type reply..."
                                                                            className="flex-1 bg-transparent text-[11px] text-slate-800 placeholder-slate-400 px-3 py-1 outline-none min-w-0 font-medium"
                                                                            disabled={isSendingReply}
                                                                        />
                                                                        <button
                                                                            type="submit"
                                                                            className="p-2 text-white rounded-xl bg-[#F14D24] hover:bg-[#e03f14] transition-colors flex-shrink-0 shadow-sm shadow-orange-500/20 disabled:opacity-50"
                                                                            disabled={isSendingReply || !replyMessage.trim()}
                                                                        >
                                                                            {isSendingReply ? (
                                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                            ) : (
                                                                                <Send className="w-3.5 h-3.5 text-white" />
                                                                            )}
                                                                        </button>
                                                                    </form>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                     )
                                 )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Directives MessageDialog modal */}
            <MessageDialog
                isOpen={isNewMsgOpen}
                onClose={() => setIsNewMsgOpen(false)}
                defaultType="direct"
                onSuccess={() => {
                    setIsNewMsgOpen(false);
                    fetchData();
                }}
            />
        </>
    );
}
