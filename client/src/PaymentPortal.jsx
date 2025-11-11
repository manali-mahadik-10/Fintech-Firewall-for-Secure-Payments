import { useState } from 'react';

export default function PaymentPortal({ onTransaction = () => {} }) {
  const [formData, setFormData] = useState({
    accountNumber: '',
    cardNumber: '',
    amount: '',
    description: '',
    ip: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
      onTransaction({ ...formData, ...data, timestamp: new Date().toISOString() });
    } catch {
      setResult({ decision: 'error', risks: ['Server unavailable'] });
    } finally {
      setLoading(false);
    }
  };

  const resultColors = {
    allow: 'bg-green-500/20 border-green-400 text-green-300',
    block: 'bg-red-500/20 border-red-400 text-red-300',
    review: 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
    error: 'bg-gray-500/20 border-gray-400 text-gray-200',
  };

  return (
    <div className="text-white space-y-6">
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-semibold mb-6 text-blue-300">
          💰 Secure Payment Portal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['accountNumber', 'cardNumber', 'amount', 'description', 'ip'].map((f) => (
            <div key={f}>
              <label className="block text-sm mb-1 capitalize text-gray-300">
                {f === 'ip' ? 'IP Address (optional)' : f.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                name={f}
                value={formData[f]}
                onChange={handleChange}
                required={f !== 'ip'}
                type={f === 'amount' ? 'number' : 'text'}
                placeholder={`Enter ${f}`}
                className="w-full p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`border rounded-xl p-6 mt-4 backdrop-blur-md ${resultColors[result.decision] || ''}`}
        >
          <h3 className="text-xl font-bold mb-2">
            {result.decision === 'allow'
              ? '✅ Transaction Allowed'
              : result.decision === 'block'
              ? '🚫 Transaction Blocked'
              : result.decision === 'review'
              ? '⚠️ Needs Review'
              : '❌ Error'}
          </h3>
          <p className="text-sm mb-2">Risk Score: {result.riskScore}</p>
          {result.risks?.length > 0 && (
            <ul className="list-disc list-inside text-sm text-red-300">
              {result.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
