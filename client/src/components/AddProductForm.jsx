import React, { useState, useEffect } from 'react';

const AddProductForm = ({ navigateTo }) => {
    const [productName, setProductName] = useState('');
    const [cost, setCost] = useState(0);
    const [profitPercentage, setProfitPercentage] = useState(10);
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const calculatePrice = (currentCost, currentProfitPercentage) => {
        const costValue = parseFloat(currentCost);
        const profitPct = parseFloat(currentProfitPercentage);
        
        if (costValue > 0 && profitPct > 0) {
            const profitAmount = costValue * (profitPct / 100);
            const finalPrice = costValue + profitAmount;
            return finalPrice.toFixed(2);
        }
        return '0.00';
    };

    useEffect(() => {
        const calculatedPrice = calculatePrice(cost, profitPercentage);
        setPrice(calculatedPrice);
    }, [cost, profitPercentage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const productData = {
            product_name: productName,
            cost: parseFloat(cost),
            price: parseFloat(price),
            stock: parseInt(stock),
            image: imageFile ? imageFile.name : 'default-image.jpg'
        };

        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('✅ สินค้าถูกเพิ่มสำเร็จ!');
                setProductName('');
                setCost(0);
                setProfitPercentage(10);
                setStock(0);
                setImageFile(null);
            } else {
                setMessage(`❌ ข้อผิดพลาด: ${result.error || 'Server Error'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    };

    const profitOptions = [5, 10, 15, 20];

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white shadow-2xl rounded-lg p-10">
                <div className="mb-8">
                    <div className="border-4 border-dashed border-gray-300 rounded-lg h-64 flex flex-col justify-center items-center cursor-pointer hover:border-green-400 transition duration-300">
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            id="imageUpload"
                        />
                        <label htmlFor="imageUpload" className="text-gray-500 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            {imageFile ? imageFile.name : 'Add Product Picture'}
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                    />

                    <div className="flex items-center space-x-4">
                        <input
                            type="number"
                            placeholder="Cost"
                            value={cost === 0 ? '' : cost}
                            onChange={(e) => setCost(e.target.value)}
                            required
                            min="0"
                            className="w-1/3 p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                        />

                        <div className="flex items-center space-x-3 text-gray-700 w-2/3">
                            <span className="font-medium mr-2">Profit :</span>
                            {profitOptions.map((pct) => (
                                <label key={pct} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="profit"
                                        value={pct}
                                        checked={profitPercentage === pct}
                                        onChange={() => setProfitPercentage(pct)}
                                        className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-1 text-sm">{pct}%</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Price"
                        value={`Price: ${price} THB`}
                        readOnly
                        className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-lg text-gray-700"
                    />

                    <input
                        type="number"
                        placeholder="Stock"
                        value={stock === 0 ? '' : stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        min="0"
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                    />

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-between items-center">
                        <button
                            type="button" 
                            onClick={() => navigateTo('sales')} 
                            className="px-6 py-3 rounded-lg text-gray-700 font-bold bg-gray-200 hover:bg-gray-300 transition duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !productName || !cost || !stock}
                            className={`px-6 py-3 rounded-lg text-white font-bold transition duration-200 
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
                        >
                            {loading ? 'Adding Product...' : 'Add Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;
