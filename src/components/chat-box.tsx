
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2 } from "lucide-react";
import { VoiceInput, TextToSpeech } from "./ui/voice-input";

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    createdAt: any;
}

interface ChatBoxProps {
    chatId: string;
}

export default function ChatBox({ chatId }: ChatBoxProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const scrollViewportRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        };
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [chatId]);

    const scrollToBottom = () => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTo({
                top: scrollViewportRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !user) return;

        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: newMessage,
            senderId: user.uid,
            senderName: user.displayName || "Anonymous",
            createdAt: serverTimestamp(),
        });
        setNewMessage("");
    };

    if (!user) {
        return <p>Please log in to chat.</p>
    }

    return (
        <div className="flex flex-col h-[60vh]">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                 <div className="space-y-4" ref={scrollViewportRef}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                           <p className="ml-2">Loading chat...</p>
                        </div>
                    ) : messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex items-start gap-3",
                                msg.senderId === user.uid ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.senderId !== user.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                    "max-w-xs rounded-lg px-4 py-2 relative group",
                                    msg.senderId === user.uid
                                        ? "bg-[#009688] text-white"
                                        : "bg-gray-100 text-[#263238]"
                                )}
                            >
                                <p className="text-sm pr-8">{msg.text}</p>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TextToSpeech 
                                        text={msg.text}
                                        className={cn(
                                            "h-6 w-6 p-1",
                                            msg.senderId === user.uid
                                                ? "border-white/30 text-white hover:bg-white/20"
                                                : "border-[#26A69A]/30 text-[#00796B] hover:bg-[#26A69A]/10"
                                        )}
                                    />
                                </div>
                            </div>
                             {msg.senderId === user.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4">
                <div className="relative flex-1">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        autoComplete="off"
                        className="pr-12 border-[#26A69A]/30 focus:border-[#009688]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInput 
                            onTranscript={(text) => setNewMessage(prev => prev + (prev ? ' ' : '') + text)}
                        />
                    </div>
                </div>
                <Button type="submit" size="icon" className="bg-[#009688] hover:bg-[#00796B]">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
