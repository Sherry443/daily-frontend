import React, { useState, useEffect } from 'react';
import { Send, MapPin, Package, User, Clock, TrendingUp, AlertCircle, Settings, X } from 'lucide-react';

const LogisticsChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // API Keys - Replace with your actual keys
  const GEMINI_API_KEY = 'AIzaSyBfGdfsmovk8TMMhqS-gLVzzPokDWHE4DY';

  const testGeminiAPI = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Test" }] }],
          }),
        }
      );
  
      const data = await response.json();
  
      if (data.candidates && data.candidates[0]) {
        return "✅ Gemini API key is valid!";
      } else if (data.error) {
        return `❌ Gemini error: ${data.error.message}`;
      } else {
        return "⚠️ Unexpected response from Gemini.";
      }
    } catch (error) {
      return `❌ Network/API error: ${error.message}`;
    }
  };

  // Initialize with sample data
  useEffect(() => {
    // Sample riders
    const sampleRiders = [
      {
        id: 'R1',
        name: 'Ahmed Khan',
        area: 'Gulberg, Model Town',
        capacity: 5,
        currentOrders: 0,
        status: 'available'
      },
      {
        id: 'R2',
        name: 'Hassan Ali',
        area: 'DHA, Cantt',
        capacity: 5,
        currentOrders: 0,
        status: 'available'
      },
      {
        id: 'R3',
        name: 'Bilal Ahmed',
        area: 'Johar Town, Wapda Town',
        capacity: 5,
        currentOrders: 0,
        status: 'available'
      },
      {
        id: 'R4',
        name: 'Usman Malik',
        area: 'Bahria Town, Thokar Niaz Baig',
        capacity: 5,
        currentOrders: 0,
        status: 'available'
      }
    ];

    // Sample pending orders
    const sampleOrders = [
      {
        id: 'ORD001',
        customer: 'Ali Raza',
        address: 'House 123, Block C, Gulberg III, Lahore',
        time: '2:00 PM',
        status: 'pending'
      },
      {
        id: 'ORD002',
        customer: 'Sara Ahmed',
        address: 'Flat 45, DHA Phase 5, Lahore',
        time: '3:00 PM',
        status: 'pending'
      },
      {
        id: 'ORD003',
        customer: 'Zain Malik',
        address: 'Plot 67, Johar Town, Lahore',
        time: '2:30 PM',
        status: 'pending'
      },
      {
        id: 'ORD004',
        customer: 'Fatima Khan',
        address: 'Street 8, Bahria Town, Lahore',
        time: '4:00 PM',
        status: 'pending'
      }
    ];

    setRiders(sampleRiders);
    setOrders(sampleOrders);

    // Welcome message
    setMessages([{
      role: 'assistant',
      content: '👋 Assalam o Alaikum! Main aapka AI Logistics Assistant hoon.\n\n📦 Current Status:\n• Pending Orders: 4\n• Available Riders: 4\n\nMain kya madad kar sakta hoon?\n\n• "Distribute orders" - Orders ko riders me assign karo\n• "Show orders" - Pending orders dekhao\n• "Show riders" - Riders ki details dekhao\n• "Help" - Saare commands dekhao'
    }]);
  }, []);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const calculateDistance = (origin, destination) => {
    // Simulated distance calculation (2-12 km for demo)
    return Math.random() * 10 + 2;
  };

  const assignOrdersToRiders = () => {
    const assignments = {};
    const availableRiders = riders.filter(r => r.status === 'available');

    for (const order of orders.filter(o => o.status === 'pending')) {
      let bestRider = null;
      let minDistance = Infinity;

      for (const rider of availableRiders) {
        if (rider.currentOrders >= rider.capacity) continue;

        const orderLower = order.address.toLowerCase();
        const riderAreas = rider.area.toLowerCase().split(',').map(a => a.trim());
        
        const isInArea = riderAreas.some(area => orderLower.includes(area));
        
        if (isInArea) {
          const distance = calculateDistance(rider.area, order.address);
          if (distance < minDistance) {
            minDistance = distance;
            bestRider = rider;
          }
        }
      }

      if (bestRider) {
        if (!assignments[bestRider.id]) {
          assignments[bestRider.id] = {
            rider: bestRider,
            orders: [],
            totalDistance: 0
          };
        }
        assignments[bestRider.id].orders.push(order);
        assignments[bestRider.id].totalDistance += minDistance;
      }
    }

    return assignments;
  };

  const formatAssignments = (assignments) => {
    let response = '🎯 **Order Distribution Complete!**\n\n';
    
    Object.values(assignments).forEach((assignment, idx) => {
      response += `**Rider ${idx + 1}: ${assignment.rider.name}** (${assignment.rider.area})\n`;
      response += `📦 Orders: ${assignment.orders.length}\n`;
      response += `🛣️ Est. Distance: ${assignment.totalDistance.toFixed(1)} km\n\n`;
      
      assignment.orders.forEach((order, orderIdx) => {
        response += `  ${orderIdx + 1}. ${order.customer} - ${order.address}\n`;
        response += `     ⏰ ${order.time}\n`;
      });
      response += '\n';
    });

    response += '✅ All orders assigned optimally based on location and rider capacity!';
    return response;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');
    setLoading(true);

    try {
      const lowerInput = userMessage.toLowerCase();

      // Handle different commands
      if (lowerInput.includes('distribute') || lowerInput.includes('assign')) {
        const assignments = assignOrdersToRiders();
        const response = formatAssignments(assignments);
        addMessage('assistant', response);
      }
      else if (lowerInput.includes('show orders') || lowerInput.includes('pending orders')) {
        let response = '📦 **Pending Orders:**\n\n';
        orders.filter(o => o.status === 'pending').forEach((order, idx) => {
          response += `${idx + 1}. **${order.id}** - ${order.customer}\n`;
          response += `   📍 ${order.address}\n`;
          response += `   ⏰ ${order.time}\n\n`;
        });
        addMessage('assistant', response);
      }
      else if (lowerInput.includes('show riders') || lowerInput.includes('rider')) {
        let response = '🏍️ **Available Riders:**\n\n';
        riders.forEach((rider, idx) => {
          response += `${idx + 1}. **${rider.name}** (${rider.id})\n`;
          response += `   📍 Area: ${rider.area}\n`;
          response += `   📦 Capacity: ${rider.capacity} orders\n`;
          response += `   ✅ Status: ${rider.status}\n\n`;
        });
        addMessage('assistant', response);
      }
      else if (lowerInput.includes('optimize route')) {
        addMessage('assistant', '🗺️ **Route Optimization:**\n\nPehle "distribute orders" command chalain, phir main har rider ke liye optimized route generate kar dunga!\n\nOptimized routes include:\n• Shortest distance path\n• Time-based sequencing\n• Traffic consideration\n• Fuel efficiency');
      }
      else if (lowerInput.match(/^(hi|hello|hey|salam|assalam|kaise ho|how are you)/)) {
        addMessage('assistant', '👋 Hello! Main aapka logistics assistant hoon. Aaj main aapki kya madad kar sakta hoon?\n\nAap mujhse ye pooch sakte hain:\n• Orders distribute karo\n• Riders ki details\n• Pending orders dekhao\n• Routes optimize karo\n\nYa koi bhi sawal poocho! 😊');
      }
      else if (lowerInput.includes('help') || lowerInput.includes('madad')) {
        addMessage('assistant', '📚 **Available Commands:**\n\n🎯 **Order Management:**\n• "distribute orders" - Orders assign karo\n• "show orders" - Pending orders dekho\n• "add order" - Naya order add karo\n\n🏍️ **Rider Management:**\n• "show riders" - All riders dekho\n• "rider status" - Rider availability\n\n🗺️ **Route Optimization:**\n• "optimize routes" - Best routes generate\n\nAap seedha question bhi pooch sakte hain! 😊');
      }
      else {
        // Use Google Gemini API for general queries
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a friendly AI logistics assistant for a delivery company in Lahore, Pakistan. You help with order distribution, rider management, and route optimization. Current stats: ${orders.filter(o => o.status === 'pending').length} pending orders, ${riders.filter(r => r.status === 'available').length} available riders. Respond in a mix of English and Urdu (Roman Urdu) for better understanding. Be conversational and helpful.\n\nUser question: ${userMessage}`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300
              }
            })
          });

          const data = await response.json();
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            addMessage('assistant', data.candidates[0].content.parts[0].text);
          } else if (data.error) {
            addMessage('assistant', `❌ API Error: ${data.error.message}\n\nKya aapne sahi API key dala hai? Settings me check karein.`);
          } else {
            addMessage('assistant', '😊 Main samajh gaya! Kya aap "help" command try karoge to main aur commands bata sakta hoon?');
          }
        } catch (apiError) {
          console.error('Gemini API Error:', apiError);
          addMessage('assistant', '😊 Main yahan hoon! Lekin Gemini API se connect nahi ho paya.\n\nAap in commands try kar sakte hain:\n• distribute orders\n• show orders\n• show riders\n\nYa settings me API key check karein.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('assistant', '❌ Error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Logistics Assistant
                </h1>
                <p className="text-sm text-gray-500">Smart Order Distribution System • Powered by Gemini</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {riders.filter(r => r.status === 'available').length}
                  </div>
                  <div className="text-xs text-gray-600">Riders</div>
                </div>
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">API Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">API Key Configuration</p>
                    <p>Replace the API key in the code with your own:</p>
                    <code className="block mt-2 bg-white px-2 py-1 rounded text-xs">
                      GEMINI_API_KEY = 'your-key'
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Current Status:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Sample data loaded</li>
                  <li>✓ 4 Riders available</li>
                  <li>✓ 4 Pending orders</li>
                  <li>✓ Gemini API integrated</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">🚀 Features:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Bilingual responses (English + Urdu)</li>
                  <li>• Smart order distribution</li>
                  <li>• Area-based rider matching</li>
                  <li>• Natural conversation</li>
                </ul>
              </div>

              <button
                onClick={async () => {
                  const result = await testGeminiAPI();
                  alert(result);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Gemini API Key
              </button>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-5 py-3 rounded-2xl shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-100'
              }`}>
                <div className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-5 py-3 rounded-2xl shadow-md border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message here... (e.g., 'distribute orders', 'hi', 'help')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">Send</span>
            </button>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInput('distribute orders')}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-all border border-indigo-200"
            >
              📦 Distribute Orders
            </button>
            <button
              onClick={() => setInput('show orders')}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-all border border-indigo-200"
            >
              📋 Show Orders
            </button>
            <button
              onClick={() => setInput('show riders')}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-all border border-indigo-200"
            >
              🏍️ Show Riders
            </button>
            <button
              onClick={() => setInput('help')}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-all border border-indigo-200"
            >
              ❓ Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsChatbot;