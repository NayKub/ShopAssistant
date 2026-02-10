# Analytics UI Component - Backend Integration Guide

This directory contains the Analytics UI components that are **ready for backend integration**. All components use **Tailwind CSS** for styling and are structured to easily connect with your backend API.

## 📁 File Structure

```
analytic/
├── AnalyticsView.jsx        # Main analytics dashboard component
├── AnalyticsComponents.jsx  # Reusable UI components (charts, cards, etc.)
└── README.md               # This file - integration guide
```

## 🔌 API Integration Points

### Required API Endpoints

The `AnalyticsView.jsx` component is prepared to integrate with the following backend endpoints:

#### 1. Store Information
```http
GET /api/store/info
```
**Expected Response:**
```json
{
  "storeName": "My Shop Assistant Store",
  "email": "shop@example.com", 
  "phoneNumber": "+66 (0) 123-456-789"
}
```

#### 2. Products Search
```http
GET /api/products?search={searchQuery}
```
**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "category": "Electronics", 
    "price": 999,
    "cost": 750,
    "stock": 25,
    "sold_count": 15,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
]
```

#### 3. Categories Search  
```http
GET /api/categories?search={searchQuery}
```
**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "productCount": 156,
    "totalRevenue": 45670,
    "totalProfit": 15890, 
    "totalExpense": 29780
  }
]
```

#### 4. Analytics Data
```http
GET /api/analytics?period={period}&type={type}&productId={id}&categoryId={id}
```

**Parameters:**
- `period`: "overall" | "daily" | "monthly" 
- `type`: "overall" | "product" | "category"
- `productId`: number (optional)
- `categoryId`: number (optional)

**Expected Response:**
```json
{
  "period": "overall",
  "data": {
    "income": [2400, 1398, 9800, 3908, 4800, 3800, 4300, 2400, 1398, 9800, 3908, 4800],
    "profit": [800, 598, 2200, 1308, 1600, 1100, 1450, 800, 598, 2200, 1308, 1600], 
    "expense": [1600, 800, 7600, 2600, 3200, 2700, 2850, 1600, 800, 7600, 2600, 3200]
  },
  "totals": {
    "income": 56850,
    "profit": 15950,
    "expense": 40900
  }
}
```

## 🔧 Backend Integration Steps

### Step 1: Replace Mock Functions

In `AnalyticsView.jsx`, locate these functions and replace them with actual API calls:

```javascript
// 🔴 TO IMPLEMENT: Replace mock with real API
const fetchStoreInfo = async () => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/store/info');
  // const data = await response.json();
  // setStoreInfo(data);
}

const fetchProducts = async (searchQuery = '') => {
  // TODO: Replace with actual API call  
  // const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
  // const data = await response.json();
  // setProducts(data);
}

const fetchCategories = async (searchQuery = '') => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/categories?search=${encodeURIComponent(searchQuery)}`);
  // const data = await response.json(); 
  // setCategories(data);
}

const fetchAnalytics = async (period = 'overall', type = 'overall', productId = null, categoryId = null) => {
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
}
```

### Step 2: Remove Mock Data

Remove or comment out the mock data constants:

```javascript
// 🔴 TO REMOVE: Mock data for development
const mockProducts = [...];
const mockCategories = [...];
```

### Step 3: Update Data Display Functions

Update the `getStatValue()` function to use real data:

```javascript
// 🔴 TO UPDATE: Use real analytics data
const getStatValue = (type) => {
  // Use analyticsData.totals[type] instead of mock values
  if (analyticsData && analyticsData.totals) {
    return `₿${analyticsData.totals[type].toLocaleString()}`;
  }
  return '₿0';
};

const getChartData = () => {
  // Use analyticsData.data instead of mock data
  if (analyticsData && analyticsData.data) {
    return analyticsData.data;
  }
  return { income: [], profit: [], expense: [] };
};
```

## 🎨 UI Features Ready for Use

### ✅ Implemented Features:

1. **Loading States** - Spinners for all API operations
2. **Error Handling** - Error messages with retry buttons  
3. **Search Autocomplete** - Google-style search for products/categories
4. **Interactive Filtering** - Dynamic chart updates based on selections
5. **Responsive Design** - Mobile-first Tailwind CSS classes
6. **Chart Visualization** - SVG-based line charts with proper scaling
7. **Data Validation** - Fallback to empty states when data unavailable

### 🔄 Dynamic Behaviors:

- **Search as you type** - Product/category autocomplete
- **Click-outside detection** - Dropdown management
- **Real-time updates** - Chart redraws on filter changes
- **Responsive scaling** - Chart adapts to container size
- **Loading states** - Visual feedback during API calls

## 🎯 Testing Checklist

Before deploying to production, test these scenarios:

- [ ] Store info loads correctly on page mount
- [ ] Product search shows relevant results
- [ ] Category search shows relevant results  
- [ ] Overall analytics displays correctly
- [ ] Product-specific analytics work
- [ ] Category-specific analytics work
- [ ] Loading states appear during API calls
- [ ] Error states handle API failures gracefully
- [ ] Chart updates when filters change
- [ ] Mobile responsiveness works correctly

## 🚀 Deployment Notes

### Environment Variables
Make sure your backend API base URL is configured:

```javascript
// Consider using environment variables for API endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
```

### Performance Optimization
- API calls include debouncing for search queries
- Chart data is cached to prevent unnecessary re-renders
- Loading states prevent multiple simultaneous API calls

### Security Considerations
- Search queries are URL encoded to prevent injection attacks
- Error messages don't expose sensitive backend information
- API responses are validated before state updates

## 📞 Support

For questions about the UI implementation or integration:

1. Check the TODO comments in `AnalyticsView.jsx`
2. Review the expected API response formats above
3. Test with the provided mock data first
4. Ensure all loading/error states work correctly

---

**Ready for Backend Integration** ✅  
**Uses Tailwind CSS** ✅  
**Production Ready UI** ✅