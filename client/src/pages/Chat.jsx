import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Video, X, File, Image as ImageIcon, Download, Phone } from "lucide-react";
import VideoCall from "../components/VideoCall";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

export default function Chat() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Register socket and listen for events
  useEffect(() => {
    if (!user.id) return;
    socket.emit("join", user.id);
    socket.emit("userOnline", user.id);

    socket.on("onlineUsers", setOnlineUsers);
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    socket.on("call-made", (data) => {
      setIncomingCall(data);
      setShowVideoCall(true);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("call-made");
    };
  }, []);

  // Fetch all users
  useEffect(() => {
    api.get("/api/users").then((r) => {
      setUsers(r.data.filter((u) => u.id !== user.id));
    }).catch(() => {});
  }, []);

  // Load history
  const openChat = (u) => {
    setSelectedUser(u);
    setMessages([]);
    api
      .get(`/api/messages/${user.id}/${u.id}`)
      .then((r) => setMessages(r.data.map((m) => ({ 
        senderId: m.sender_id, 
        message: m.message,
        fileUrl: m.file_url,
        fileName: m.file_name,
        fileType: m.file_type 
      }))))
      .catch(() => {});
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if ((!message.trim() && !file) || !selectedUser) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("senderId", user.id);
    formData.append("receiverId", selectedUser.id);
    formData.append("message", message);
    if (file) formData.append("file", file);

    try {
      const res = await api.post("/api/messages", formData);
      const newMessage = { 
        senderId: user.id, 
        message, 
        fileUrl: res.data.fileUrl, 
        fileName: res.data.fileName, 
        fileType: res.data.fileType 
      };

      socket.emit("sendMessage", {
        senderId: user.id,
        receiverId: selectedUser.id,
        ...newMessage
      });

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    socket.emit("typing", { senderId: user.id, receiverId: selectedUser?.id });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Sidebar />
      {showVideoCall && (
        <VideoCall 
          socket={socket} 
          user={user} 
          receiverId={selectedUser?.id || incomingCall?.from} 
          onEndCall={() => {
            setShowVideoCall(false);
            setIncomingCall(null);
          }} 
        />
      )}

      <div className="flex-1 flex flex-col">
        <Navbar title="💬 AI Collaboration Chat" />

        <div className="flex flex-1 overflow-hidden">
          {/* USER LIST */}
          <div className="w-80 bg-white dark:bg-slate-800 border-r dark:border-slate-700 flex flex-col">
            <div className="p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
              <div className="relative mt-4">
                <input 
                  type="text" 
                  placeholder="Search interactions..." 
                  className="w-full bg-slate-100 dark:bg-slate-700/50 border-none rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => openChat(u)}
                  className={`w-full flex items-center gap-4 p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all border-b dark:border-slate-700 ${
                    selectedUser?.id === u.id ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    {onlineUsers[u.id] && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{u.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">12:30 PM</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1 font-medium italic">
                      {u.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 shadow-2xl m-4 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <Paperclip size={40} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Connect with Professionals</p>
                  <p className="text-slate-500 max-w-xs mx-auto">Select a colleague to start sharing ideas, files, and project updates.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b dark:border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-blue-400/30">
                      {selectedUser.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{selectedUser.name}</p>
                      <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                        {onlineUsers[selectedUser.id] ? (
                          <><span className="w-2 h-2 bg-green-500 rounded-full" /> Active Now</>
                        ) : (
                          <span className="text-slate-400">Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowVideoCall(true)}
                    className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold text-sm shadow-sm"
                  >
                    <Video size={20} /> Interview
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                  {messages.map((m, i) => {
                    const isMine = m.senderId === user.id || m.senderId === String(user.id);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[75%] space-y-2`}>
                          <div className={`p-4 rounded-3xl text-sm shadow-xl ${
                            isMine
                              ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/20"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-slate-200/50"
                          }`}>
                            {m.message && <p className="mb-2 leading-relaxed">{m.message}</p>}
                            
                            {m.fileUrl && (
                              <div className={`p-3 rounded-2xl flex items-center gap-4 ${isMine ? "bg-white/10" : "bg-slate-100 dark:bg-slate-700/50"}`}>
                                {m.fileType?.includes("image") ? (
                                  <div className="relative group">
                                    <img 
                                      src={`${api.defaults.baseURL}/${m.fileUrl}`} 
                                      className="max-w-full rounded-xl cursor-pointer hover:brightness-75 transition-all" 
                                      alt="shared" 
                                    />
                                    <a href={`${api.defaults.baseURL}/${m.fileUrl}`} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Download className="text-white" />
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl shrink-0">
                                      <File size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="font-bold truncate text-xs">{m.fileName}</p>
                                      <p className="text-[10px] opacity-60">Document Shared</p>
                                    </div>
                                    <a href={`${api.defaults.baseURL}/${m.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                      <Download size={16} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className={`text-[10px] font-bold text-slate-400 ${isMine ? "text-right" : "text-left"}`}>
                            JUST NOW {!isMine && "• DELIVERED"}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-slate-200 dark:bg-slate-700 px-6 py-2 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                        Collaborator is typing...
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* File Preview Overlay */}
                <AnimatePresence>
                  {file && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 50 }}
                      className="px-8 py-4 bg-blue-50 dark:bg-blue-900/20 border-t dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {file.type.includes("image") ? <ImageIcon className="text-blue-500" /> : <File className="text-red-500" />}
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-sm">{file.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Ready to upload</p>
                        </div>
                      </div>
                      <button onClick={() => setFile(null)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors">
                        <X size={18} className="text-slate-500" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-6 flex items-center gap-4">
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                  >
                    <Paperclip size={22} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Brainstorm with your AI-powered collaborator..."
                      className="w-full pl-6 pr-16 py-4 rounded-2xl border-none bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 placeholder:slate-400 text-sm font-medium"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={uploading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
                    >
                      {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "SEND"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}