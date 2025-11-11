import { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import socket from './socket';
import PaymentPortal from './PaymentPortal';
import './index.css';

function App() {
  const [page, setPage] = useState('portal');
  const [transactions, setTransactions] = useState([]);
  const [frauds, setFrauds] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/frauds')
      .then((res) => res.json())
      .then((data) => setFrauds(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (data) => {
      setTransactions((prev) => [data, ...prev].slice(0, 50));
      if (data.decision === 'block') setFrauds((prev) => [data, ...prev].slice(0, 100));
    };
    socket.on('transaction', handler);
    return () => socket.off('transaction', handler);
  }, []);

  const handleLocalTransaction = (txn) => {
    setTransactions((prev) => [txn, ...prev]);
    if (txn.decision === 'block') setFrauds((prev) => [txn, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white">
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-wide">
            🛡️ <span className="text-blue-400">FinTech Firewall</span>
          </h1>
          <div className="space-x-3">
            <button
              onClick={() => setPage('portal')}
              className={`px-4 py-2 rounded-lg transition ${
                page === 'portal'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Payment Portal
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className={`px-4 py-2 rounded-lg transition ${
                page === 'dashboard'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Security Dashboard
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {page === 'portal' ? (
          <PaymentPortal onTransaction={handleLocalTransaction} />
        ) : (
          <Dashboard transactions={transactions} frauds={frauds} />
        )}
      </main>
    </div>
  );
}

export default App;
