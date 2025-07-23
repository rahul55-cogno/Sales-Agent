import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, MessageSquare, BarChart3, Search } from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { CustomerCard } from '../components/CustomerCard';
import { CustomerModal } from '../components/CustomerModal';
import { SalesBot } from '../services/salesBot';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ChatMessage as ChatMessageType, Customer, Communication, ChatMessage as ChatI } from '../types/Customer';
import { mockCommunications } from '../data/mockData';
import axios from 'axios';

function Main() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'customers' | 'stats'>('chat');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const salesBot = new SalesBot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get("session_id");
    if (urlSessionId) {
      setSessionId(urlSessionId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatI = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    await fetchEventSource("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input.trim(), session_id: sessionId ? sessionId : null }),
      credentials: "include",
      onmessage(event) {
        try {
          const parsed = JSON.parse(event.data);

          switch (event.event) {
            case "session_id":
              const newSessionId = event.data;
              setSessions(prev=>[...prev,{id:newSessionId}])
              if (newSessionId) {
                setSessionId(newSessionId);
                const url = new URL(window.location.href);
                url.searchParams.set("session_id", newSessionId);
                window.history.replaceState({}, "", url.toString());
                console.log("Updated URL with session_id:", newSessionId);
              }
              break;
            case "starting_agent":
              addBotMessage(`Hi I am Sales Assit....`);
              break;
            case "customer_name":
              addBotMessage(`I identified Customer name as ${parsed.customer_name}.`);
              break;
            case "customer_name_1":
              addBotMessage(`${parsed.message}`);
              break;
            case "email_count_1":
              addBotMessage(`${parsed.message}`);
              break;
              break;
            case "summary_1":
              addBotMessage(`${parsed.message}`);
              break;
            case "email_count":
              addBotMessage(`${parsed.count >= 1 ? `Yayyy! I got ${parsed.count} emails while reading.` : "I found 0 emails. Maybe you forgot to send!"}`);
              break;
            case "summary":
              addBotMessage(parsed.message);
              break;
            case "completed":
              setIsLoading(false);
              break;
          }
        } catch (err) {
          console.error("Error parsing SSE event:", err);
          setIsLoading(false);
        }
      },
      onerror(err) {
        console.error("Error:", err);
        setIsLoading(false);
      }
    });
  };

  const addBotMessage = (text: string | object) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "bot",
        content: text,
        timestamp: new Date().toISOString(),
      }
    ]);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const customers = salesBot.getCustomers();
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerCommunications = (customerId: string): Communication[] => {
    return mockCommunications.filter(comm => comm.customerId === customerId);
  };

  const stats = {
    totalCustomers: customers.length,
    leads: customers.filter(c => c.status === 'lead').length,
    prospects: customers.filter(c => c.status === 'prospect').length,
    activeCustomers: customers.filter(c => c.status === 'customer').length,
    churned: customers.filter(c => c.status === 'churned').length,
    totalValue: customers.reduce((sum, c) => sum + c.value, 0),
    avgValue: customers.reduce((sum, c) => sum + c.value, 0) / customers.length
  };

  async function getSessions() {
    const res = await axios.get("http://localhost:8000/chat-sessions", {
      withCredentials: true
    });
    setSessions(res.data)
  }

  useEffect(() => {
    getSessions();
  }, [])

  const fetchChats = async(sessionId:any)=>{
    if(!sessionId) return;
    try {
      const res = await axios.get(`http://localhost:8000/chat-sessions/${sessionId}/chats`, {
        withCredentials: true
      });
      setMessages(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const selectSession = (sessionId: any) => {
    setSessionId(sessionId)
    const url = new URL(window.location.href);
    url.searchParams.set("session_id", sessionId);
    window.history.replaceState({}, "", url.toString());
  }

  const newChat = ()=>{
    setSessionId(null)
    const url = new URL(window.location.href);
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.toString());
    setMessages([])
  }

  useEffect(()=>{
    fetchChats(sessionId)
  },[sessionId])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Sales Assistant</h1>
            </div>
            <nav className="flex space-x-1">
              {['chat', 'customers', 'stats'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab === 'chat' && <MessageSquare className="inline-block w-4 h-4 mr-2" />}
                  {tab === 'customers' && <Users className="inline-block w-4 h-4 mr-2" />}
                  {tab === 'stats' && <BarChart3 className="inline-block w-4 h-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className='flex justify-around space-x-6 items-center px-7'>
        <main className="py-8 flex justify-center">
          <div className="w-[25vw]">
            <div className="bg-white rounded-xl shadow-md border border-gray-300 h-[85vh] flex flex-col overflow-hidden">

              {/* Header */}
              <p className="py-4 px-4 text-xl font-bold text-blue-500 border-b border-gray-200">
                Chat Sessions
              </p>

              {/* New Chat Button */}
              <button className="w-[90%] mx-auto mt-4 mb-3 text-center bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-400 transition" onClick={()=>{newChat()}}>
                + New Chat
              </button>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {sessions && sessions.length > 0 ? (
                  <ul className="space-y-3">
                    {sessions.map((s: any, i: number) => (
                      <li
                        key={i}
                        className={`text-white px-4 py-3 rounded-xl shadow-md hover:bg-blue-600 transition cursor-pointer flex items-center justify-between ${sessionId===s.id ? 'bg-blue-700' : 'bg-blue-500'}`}
                        onClick={() => selectSession(s.id)}
                      >
                        <span className="font-semibold">Session_{s.id}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center mt-8">No sessions yet</p>
                )}
              </div>
            </div>
          </div>
        </main>

        <main className="w-full py-8">
          {activeTab === 'chat' && (
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[85vh] flex flex-col ">
                {/* Chat Messages */}
                {
                  messages.length === 0 &&
                  <div className='h-full w-full flex justify-center items-center'>
                    <p className='text-[1.25rem] text-blue-500 font-semibold'>Hello, How can I help you today?</p>
                  </div>
                }
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about customers, communications, or sales data..."
                      className="flex-1 px-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Database</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onClick={() => setSelectedCustomer(customer)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Analytics</h2>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Cards for stats */}
                {[
                  { label: "Total Customers", value: stats.totalCustomers, color: "text-gray-900", icon: <Users className="h-8 w-8 text-blue-600" /> },
                  { label: "Active Customers", value: stats.activeCustomers, color: "text-green-600", icon: <Users className="h-8 w-8 text-green-600" /> },
                  { label: "Total Value", value: `$${stats.totalValue.toLocaleString()}`, color: "text-blue-600", icon: <BarChart3 className="h-8 w-8 text-blue-600" /> },
                  { label: "Avg Value", value: `$${Math.round(stats.avgValue).toLocaleString()}`, color: "text-purple-600", icon: <BarChart3 className="h-8 w-8 text-purple-600" /> }
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Main Content */}

      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          communications={getCustomerCommunications(selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

export default Main;
