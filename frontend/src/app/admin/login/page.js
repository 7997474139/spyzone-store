'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // యూజర్ ఐడి మరియు పాస్‌వర్డ్ చెకింగ్
    if (username === 'admin' && password === 'spyzone123') {
      localStorage.setItem('is_admin_logged_in', 'true');
      
      // router.push కి బదులుగా window.location.href వాడడం వల్ల మొబైల్‌లో టన్నెల్ ద్వారా కూడా పర్ఫెక్ట్‌గా రీడైరెక్ట్ అవుతుంది
      window.location.href = '/admin/dashboard';
    } else {
      alert('తప్పు యూజర్ ఐడి లేదా పాస్‌వర్డ్!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full border border-gray-200 p-8 rounded shadow-sm">
        <h1 className="text-lg font-black uppercase tracking-widest mb-6 text-center">SPY ZONE ADMIN LOGIN</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full border p-3 text-sm rounded focus:outline-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border p-3 text-sm rounded focus:outline-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gray-500 uppercase underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}