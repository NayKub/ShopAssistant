import React, { useState } from 'react';

const RestockButton = ({ productId, onRefillStock }) => {
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [refillAmount, setRefillAmount] = useState('');

    const handleRefill = (e) => {
        e.stopPropagation();
        const amount = parseInt(refillAmount, 10);
        
        if (amount > 0) {
            onRefillStock(productId, amount);
            setRefillAmount('');
            setIsInputVisible(false); // Close input after refill
        } else {
            alert('Please enter a valid amount (greater than 0).');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRefill(e);
        }
    };

    const handleBlur = () => {
        if (refillAmount === '' || parseInt(refillAmount, 10) <= 0) {
            setIsInputVisible(false);
        }
    };

    const toggleInput = (e) => {
        e.stopPropagation();
        setIsInputVisible(prev => !prev);
        setRefillAmount(''); // Clear value on toggle
    }

    return (
        <div className="flex items-center space-x-2 z-10">
            {isInputVisible ? (
                <div className="flex items-center bg-white rounded-full p-1 shadow-lg">
                    <input
                        type="number"
                        min="1"
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        placeholder="Qty"
                        className="w-12 text-sm font-medium text-center border-none bg-transparent focus:outline-none focus:ring-0 p-0 m-0"
                    />
                    <button 
                        className="w-6 h-6 rounded-full bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleRefill}
                        disabled={parseInt(refillAmount, 10) <= 0 || !refillAmount}
                        title="Confirm Refill"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                </div>
            ) : null}
            
            <button 
                className="w-7 h-7 rounded-full bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center hover:bg-blue-700"
                onClick={toggleInput}
                title="Restock (Custom Amount)" 
            >
                {/* Refill Icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m3.987 11h-.582a2 2 0 01-2-2v-3m11 2v3a2 2 0 01-2 2h-3.987m-4.472-8l-2 2m0 0l2 2m-2-2h8"></path></svg>
            </button>
        </div>
    );
}

export default RestockButton;