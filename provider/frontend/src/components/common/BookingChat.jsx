import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { Send, User, Bot, Clock, MessageSquare, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { api } from "../../services/api";
import { toast } from "sonner";
import { showSystemNotification } from "../../services/notification.service";

const BookingChat = ({ bookingId, providerId, customerId, customerName, isDark, shouldScrollOnMount }) => {
  const { socket, isConnected, emit, on } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Fetch message history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Assuming this endpoint exists on backend
        const res = await api.get(`/chat/${bookingId}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Chat history fetch failed:", err);
        // Fallback to empty if not implemented yet
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchHistory();
    }
  }, [bookingId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the booking-specific room
    emit("join_chat", { bookingId });

    // Listen for new messages
    const unsubscribe = on("new_message", (message) => {
      if (message.bookingId.toString() === bookingId.toString()) {
        setMessages((prev) => {
          // Robust deduplication:
          // 1. Match by tempId (from the same client)
          // 2. Match by DB _id
          // 3. Match by content & sender (Legacy fallback)
          const exists = prev.some(m =>
            (m.tempId && message.tempId && m.tempId === message.tempId) ||
            (m._id && message._id && m._id.toString() === message._id.toString())
          );

          if (exists) {
            // Update the optimistic message with the official one (adding _id, etc.)
            return prev.map(m => (m.tempId && m.tempId === message.tempId) ? message : m);
          }
          return [...prev, message];
        });

        // Foreground feedback (Sound + Toast) for customer messages
        if (message.senderId === customerId || message.senderRole === 'user') {
          const sound = document.getElementById("notif-sound");
          if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn("Audio blocked", e));
          }
          toast.info(`New message from ${customerName}`);
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      emit("leave_chat", { bookingId });
    };
  }, [socket, isConnected, bookingId, customerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      // Only scroll on mount IF explicitly requested (e.g. from chat list)
      if (isInitialLoad.current) {
        if (shouldScrollOnMount) {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        isInitialLoad.current = false;
      } else {
        // Always scroll for new messages after initial load
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, shouldScrollOnMount]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      tempId: Date.now() + Math.random().toString(36).substr(2, 9),
      bookingId,
      senderId: providerId,
      receiverId: customerId,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderType: "provider"
    };

    // Optimistic update
    setMessages((prev) => [...prev, messageData]);

    // Emit to socket
    emit("send_message", messageData);

    setNewMessage("");
  };

  return (
    <div className={`flex flex-col h-[500px] rounded-[2rem] border overflow-hidden shadow-2xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}>
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
        }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <MessageSquare className="text-indigo-600 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm dark:text-white">Chat with {customerName}</h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isConnected ? "Live Connection" : "Offline"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <MessageSquare size={40} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
            <p className="text-[10px]">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === providerId;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={idx}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${isMe
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : isDark ? "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700" : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                  }`}>
                  <p className="text-sm leading-relaxed">{msg.content || msg.message}</p>
                  <p className={`text-[9px] mt-1 opacity-60 font-medium ${isMe ? "text-right" : "text-left"}`}>
                    {msg.timestamp ? format(new Date(msg.timestamp), "HH:mm") : ""}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className={`w-full pl-4 pr-12 py-3.5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200"
              }`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:grayscale shadow-lg shadow-indigo-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingChat;
