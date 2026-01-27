import React, { useState } from 'react';

const NavBar = ({ navigateTo }) => {
  const getLinkClass = () => "text-white no-underline relative pb-[2px] transition-colors duration-200 hover:text-[#ed5656] cursor-pointer";
  
  return (
    <nav className="flex gap-6 pt-8 px-12 text-[1.1rem] absolute top-0 left-0 w-full z-20">
      <button onClick={() => navigateTo('home')} className={getLinkClass()}>Home</button>
      <button onClick={() => navigateTo('about')} className={getLinkClass()}>About us</button>
    </nav>
  );
};

const LoginView = ({ navigateTo, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('userToken', result.data.token);
        localStorage.setItem('storeId', result.data.store_id);
        setMessage('✅ Login successful!');
        setTimeout(() => onLoginSuccess(), 800);
      } else {
        setMessage(`❌ ${result.message || 'Invalid username or password'}`);
      }
    } catch (error) {
      setMessage('❌ Network Error: Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center relative bg-[url('./assets/signin.jpg')]">
      <NavBar navigateTo={navigateTo} />
      
      <form 
        className="p-10 bg-[#fff6d3] rounded-[51px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex flex-col gap-6 w-full max-w-[450px] z-10"
        onSubmit={handleLogin}
      >
        <h1 className="text-left text-black m-0 text-[2.5rem] font-bold">Login</h1>        
        <input
          type="text"
          placeholder="Store Name/email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />

        {message && (
          <p className={`text-sm font-medium ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() => navigateTo('register')}
            className="text-[#5170ff] underline text-[0.9rem] bg-transparent border-none cursor-pointer"
          >
            Create your account
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`py-3 px-6 border-none rounded-xl text-white text-[1rem] font-semibold cursor-pointer transition-colors duration-300 
              ${loading ? 'bg-gray-400' : 'bg-[#339f33] hover:bg-[#006400]'}`}
          >
            {loading ? '...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginView;