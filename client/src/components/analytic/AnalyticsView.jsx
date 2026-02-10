import React, { useState, useEffect, useRef } from 'react';
import {
    AnalyticsSidebar,
    StatCard,
    FilterButtonGroup,
    InfoInputField,
    LineChart,
    GraphTypeSelector,
    AnalyticsContainer,
    AnalyticsGrid,
    AnalyticsSection
} from './AnalyticsComponents';

const AnalyticsView = ({ navigateTo }) => {
    // ============================================================================
    // STATE MANAGEMENT - Ready for Backend Integration
    // ============================================================================
    
    // Loading states for API calls
    const [loading, setLoading] = useState({
        storeInfo: false,
        products: false,
        categories: false,
        analytics: false
    });
    
    // Error states
    const [errors, setErrors] = useState({
        storeInfo: null,
        products: null,
        categories: null,
        analytics: null
    });
    
    // Store information (retrieved from database)
    const [storeInfo, setStoreInfo] = useState({
        storeName: 'My Shop Assistant Store', // Replace with API call
        email: 'shop@example.com',           // Replace with API call
        phoneNumber: '+66 (0) 123-456-789'   // Replace with API call
    });

    // State for stat filters
    const [activeStatFilter, setActiveStatFilter] = useState('Overall');
    const [activePeriodFilter, setActivePeriodFilter] = useState('Overall');
    
    // State for product/category selection
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    
    // Refs for click outside detection
    const productDropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);
    
    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
                setShowProductSuggestions(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setShowCategorySuggestions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // ============================================================================
    // ANALYTICS DATA - Replace with API Integration
    // ============================================================================
    
    // Mock data structure for backend reference
    // TODO: Replace with actual API endpoints
    const [products, setProducts] = useState([]); // GET /api/products
    const [categories, setCategories] = useState([]); // GET /api/categories
    const [analyticsData, setAnalyticsData] = useState({}); // GET /api/analytics
    
    // Expected API Response Structures:
    /* 
    Products API Response: GET /api/products
    [
        {
            id: number,
            name: string,
            category: string,
            price: number,
            cost: number,
            stock: number,
            sold_count: number,
            created_at: string,
            updated_at: string
        }
    ]
    
    Categories API Response: GET /api/categories  
    [
        {
            id: number,
            name: string,
            productCount: number,
            totalRevenue: number,
            totalProfit: number,
            totalExpense: number
        }
    ]
    
    Analytics API Response: GET /api/analytics?period={period}&type={type}&productId={id}&categoryId={id}
    {
        period: 'overall' | 'daily' | 'monthly',
        data: {
            income: number[],  // 12 months data
            profit: number[],  // 12 months data
            expense: number[] // 12 months data
        },
        totals: {
            income: number,
            profit: number,
            expense: number
        }
    }
    */
    
    // Mock data for development (remove when integrating with backend)
    const mockProducts = [
        { id: 1, name: 'iPhone 15 Pro', category: 'Electronics', price: 999, cost: 750, stock: 25, sold_count: 15 },
        { id: 2, name: 'Samsung Galaxy S24', category: 'Electronics', price: 799, cost: 600, stock: 30, sold_count: 22 },
        { id: 3, name: 'MacBook Air M3', category: 'Electronics', price: 1299, cost: 950, stock: 15, sold_count: 8 },
        { id: 4, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', price: 399, cost: 250, stock: 40, sold_count: 35 },
        { id: 5, name: 'Nike Air Max 270', category: 'Footwear', price: 150, cost: 80, stock: 60, sold_count: 45 },
        { id: 6, name: 'Adidas Ultraboost 22', category: 'Footwear', price: 180, cost: 95, stock: 35, sold_count: 28 },
        { id: 7, name: 'Levi\'s 501 Jeans', category: 'Clothing', price: 89, cost: 45, stock: 50, sold_count: 67 },
        { id: 8, name: 'Champion Hoodie', category: 'Clothing', price: 45, cost: 20, stock: 80, sold_count: 120 },
        { id: 9, name: 'Coffee Beans - Premium Blend', category: 'Food & Beverage', price: 24, cost: 12, stock: 100, sold_count: 200 },
        { id: 10, name: 'Organic Green Tea', category: 'Food & Beverage', price: 18, cost: 8, stock: 150, sold_count: 180 }
    ];
    
    const mockCategories = [
        { id: 1, name: 'Electronics', productCount: 156, totalRevenue: 45670, totalProfit: 15890, totalExpense: 29780 },
        { id: 2, name: 'Footwear', productCount: 89, totalRevenue: 12340, totalProfit: 4120, totalExpense: 8220 },
        { id: 3, name: 'Clothing', productCount: 234, totalRevenue: 23890, totalProfit: 8950, totalExpense: 14940 },
        { id: 4, name: 'Food & Beverage', productCount: 67, totalRevenue: 8950, totalProfit: 3580, totalExpense: 5370 },
        { id: 5, name: 'Home & Garden', productCount: 123, totalRevenue: 15670, totalProfit: 6200, totalExpense: 9470 },
        { id: 6, name: 'Sports & Outdoors', productCount: 78, totalRevenue: 9870, totalProfit: 3680, totalExpense: 6190 }
    ];

    // State for graph display
    const [activeGraphType, setActiveGraphType] = useState('Income');

    // Mock data for different time periods and metrics
    const mockData = {
        Overall: {
            Income: [0, 0, 150, 300, 225, 300, 150, 600, 450, 300, 300, 450],
            Profit: [0, 0, 50, 100, 75, 100, 50, 200, 150, 100, 100, 150],
            Expense: [0, 0, 100, 200, 150, 200, 100, 400, 300, 200, 200, 300]
        },
        Daily: {
            Income: [120, 180, 90, 240, 160, 200, 150, 280, 220, 180, 160, 190],
            Profit: [40, 60, 30, 80, 55, 70, 50, 95, 75, 60, 55, 65],
            Expense: [80, 120, 60, 160, 105, 130, 100, 185, 145, 120, 105, 125]
        },
        Monthly: {
            Income: [1200, 1800, 900, 2400, 1600, 2000, 1500, 2800, 2200, 1800, 1600, 1900],
            Profit: [400, 600, 300, 800, 550, 700, 500, 950, 750, 600, 550, 650],
            Expense: [800, 1200, 600, 1600, 1050, 1300, 1000, 1850, 1450, 1200, 1050, 1250]
        }
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // ============================================================================
    // API INTEGRATION FUNCTIONS - Implement these with your backend
    // ============================================================================
    
    // Fetch store information from backend
    const fetchStoreInfo = async () => {
        try {
            setLoading(prev => ({ ...prev, storeInfo: true }));
            setErrors(prev => ({ ...prev, storeInfo: null }));
            
            // TODO: Replace with actual API call
            // const response = await fetch('/api/store/info');
            // const data = await response.json();
            // setStoreInfo(data);
            
            // Mock implementation for now
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Store info loaded from mock data');
            
        } catch (error) {
            setErrors(prev => ({ ...prev, storeInfo: error.message }));
            console.error('Failed to fetch store info:', error);
        } finally {
            setLoading(prev => ({ ...prev, storeInfo: false }));
        }
    };
    
    // Fetch products for search functionality
    const fetchProducts = async (searchQuery = '') => {
        try {
            setLoading(prev => ({ ...prev, products: true }));
            setErrors(prev => ({ ...prev, products: null }));
            
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
            // const data = await response.json();
            // setProducts(data);
            
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 200));
            setProducts(mockProducts);
            
        } catch (error) {
            setErrors(prev => ({ ...prev, products: error.message }));
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    };
    
    // Fetch categories for search functionality  
    const fetchCategories = async (searchQuery = '') => {
        try {
            setLoading(prev => ({ ...prev, categories: true }));
            setErrors(prev => ({ ...prev, categories: null }));
            
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/categories?search=${encodeURIComponent(searchQuery)}`);
            // const data = await response.json();
            // setCategories(data);
            
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 200));
            setCategories(mockCategories);
            
        } catch (error) {
            setErrors(prev => ({ ...prev, categories: error.message }));
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };
    
    // Fetch analytics data based on filters
    const fetchAnalytics = async (period = 'overall', type = 'overall', productId = null, categoryId = null) => {
        try {
            setLoading(prev => ({ ...prev, analytics: true }));
            setErrors(prev => ({ ...prev, analytics: null }));
            
            // TODO: Replace with actual API call
            // const params = new URLSearchParams({
            //     period,
            //     type,
            //     ...(productId && { productId }),
            //     ...(categoryId && { categoryId })
            // });
            // const response = await fetch(`/api/analytics?${params}`);
            // const data = await response.json();
            // setAnalyticsData(data);
            
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log(`Fetching analytics: ${period}, ${type}, product: ${productId}, category: ${categoryId}`);
            
        } catch (error) {
            setErrors(prev => ({ ...prev, analytics: error.message }));
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(prev => ({ ...prev, analytics: false }));
        }
    };
    
    // Initialize data on component mount
    useEffect(() => {
        fetchStoreInfo();
        fetchProducts();
        fetchCategories();
        fetchAnalytics();
    }, []);

    // ============================================================================
    // UTILITY FUNCTIONS FOR DATA DISPLAY
    // ============================================================================
    
    // Dynamic stat value calculator
    const getStatValue = (type) => {
        // TODO: Replace with actual analytics data from API
        // When integrated, this should use analyticsData.totals[type]
        
        if (selectedProduct) {
            // Calculate stats for selected product
            const product = selectedProduct;
            switch (type) {
                case 'income':
                    return `₿${(product.price * (product.sold_count || 0)).toLocaleString()}`;
                case 'profit':
                    return `₿${((product.price - product.cost) * (product.sold_count || 0)).toLocaleString()}`;
                case 'expense':
                    return `₿${(product.cost * (product.sold_count || 0)).toLocaleString()}`;
                default:
                    return '₿0';
            }
        } else if (selectedCategory) {
            // Use category data
            const category = selectedCategory;
            switch (type) {
                case 'income':
                    return `₿${category.totalRevenue?.toLocaleString() || '0'}`;
                case 'profit':
                    return `₿${category.totalProfit?.toLocaleString() || '0'}`;
                case 'expense':
                    return `₿${category.totalExpense?.toLocaleString() || '0'}`;
                default:
                    return '₿0';
            }
        } else {
            // Overall stats - calculate from chart data totals
            const chartData = getChartData();
            const currentData = chartData[type] || [];
            const total = currentData.reduce((sum, value) => sum + value, 0);
            return `₿${total.toLocaleString()}`;
        }
    };

    // Mock chart data (will be replaced with real data from backend)
    // TODO: This should come from analyticsData.data after API integration
    const getChartData = () => {
        // Mock implementation - replace with analyticsData.data
        return {
            income: [2400, 1398, 9800, 3908, 4800, 3800, 4300, 2400, 1398, 9800, 3908, 4800],
            profit: [800, 598, 2200, 1308, 1600, 1100, 1450, 800, 598, 2200, 1308, 1600],
            expense: [1600, 800, 7600, 2600, 3200, 2700, 2850, 1600, 800, 7600, 2600, 3200],
        };
    };
    
    // ============================================================================
    // DATA FILTERING AND SEARCH LOGIC
    // ============================================================================
    
    // Filter functions for search suggestions
    const getFilteredProducts = () => {
        const dataSource = products.length > 0 ? products : mockProducts;
        if (!productSearchQuery) return dataSource;
        return dataSource.filter(product => 
            product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
        );
    };
    
    const getFilteredCategories = () => {
        const dataSource = categories.length > 0 ? categories : mockCategories;
        if (!categorySearchQuery) return dataSource;
        return dataSource.filter(category => 
            category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
        );
    };
    
    // Handle filter changes with API integration
    const handleStatFilterChange = (filter) => {
        setActiveStatFilter(filter);
        // Reset selections when changing filters
        setSelectedProduct(null);
        setSelectedCategory(null);
        setProductSearchQuery('');
        setCategorySearchQuery('');
        setShowProductSuggestions(false);
        setShowCategorySuggestions(false);
        
        // Fetch new analytics data based on filter
        fetchAnalytics(activePeriodFilter.toLowerCase(), filter.toLowerCase());
    };
    
    // Handle period filter changes
    const handlePeriodFilterChange = (period) => {
        setActivePeriodFilter(period);
        // Fetch analytics data with new period
        const type = activeStatFilter.toLowerCase();
        const productId = selectedProduct?.id;
        const categoryId = selectedCategory?.id;
        fetchAnalytics(period.toLowerCase(), type, productId, categoryId);
    };
    
    // Handle product selection
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setProductSearchQuery(product.name);
        setShowProductSuggestions(false);
        // Fetch analytics for selected product
        fetchAnalytics(activePeriodFilter.toLowerCase(), 'product', product.id);
    };
    
    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCategorySearchQuery(category.name);
        setShowCategorySuggestions(false);
        // Fetch analytics for selected category
        fetchAnalytics(activePeriodFilter.toLowerCase(), 'category', null, category.id);
    };

    return (
        <div className="flex">
            <AnalyticsSidebar navigateTo={navigateTo} />

            <AnalyticsContainer>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-6rem)]">
                    {/* Left Section - Information & Stats */}
                    <div className="space-y-6">
                        
                        {/* Information Section */}
                        <AnalyticsSection title="Information">
                            <div className="space-y-6">
                                {/* Store Name */}
                                <div className="flex flex-col space-y-2">
                                    <label className="text-base font-semibold text-gray-600 uppercase tracking-wide">
                                        Store name
                                    </label>
                                    <div className="text-xl font-medium text-gray-800 py-2 border-b border-gray-200">
                                        {storeInfo.storeName}
                                    </div>
                                </div>
                                
                                {/* Email */}
                                <div className="flex flex-col space-y-2">
                                    <label className="text-base font-semibold text-gray-600 uppercase tracking-wide">
                                        Email
                                    </label>
                                    <div className="text-xl font-medium text-gray-800 py-2 border-b border-gray-200">
                                        {storeInfo.email}
                                    </div>
                                </div>
                                
                                {/* Phone Number */}
                                <div className="flex flex-col space-y-2">
                                    <label className="text-base font-semibold text-gray-600 uppercase tracking-wide">
                                        Phone number
                                    </label>
                                    <div className="text-xl font-medium text-gray-800 py-2 border-b border-gray-200">
                                        {storeInfo.phoneNumber}
                                    </div>
                                </div>
                            </div>
                        </AnalyticsSection>

                        {/* Stats Section */}
                        <AnalyticsSection title="Stat">
                            {/* Filter Buttons */}
                            <div className="space-y-4 mb-6">
                                <FilterButtonGroup
                                    options={['Overall', 'Product', 'Category']}
                                    activeOption={activeStatFilter}
                                    onOptionChange={handleStatFilterChange}
                                />
                                
                                <FilterButtonGroup
                                    options={['Overall', 'Daily', 'Monthly']}
                                    activeOption={activePeriodFilter}
                                    onOptionChange={handlePeriodFilterChange}
                                />
                            </div>
                            
                            {/* Product Search Section */}
                            {activeStatFilter === 'Product' && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        Select Product
                                        {loading.products && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        )}
                                    </h4>
                                    
                                    {/* Search Input */}
                                    <div className="relative mb-4" ref={productDropdownRef}>
                                        <input
                                            type="text"
                                            placeholder="Search for a product..."
                                            value={productSearchQuery}
                                            onChange={(e) => {
                                                setProductSearchQuery(e.target.value);
                                                setShowProductSuggestions(true);
                                            }}
                                            onFocus={() => setShowProductSuggestions(true)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                                        />
                                        
                                        {/* Search Icon */}
                                        <div className="absolute right-3 top-2.5 text-gray-400">
                                            🔍
                                        </div>
                                        
                                        {/* Suggestions Dropdown */}
                                        {showProductSuggestions && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {getFilteredProducts().map(product => (
                                                    <div
                                                        key={product.id}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        onClick={() => handleProductSelect(product)}
                                                    >
                                                        <div className="font-medium text-gray-800">{product.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.category} • ${product.price}
                                                        </div>
                                                    </div>
                                                ))}
                                                {getFilteredProducts().length === 0 && (
                                                    <div className="px-4 py-3 text-gray-500 text-sm">
                                                        No products found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Selected Product Display */}
                                    {selectedProduct && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="font-medium text-blue-800">
                                                Selected: {selectedProduct.name}
                                            </div>
                                            <div className="text-sm text-blue-600">
                                                {selectedProduct.category} • ${selectedProduct.price}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Category Search Section */}
                            {activeStatFilter === 'Category' && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        Select Category
                                        {loading.categories && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                                        )}
                                    </h4>
                                    
                                    {/* Search Input */}
                                    <div className="relative mb-4" ref={categoryDropdownRef}>
                                        <input
                                            type="text"
                                            placeholder="Search for a category..."
                                            value={categorySearchQuery}
                                            onChange={(e) => {
                                                setCategorySearchQuery(e.target.value);
                                                setShowCategorySuggestions(true);
                                            }}
                                            onFocus={() => setShowCategorySuggestions(true)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                                        />
                                        
                                        {/* Search Icon */}
                                        <div className="absolute right-3 top-2.5 text-gray-400">
                                            🔍
                                        </div>
                                        
                                        {/* Suggestions Dropdown */}
                                        {showCategorySuggestions && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {getFilteredCategories().map(category => (
                                                    <div
                                                        key={category.id}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        onClick={() => handleCategorySelect(category)}
                                                    >
                                                        <div className="font-medium text-gray-800">{category.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {category.productCount} products • ${category.totalRevenue.toLocaleString()} revenue
                                                        </div>
                                                    </div>
                                                ))}
                                                {getFilteredCategories().length === 0 && (
                                                    <div className="px-4 py-3 text-gray-500 text-sm">
                                                        No categories found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Selected Category Display */}
                                    {selectedCategory && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="font-medium text-green-800">
                                                Selected: {selectedCategory.name}
                                            </div>
                                            <div className="text-sm text-green-600">
                                                {selectedCategory.productCount} products • ${selectedCategory.totalRevenue.toLocaleString()} revenue
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Stats Cards with Loading States */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {loading.analytics ? (
                                    // Loading skeleton
                                    <>  
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    // Actual stats cards
                                    <>
                                        <StatCard 
                                            label="Income" 
                                            value={getStatValue('income')}
                                            className="transition-all duration-200 hover:shadow-md"
                                        />
                                        <StatCard 
                                            label="Profit" 
                                            value={getStatValue('profit')}
                                            className="transition-all duration-200 hover:shadow-md"
                                        />
                                        <StatCard 
                                            label="Expense" 
                                            value={getStatValue('expense')}
                                            className="transition-all duration-200 hover:shadow-md"
                                        />
                                    </>
                                )}
                            </div>
                        </AnalyticsSection>
                    </div>

                    {/* Right Section - Graph (Takes half the page) */}
                    <div className="">
                        <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 h-full relative flex flex-col">
                            {/* Graph Type Selector - Top Right */}
                            <div className="absolute top-6 right-6 bg-gray-100 border border-gray-300 rounded-md p-2 z-10">
                                <div className="text-xs font-semibold text-gray-600 mb-1">Graph</div>
                                <div className="flex flex-col gap-1">
                                    {['Income', 'Profit', 'Expense'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setActiveGraphType(type)}
                                            className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                                                activeGraphType === type
                                                    ? 'bg-white text-gray-800 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Chart Container - Fill Available Space */}
                            <div className="pt-8 pb-4 flex-1 flex flex-col">
                                {/* Legend */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{
                                            backgroundColor: 
                                                activeGraphType === 'Income' ? '#3b82f6' : 
                                                activeGraphType === 'Profit' ? '#22c55e' : '#ef4444'
                                        }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700">{activeGraphType}</span>
                                </div>
                                
                                {/* Chart Area - Full Height */}
                                <div className="relative flex-1">
                                    <div className="h-full relative ml-12 mr-4">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            {/* Horizontal grid lines */}
                                            {[0, 25, 50, 75, 100].map(y => (
                                                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                                            ))}
                                            
                                            {/* Data line */}
                                            {(() => {
                                                const chartData = getChartData();
                                                const currentData = chartData[activeGraphType.toLowerCase()];
                                                const maxValue = Math.max(...currentData);
                                                const points = currentData.map((value, index) => {
                                                    const x = (index / (currentData.length - 1)) * 100;
                                                    const y = 100 - (value / maxValue) * 90; // Use more of the height
                                                    return `${x},${y}`;
                                                }).join(' ');
                                                
                                                const lineColor = 
                                                    activeGraphType === 'Income' ? '#3b82f6' : 
                                                    activeGraphType === 'Profit' ? '#22c55e' : '#ef4444';
                                                
                                                return (
                                                    <>
                                                        {/* Data line */}
                                                        <polyline
                                                            points={points}
                                                            fill="none"
                                                            stroke={lineColor}
                                                            strokeWidth="2.5"
                                                            vectorEffect="non-scaling-stroke"
                                                        />
                                                        
                                                        {/* Data points */}
                                                        {currentData.map((value, index) => {
                                                            const x = (index / (currentData.length - 1)) * 100;
                                                            const y = 100 - (value / maxValue) * 90;
                                                            return (
                                                                <circle
                                                                    key={index}
                                                                    cx={x}
                                                                    cy={y}
                                                                    r="0.8"
                                                                    fill={lineColor}
                                                                    vectorEffect="non-scaling-stroke"
                                                                />
                                                            );
                                                        })}
                                                    </>
                                                );
                                            })()}
                                        </svg>
                                        
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500 -ml-12 text-right pr-2">
                                            {(() => {
                                                const chartData = getChartData();
                                                const currentData = chartData[activeGraphType.toLowerCase()];
                                                const maxValue = Math.max(...currentData);
                                                return [
                                                    <span key="max">₿{maxValue.toLocaleString()}</span>,
                                                    <span key="75">₿{Math.round(maxValue * 0.75).toLocaleString()}</span>,
                                                    <span key="50">₿{Math.round(maxValue * 0.5).toLocaleString()}</span>,
                                                    <span key="25">₿{Math.round(maxValue * 0.25).toLocaleString()}</span>,
                                                    <span key="0">₿0</span>
                                                ];
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {/* X-axis labels */}
                                    <div className="flex justify-between text-sm text-gray-500 ml-12 mr-4 mt-4">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                                            <span key={month} className="flex-1 text-center">{month}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnalyticsContainer>
        </div>
    );
};

export default AnalyticsView;