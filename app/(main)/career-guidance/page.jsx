
"use client";
import { useState } from 'react';

const FIELDS = [
  'Python Developer',
  'MERN Developer',
  'Cloud Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'UI/UX Designer',
];

export default function CareerGuidancePage() {
  const [selectedField, setSelectedField] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || !selectedField) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    try {
      const res = await fetch('/api/career-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: selectedField, message: input })
      });
      const data = await res.json();
      let aiText = data.response;
      if (!aiText || typeof aiText !== 'string' || aiText.trim().length === 0) {
        aiText = 'Sorry, I could not generate a response at this time.';
      }
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: aiText },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'Error contacting AI service. Please try again later.' },
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-5xl font-extrabold mb-2 text-left bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">Career Guidance</h1>
      <p className="text-muted-foreground text-lg mb-8 text-left">Get personalized career advice and guidance from AI. Select your field and start chatting!</p>
      <div className="bg-background/80 backdrop-blur rounded-2xl shadow-2xl border border-gray-800 p-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="font-semibold text-lg min-w-[160px]">Select your field:</label>
          <select
            className="p-3 border border-gray-700 rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-blue-400 w-full md:w-80"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
          >
            <option value="">-- Choose a field --</option>
            {FIELDS.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
        <div className="rounded-xl bg-black/60 border border-gray-700 shadow-inner p-6 h-80 overflow-y-auto flex flex-col gap-3 transition-all">
          {messages.length === 0 && <div className="text-gray-400 text-center my-auto">No messages yet.</div>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-line text-base shadow-md ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-green-300 border border-blue-400/30'}`}>
                <span className="font-semibold mr-1">{msg.sender === 'user' ? 'You:' : 'AI:'}</span> {msg.text}
              </div>
            </div>
          ))}
        </div>
        <form className="flex gap-3" onSubmit={e => { e.preventDefault(); handleSend(); }}>
          <input
            className="flex-1 p-3 rounded-lg bg-black/60 border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none shadow"
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedField}
          />
          <button
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold shadow disabled:opacity-50 transition-all"
            onClick={handleSend}
            disabled={!input.trim() || !selectedField}
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
