import React, { useState } from 'react';

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            
            if (response.ok) {
                
                localStorage.setItem('userToken', result.data.token);
                localStorage.setItem('storeId', result.data.store_id);
                
                setMessage(`✅ Login successful! Welcome to ${result.data.store_name}`);
                
                
                setTimeout(() => onLoginSuccess(), 1000); 

            } else {
                setMessage(`❌ Login failed: ${result.message || 'Invalid username or password'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: Could not connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-green-700">Login to POS System</h2>
                <p className="text-center text-gray-500">Sign in with your branch credentials.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {message && (
                    <div className={`p-3 text-center rounded-md ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
                
                <div className="text-center text-sm">
                    <p>Don't have a store account? 
                        <button 
                            onClick={() => navigateTo('register')} 
                            className="font-medium text-green-600 hover:text-green-500 ml-1"
                        >
                            Register New Store
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;