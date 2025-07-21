import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm SkyWing. How can I help you today? 💪" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingMission, setPendingMission] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  React.useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Detect mission assignment intent
  const checkMissionAssign = (msg) => {
    const match = msg.match(/assign mission to ([\w ]+)/i);
    return match ? match[1] : null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    // Mission assignment intent
    const assignee = checkMissionAssign(input);
    if (assignee) {
      setPendingMission(assignee);
      setShowModal(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/chat', {
        messages: [...messages, newMsg],
      }, { withCredentials: true });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not reach the server.' }]);
    }
    setLoading(false);
  };

  // Confirm mission assignment (frontend only demo)
  const handleConfirmMission = () => {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `Mission assignment to ${pendingMission} confirmed! 🚀 (This is a demo confirmation.)` }
    ]);
    setShowModal(false);
    setPendingMission('');
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        {!open && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl animate-bounce"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
          >
            💬
          </button>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-[90vw] max-w-xs sm:max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col border border-blue-400">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-200 dark:border-blue-800 bg-blue-600 rounded-t-2xl">
            <span className="text-white font-bold text-base sm:text-lg">SkyWing</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-blue-50 dark:bg-gray-800" style={{ maxHeight: 350 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow text-xs sm:text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-200'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center p-2 sm:p-3 border-t border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 rounded-b-2xl">
            <input
              type="text"
              className="flex-1 px-2 sm:px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white text-xs sm:text-base"
              placeholder={loading ? 'Thinking...' : 'Type your message...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="ml-1 sm:ml-2 px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 text-xs sm:text-base"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Mission Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-xs w-full border border-blue-400">
            <h2 className="text-lg font-bold mb-4 text-blue-700 dark:text-blue-200">Assign Mission</h2>
            <p className="mb-6 text-blue-700 dark:text-blue-200">Are you sure you want to assign a mission to <span className="font-semibold">{pendingMission}</span>?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => { setShowModal(false); setPendingMission(''); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                onClick={handleConfirmMission}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 