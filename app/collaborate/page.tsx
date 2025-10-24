'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  created_at: string;
}

export default function HelpDeskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────
  // Load initial messages
  // ─────────────────────────────
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('collaborate_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) console.error('Fetch error:', error);
      else setMessages(data ?? []);
    };

    fetchMessages();

    // ─────────────────────────────
    // Realtime subscription
    // ─────────────────────────────
    const channel = supabase
      .channel('collaborate_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collaborate_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─────────────────────────────
  // Scroll to bottom when new message appears
  // ─────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─────────────────────────────
  // Send message
  // ─────────────────────────────
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const msg = {
      sender: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const { error } = await supabase.from('collaborate_messages').insert(msg);
    if (error) {
      console.error('Insert error:', error);
    }

    setNewMessage('');
  };

  // ─────────────────────────────
  // Render UI
  // ─────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-[#F6F9FB]">
        <MessageSquare className="w-5 h-5 text-[#00338d]" />
        <h1 className="text-lg font-semibold text-[#00338d]">Collaborate</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${
              msg.sender === 'You' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow-sm ${
                msg.sender === 'You'
                  ? 'bg-[#007EA7] text-white'
                  : 'bg-[#F6F9FB] text-gray-800'
              }`}
            >
              <div className="font-medium mb-0.5 text-xs opacity-80">
                {msg.sender}
              </div>
              <div>{msg.text}</div>
              <div className="text-[10px] opacity-60 mt-1">{msg.timestamp}</div>
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-100 p-3 flex items-center gap-2 bg-[#F6F9FB]">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#007EA7]"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-[#007EA7] text-white p-2 rounded-md hover:bg-[#006A90] transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
