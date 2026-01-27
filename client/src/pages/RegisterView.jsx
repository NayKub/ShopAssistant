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

const SignupView = ({ navigateTo }) => {
  const [formData, setFormData] = useState({
    storeName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          store_name: formData.storeName, 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Registration successful! Please log in.`);
        setTimeout(() => navigateTo('login'), 2000); 
      } else {
        setMessage(`❌ ${result.message || result.error || 'Registration failed'}`);
      }
    } catch (error) {
      setMessage('❌ Network Error: Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center bg-no-repeat relative bg-[url('./assets/signup.jpg')]">
      <NavBar navigateTo={navigateTo} />

      <form 
        className="p-10 bg-[#fff6d3] rounded-[51px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex flex-col gap-4 w-full max-w-[450px] z-10"
        onSubmit={handleRegister}
      >
        <h1 className="text-left text-black m-0 text-[2.5rem] font-bold">Sign up</h1>
        
        <input
          name="storeName"
          type="text"
          placeholder="Store Name"
          value={formData.storeName}
          onChange={handleChange}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />

        <input
          name="username"
          type="text"
          placeholder="Username (Primary)"
          value={formData.username}
          onChange={handleChange}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="p-4 border border-[#dcdcdc] rounded-[20px] text-[1rem] bg-[#a9a9a9] text-[#333] placeholder-[#484848] transition-all duration-300 focus:bg-white focus:outline-none focus:border-[#888]"
        />

        {message && (
          <p className={`text-sm font-medium ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="text-[#5170ff] underline text-[0.9rem] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            Login Instead
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`py-3 px-6 border-none rounded-xl text-white text-[1rem] font-semibold cursor-pointer transition-colors duration-300 
              ${loading ? 'bg-gray-400' : 'bg-[#339f33] hover:bg-[#006400] active:scale-95 shadow-md'}`}
          >
            {loading ? '...' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupView;