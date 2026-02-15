import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
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
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState({
        storeInfo: false,
        products: false,
        categories: false,
        analytics: false
    });

    const [errors, setErrors] = useState({
        storeInfo: null,
        products: null,
        categories: null,
        analytics: null
    });

    const getToken = () => localStorage.getItem('userToken');

    const [storeInfo, setStoreInfo] = useState({
        storeName: '',
        email: '',
        phoneNumber: ''
    });

    const [analyticsTotals, setAnalyticsTotals] = useState({
        income: 0,
        profit: 0,
        expense: 0
    });

    const [analyticsSeries, setAnalyticsSeries] = useState({
        income: new Array(12).fill(0),
        profit: new Array(12).fill(0),
        expense: new Array(12).fill(0)
    });

    const [activeStatFilter, setActiveStatFilter] = useState('Product');
    const [activePeriodFilter, setActivePeriodFilter] = useState('Overall');

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

    const productDropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);

    const [selectedProduct2, setSelectedProduct2] = useState(null);
    const [selectedCategory2, setSelectedCategory2] = useState(null);
    const [analyticsSeries2, setAnalyticsSeries2] = useState(null);

    const [tooltip, setTooltip] = useState({
        show: false,
        x: 0,
        y: 0,
        label: '',
        value: 0,
        color: '#000'
    });

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

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeGraphType, setActiveGraphType] = useState('Income');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [xLabels, setXLabels] = useState([]);

    // Single source of truth for xLabels
    useEffect(() => {
        if (activePeriodFilter === 'Overall') {
            if (activeStatFilter === 'Product' && products.length > 0) {
                setXLabels(products.map(p => p.product_name));
            } else if (activeStatFilter === 'Category' && categories.length > 0) {
                setXLabels(categories.map(c => c.name));
            }
        } else if (activePeriodFilter === 'Daily') {
            const now = new Date();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            setXLabels(Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`));
        } else if (activePeriodFilter === 'Monthly') {
            setXLabels(months);
        }
    }, [products, categories, activePeriodFilter, activeStatFilter]);

    const getLabelByIndex = (index) => {
        if (activePeriodFilter === 'Overall' && activeStatFilter === 'Product') {
            return products[index]?.product_name || '-';
        }
        if (activePeriodFilter === 'Overall' && activeStatFilter === 'Category') {
            return categories[index]?.name || '-';
        }
        if (activePeriodFilter !== 'Overall' && activeStatFilter === 'Product' && selectedProduct) {
            return `${xLabels[index] || '-'} • ${selectedProduct.product_name}`;
        }
        if (activePeriodFilter !== 'Overall' && activeStatFilter === 'Category' && selectedCategory) {
            return `${xLabels[index] || '-'} • ${selectedCategory.name}`;
        }
        return xLabels[index] || '-';
    };

    const fetchStoreInfo = async () => {
        try {
            setLoading(prev => ({ ...prev, storeInfo: true }));
            setErrors(prev => ({ ...prev, storeInfo: null }));
            const res = await fetch('http://localhost:3000/api/store/info', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch store info');
            setStoreInfo(data.data);
        } catch (error) {
            console.error('Fetch store info error:', error);
            setErrors(prev => ({ ...prev, storeInfo: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, storeInfo: false }));
        }
    };

    const fetchProducts = async (searchQuery = '') => {
        try {
            setLoading(prev => ({ ...prev, products: true }));
            setErrors(prev => ({ ...prev, products: null }));
            const res = await fetch(`http://localhost:3000/api/products?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Fetch products failed');
            setProducts(result.data);
            return result.data;
        } catch (error) {
            console.error('Fetch products error:', error);
            setErrors(prev => ({ ...prev, products: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    };

    const fetchCategories = async (searchQuery = '') => {
        try {
            setLoading(prev => ({ ...prev, categories: true }));
            setErrors(prev => ({ ...prev, categories: null }));
            const res = await fetch(`http://localhost:3000/api/categories?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Fetch categories failed');
            setCategories(result.data);
        } catch (error) {
            console.error('Fetch categories error:', error);
            setErrors(prev => ({ ...prev, categories: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    const fetchAnalytics = async (period = 'overall', type = 'overall', productId = null, categoryId = null) => {
        try {
            setLoading(prev => ({ ...prev, analytics: true }));
            setErrors(prev => ({ ...prev, analytics: null }));

            let url = `http://localhost:3000/api/analytics?period=${period}`;

            if (type === 'product' && productId) {
                url += `&type=product&productId=${productId}`;
            } else if (type === 'product_compare' && productId) {
                url += `&type=product_compare&productId=${productId}`;
            } else if (type === 'category' && categoryId) {
                url += `&type=category&categoryId=${categoryId}`;
            } else if (type === 'category_compare' && categoryId) {
                url += `&type=category_compare&categoryId=${categoryId}`;
            } else if (type === 'product') {
                url += `&type=product`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Fetch analytics failed');

            setAnalyticsTotals(result.totals);

            if (result.data?.labels) {
                setXLabels(result.data.labels);
                setAnalyticsSeries(result.data.series);
                return;
            }

            if (type === 'product_compare' || type === 'category_compare') {
                setAnalyticsSeries2(result.data);
            } else {
                setAnalyticsSeries(result.data);
            }
        } catch (error) {
            console.error('Fetch analytics error:', error);
            setErrors(prev => ({ ...prev, analytics: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, analytics: false }));
        }
    };

    useEffect(() => {
        fetchStoreInfo();
        fetchCategories();
        const init = async () => {
            await fetchProducts();
            await fetchAnalytics('overall', activeStatFilter.toLowerCase());
        };
        init();
    }, []);

    const getStatValue = (type) => {
        if (!analyticsTotals) return '₿0';
        switch (type) {
            case 'income': return `₿${(analyticsTotals.income || 0).toLocaleString()}`;
            case 'profit': return `₿${(analyticsTotals.profit || 0).toLocaleString()}`;
            case 'expense': return `₿${(analyticsTotals.expense || 0).toLocaleString()}`;
            default: return '₿0';
        }
    };

    const getChartData = () => {
        if (activePeriodFilter === 'Overall' && activeStatFilter === 'Category') {
            return {
                income: categories.map(c => c.totalRevenue || 0),
                profit: categories.map(c => c.totalProfit || 0),
                expense: categories.map(c => c.totalExpense || 0),
            };
        }
        return {
            income: analyticsSeries.income || [],
            profit: analyticsSeries.profit || [],
            expense: analyticsSeries.expense || [],
        };
    };

    const getFilteredProducts = () => {
        if (!productSearchQuery) return products;
        return products.filter(p => p.product_name.toLowerCase().includes(productSearchQuery.toLowerCase()));
    };

    const getFilteredCategories = () => {
        if (!categorySearchQuery) return categories;
        return categories.filter(c => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()));
    };

    const handleStatFilterChange = (filter) => {
        setActiveStatFilter(filter);
        setSelectedProduct(null);
        setSelectedProduct2(null);
        setSelectedCategory(null);
        setSelectedCategory2(null);
        setAnalyticsSeries2(null);
        setProductSearchQuery('');
        setCategorySearchQuery('');
        setShowProductSuggestions(false);
        setShowCategorySuggestions(false);
        fetchAnalytics(activePeriodFilter.toLowerCase(), filter.toLowerCase());
    };

    const handlePeriodFilterChange = (period) => {
        const nextPeriod = period.toLowerCase();
        setActivePeriodFilter(period);

        if (period !== 'Overall') {
            const productId = selectedProduct?._id || null;
            const categoryId = selectedCategory?._id || null;
            if (!productId && !categoryId) {
                fetchAnalytics(nextPeriod, 'overall', null, null);
            } else {
                fetchAnalytics(nextPeriod, activeStatFilter.toLowerCase(), productId, categoryId);
            }
        } else {
            fetchAnalytics('overall', activeStatFilter.toLowerCase(), null, null);
        }
    };

    const handleProductSelect = (product) => {
        if (activePeriodFilter === 'Overall') return;
        if (!selectedProduct) {
            setSelectedProduct(product);
            setProductSearchQuery(product.product_name);
            fetchAnalytics(activePeriodFilter.toLowerCase(), 'product', product._id);
        } else {
            setSelectedProduct2(product);
            fetchAnalytics(activePeriodFilter.toLowerCase(), 'product_compare', product._id);
        }
        setShowProductSuggestions(false);
    };

    const handleCategorySelect = (category) => {
        if (activePeriodFilter === 'Overall') return;
        if (!selectedCategory) {
            setSelectedCategory(category);
            setCategorySearchQuery(category.name);
            fetchAnalytics(activePeriodFilter.toLowerCase(), 'category', null, category._id);
        } else {
            setSelectedCategory2(category);
            fetchAnalytics(activePeriodFilter.toLowerCase(), 'category_compare', null, category._id);
        }
        setShowCategorySuggestions(false);
    };

    // Shared dark/light class helpers
    const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-300
        ${isDarkMode
            ? 'bg-[#2a2a2a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
        }`;

    const dropdownClass = `absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-300
        ${isDarkMode
            ? 'bg-[#2a2a2a] border-gray-700'
            : 'bg-white border-gray-300'
        }`;

    const dropdownItemClass = `px-4 py-3 cursor-pointer border-b last:border-b-0 transition-colors duration-150
        ${isDarkMode
            ? 'border-gray-700 hover:bg-gray-700'
            : 'border-gray-100 hover:bg-gray-50'
        }`;

    const sectionBoxClass = `mb-6 p-4 rounded-lg border transition-colors duration-300
        ${isDarkMode ? 'bg-[#242424] border-gray-700' : 'bg-gray-50 border-gray-200'}`;

    const labelClass = `text-sm font-semibold mb-3 flex items-center gap-2
        ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

    const gridLineColor = isDarkMode ? '#374151' : '#e5e7eb';

    return (
        <div className={`flex transition-colors duration-300 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}>
            <AnalyticsSidebar navigateTo={navigateTo} />

            <AnalyticsContainer isDarkMode={isDarkMode}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-6rem)]">

                    {/* LEFT COLUMN */}
                    <div className="space-y-6 overflow-y-auto">

                        {/* Information Section */}
                        <AnalyticsSection title="Information" isDarkMode={isDarkMode}>
                            <div className="space-y-6">
                                {[
                                    { label: 'Store name', value: storeInfo.storeName },
                                    { label: 'Email', value: storeInfo.email },
                                    { label: 'Phone number', value: storeInfo.phoneNumber },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col space-y-2">
                                        <label className={`text-base font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {label}
                                        </label>
                                        <div className={`text-xl font-medium py-2 border-b transition-colors duration-300
                                            ${isDarkMode ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                                            {value || <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>—</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AnalyticsSection>

                        {/* Stat Section */}
                        <AnalyticsSection title="Stat" isDarkMode={isDarkMode}>
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Stat = เลือกมุมมองข้อมูล (รวมทั้งหมด / แยกตามสินค้า / แยกตามหมวดหมู่)
                            </p>
                            <div className="space-y-4 mb-6">
                                <FilterButtonGroup
                                    options={['Product', 'Category']}
                                    activeOption={activeStatFilter}
                                    onOptionChange={handleStatFilterChange}
                                    isDarkMode={isDarkMode}
                                />
                                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Period = ช่วงเวลาในการแสดงกราฟ (รวมทั้งหมด / รายวัน / รายเดือน)
                                </p>
                                <FilterButtonGroup
                                    options={['Overall', 'Daily', 'Monthly']}
                                    activeOption={activePeriodFilter}
                                    onOptionChange={handlePeriodFilterChange}
                                    isDarkMode={isDarkMode}
                                />
                            </div>

                            {/* Product Selector */}
                            {activeStatFilter === 'Product' && (
                                <div className={sectionBoxClass}>
                                    <h4 className={labelClass}>
                                        Select Product
                                        {loading.products && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        )}
                                    </h4>

                                    <div className="relative mb-4" ref={productDropdownRef}>
                                        <input
                                            type="text"
                                            placeholder="Search for a product..."
                                            value={productSearchQuery}
                                            disabled={activePeriodFilter === 'Overall'}
                                            onChange={(e) => {
                                                if (activePeriodFilter === 'Overall') return;
                                                setProductSearchQuery(e.target.value);
                                                setShowProductSuggestions(true);
                                                fetchProducts(e.target.value);
                                            }}
                                            onFocus={() => {
                                                if (activePeriodFilter === 'Overall') return;
                                                setShowProductSuggestions(true);
                                            }}
                                            className={`${inputClass} ${activePeriodFilter === 'Overall' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>

                                        {productSearchQuery && (
                                            <button
                                                onClick={() => {
                                                    setProductSearchQuery('');
                                                    setSelectedProduct(null);
                                                    setSelectedProduct2(null);
                                                    setAnalyticsSeries2(null);
                                                    fetchAnalytics(activePeriodFilter.toLowerCase(), 'product');
                                                }}
                                                className="absolute right-10 top-2.5 text-gray-400 hover:text-red-500"
                                                title="Clear"
                                            >✕</button>
                                        )}

                                        {showProductSuggestions && (
                                            <div className={dropdownClass}>
                                                {getFilteredProducts().map(product => (
                                                    <div
                                                        key={product._id}
                                                        className={dropdownItemClass}
                                                        onClick={() => handleProductSelect(product)}
                                                    >
                                                        <div className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                                            {product.product_name}
                                                        </div>
                                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {product.category?.name || '-'} • ₿{product.price}
                                                        </div>
                                                    </div>
                                                ))}
                                                {getFilteredProducts().length === 0 && (
                                                    <div className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        No products found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedProduct && (
                                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                                            <div className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                                                Selected: {selectedProduct.product_name}
                                            </div>
                                            <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                {selectedProduct.category?.name || '-'} • ₿{selectedProduct.price}
                                            </div>
                                        </div>
                                    )}
                                    {selectedProduct2 && (
                                        <div className={`mt-2 text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                            Compare with: {selectedProduct2.product_name}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Category Selector */}
                            {activeStatFilter === 'Category' && (
                                <div className={sectionBoxClass}>
                                    <h4 className={labelClass}>
                                        Select Category
                                        {loading.categories && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                                        )}
                                    </h4>

                                    <div className="relative mb-4" ref={categoryDropdownRef}>
                                        <input
                                            type="text"
                                            placeholder="Search for a category..."
                                            value={categorySearchQuery}
                                            disabled={activePeriodFilter === 'Overall'}
                                            onChange={(e) => {
                                                if (activePeriodFilter === 'Overall') return;
                                                setCategorySearchQuery(e.target.value);
                                                setShowCategorySuggestions(true);
                                                fetchCategories(e.target.value);
                                            }}
                                            onFocus={() => {
                                                if (activePeriodFilter === 'Overall') return;
                                                setShowCategorySuggestions(true);
                                            }}
                                            className={`${inputClass} ${activePeriodFilter === 'Overall' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>

                                        {categorySearchQuery && (
                                            <button
                                                onClick={() => {
                                                    setCategorySearchQuery('');
                                                    setSelectedCategory(null);
                                                    setSelectedCategory2(null);
                                                    setAnalyticsSeries2(null);
                                                    fetchAnalytics(activePeriodFilter.toLowerCase(), 'category');
                                                }}
                                                className="absolute right-10 top-2.5 text-gray-400 hover:text-red-500"
                                                title="Clear"
                                            >✕</button>
                                        )}

                                        {showCategorySuggestions && (
                                            <div className={dropdownClass}>
                                                {getFilteredCategories().map(category => (
                                                    <div
                                                        key={category._id}
                                                        className={dropdownItemClass}
                                                        onClick={() => handleCategorySelect(category)}
                                                    >
                                                        <div className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                                            {category.name}
                                                        </div>
                                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {category.productCount ?? 0} products • ₿{(category.totalRevenue ?? 0).toLocaleString()} revenue
                                                        </div>
                                                    </div>
                                                ))}
                                                {getFilteredCategories().length === 0 && (
                                                    <div className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        No categories found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedCategory && (
                                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                                            <div className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                                                Selected: {selectedCategory.name}
                                            </div>
                                            <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                {selectedCategory.productCount} products • ₿{selectedCategory.totalRevenue.toLocaleString()} revenue
                                            </div>
                                        </div>
                                    )}
                                    {selectedCategory2 && (
                                        <div className={`mt-2 text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                            Compare with: {selectedCategory2.name}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Stat Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {loading.analytics ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className={`p-4 rounded-lg border animate-pulse ${isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}>
                                            <div className={`h-4 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                            <div className={`h-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <StatCard label="Income" value={getStatValue('income')} isDarkMode={isDarkMode} className="transition-all duration-200 hover:shadow-md" />
                                        <StatCard label="Profit" value={getStatValue('profit')} isDarkMode={isDarkMode} className="transition-all duration-200 hover:shadow-md" />
                                        <StatCard label="Expense" value={getStatValue('expense')} isDarkMode={isDarkMode} className="transition-all duration-200 hover:shadow-md" />
                                    </>
                                )}
                            </div>
                        </AnalyticsSection>
                    </div>

                    {/* RIGHT COLUMN — Chart */}
                    <div>
                        <div className={`rounded-[20px] shadow-sm border p-6 h-full relative flex flex-col transition-colors duration-300
                            ${isDarkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>

                            {/* Graph Type Selector */}
                            <div className={`absolute top-6 right-6 border rounded-md p-2 z-10 transition-colors duration-300
                                ${isDarkMode ? 'bg-[#242424] border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
                                <div className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Graph</div>
                                <div className="flex flex-col gap-1">
                                    {['Income', 'Profit', 'Expense'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setActiveGraphType(type)}
                                            className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200
                                                ${activeGraphType === type
                                                    ? isDarkMode
                                                        ? 'bg-gray-600 text-white shadow-sm'
                                                        : 'bg-white text-gray-800 shadow-sm'
                                                    : isDarkMode
                                                        ? 'text-gray-400 hover:bg-gray-700'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 pb-4 flex-1 flex flex-col">
                                {/* Legend */}
                                <div className="flex items-center gap-4 mb-6 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{
                                            backgroundColor:
                                                activeGraphType === 'Income' ? '#3b82f6' :
                                                activeGraphType === 'Profit' ? '#22c55e' : '#ef4444'
                                        }}></div>
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {activeGraphType}
                                            {selectedProduct ? ` — ${selectedProduct.product_name}` : ''}
                                            {selectedCategory ? ` — ${selectedCategory.name}` : ''}
                                        </span>
                                    </div>
                                    {analyticsSeries2 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {selectedProduct2?.product_name || selectedCategory2?.name || 'Compare'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative flex-1">
                                    {/* Tooltip */}
                                    {tooltip.show && (
                                        <div
                                            className="fixed z-50 px-3 py-2 rounded-md shadow-lg text-sm text-white pointer-events-none"
                                            style={{ left: tooltip.x + 12, top: tooltip.y + 12, backgroundColor: tooltip.color }}
                                        >
                                            <div className="font-semibold">{tooltip.label}</div>
                                            <div>₿{tooltip.value.toLocaleString()}</div>
                                        </div>
                                    )}

                                    <div className="h-full relative ml-12 mr-4">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            {[0, 25, 50, 75, 100].map(y => (
                                                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={gridLineColor} strokeWidth="0.5" />
                                            ))}

                                            {(() => {
                                                const chartData = getChartData();
                                                const data1 = chartData[activeGraphType.toLowerCase()] || [];
                                                const data2 = analyticsSeries2?.[activeGraphType.toLowerCase()] || [];

                                                const maxValue = Math.max(...data1, ...(data2.length ? data2 : [0]), 1);
                                                const barColor =
                                                    activeGraphType === 'Income' ? '#3b82f6' :
                                                    activeGraphType === 'Profit' ? '#22c55e' : '#ef4444';

                                                const gap = 100 / (data1.length || 1);

                                                return data1.slice(0, xLabels.length).map((value, index) => {
                                                    const height1 = (value / maxValue) * 90;
                                                    const compareVal = data2[index] || 0;
                                                    const height2 = (compareVal / maxValue) * 90;

                                                    const groupWidth = gap * 0.7;
                                                    const barWidth = groupWidth / (analyticsSeries2 ? 2 : 1);
                                                    const x1 = index * gap + (gap - groupWidth) / 2;
                                                    const x2 = x1 + barWidth;

                                                    return (
                                                        <g key={index}>
                                                            <rect
                                                                x={x1} y={100 - height1}
                                                                width={barWidth} height={height1}
                                                                fill={barColor} rx="1"
                                                                onMouseEnter={(e) => setTooltip({ show: true, x: e.clientX, y: e.clientY, label: getLabelByIndex(index), value, color: barColor })}
                                                                onMouseLeave={() => setTooltip(t => ({ ...t, show: false }))}
                                                            />
                                                            {analyticsSeries2 && (
                                                                <rect
                                                                    x={x2} y={100 - height2}
                                                                    width={barWidth} height={height2}
                                                                    fill="#a855f7" rx="1"
                                                                    onMouseEnter={(e) => setTooltip({ show: true, x: e.clientX, y: e.clientY, label: `${xLabels[index] || '-'} (Compare)`, value: compareVal, color: '#a855f7' })}
                                                                    onMouseLeave={() => setTooltip(t => ({ ...t, show: false }))}
                                                                />
                                                            )}
                                                        </g>
                                                    );
                                                });
                                            })()}
                                        </svg>

                                        {/* Y-axis labels */}
                                        <div className={`absolute left-0 top-0 h-full flex flex-col justify-between text-xs -ml-12 text-right pr-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {(() => {
                                                const chartData = getChartData();
                                                const data1 = chartData[activeGraphType.toLowerCase()] || [];
                                                const data2 = analyticsSeries2?.[activeGraphType.toLowerCase()] || [];
                                                const maxValue = Math.max(...data1, ...(data2.length ? data2 : [0]), 1);
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
                                    <div className={`flex justify-between text-xs ml-12 mr-4 mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {xLabels.map((label, index) => (
                                            <span key={index} className="flex-1 text-center truncate">{label}</span>
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