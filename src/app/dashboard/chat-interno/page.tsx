import { Plus, Search, Mic, Smile, Trash2, Paperclip } from 'lucide-react';

const ChatInternoPage = () => {
  return (
    <div className="flex h-full bg-[#111827] text-white">
      {/* Conversations List */}
      <div className="w-1/4 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold flex items-center justify-between">
            Mensajes internos
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">1</span>
              <button className="p-1 hover:bg-gray-700 rounded-full">
                <Plus size={20} />
              </button>
            </div>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Active Conversation */}
          <div className="p-3 flex items-center space-x-3 bg-gray-700 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0"></div>
            <div>
              <h3 className="font-semibold">Seba (me)</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-500"></div>
            <div>
              <h3 className="font-semibold">Seba (me)</h3>
              <p className="text-sm text-gray-400">angelofgonzalo@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="toggle" className="sr-only" />
                    <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
            </label>
            <button className="text-gray-400 hover:text-white">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-no-repeat bg-center" style={{ backgroundImage: 'url(/chat-bg-pattern.svg)', backgroundSize: '100px', backgroundRepeat: 'repeat' }}>
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Paperclip size={48} className="text-gray-400"/>
            </div>
            <h4 className="text-xl font-semibold">Aún no hay mensajes</h4>
            <p className="text-gray-400">Inicia una conversación</p>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-[#1F2937] flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <Smile size={24} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Plus size={24} />
          </button>
          <input
            type="text"
            placeholder="Mensaje"
            className="flex-1 bg-transparent focus:outline-none"
          />
          <button className="text-gray-400 hover:text-white">
            <Mic size={24} />
          </button>
          <button className="bg-green-500 p-2 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInternoPage;
