import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Helper to ensure subCategory is always present
const normalizeMenuPayload = (data) => ({
  ...data,
  subCategory: data.subCategory ? data.subCategory : "",
});

/* ===========================
    MENU
=========================== */
export const fetchCategories = () =>
  axios.get(`${API_URL}/categories`);

export const fetchAllMenu = () =>
  axios.get(`${API_URL}/menu`);

export const fetchMenuByCategory = (category) =>
  axios.get(`${API_URL}/menu/${category}`);

export const createMenuItemAPI = (menuData) =>
  axios.post(`${API_URL}/menu`, normalizeMenuPayload(menuData));

export const updateMenuItemAPI = (id, menuData) =>
  axios.put(`${API_URL}/menu/${id}`, normalizeMenuPayload(menuData));

export const deleteMenuItemAPI = (id) =>
  axios.delete(`${API_URL}/menu/${id}`);

/* ===========================
    IMAGE UPLOAD
=========================== */
export const uploadImageAPI = (formData) =>
  axios.post(`${API_URL}/upload/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ===========================
    ORDERS (NEW SYSTEM)
=========================== */

// Create a NEW order batch (called when user places order)
export const createOrder = (tableName, items) =>
  axios.post(`${API_URL}/orders`, { tableName, items });

// Fetch all table orders (Admin dashboard)
export const fetchAllOrders = () =>
  axios.get(`${API_URL}/orders`);

// Mark specific order as served
export const markOrderServed = (orderId) =>
  axios.patch(`${API_URL}/orders/${orderId}/served`);

// Add an item to existing order
export const addItemToOrder = (orderId, item) =>
  axios.patch(`${API_URL}/orders/${orderId}/add-item`, item);

// Remove an item from existing order
export const removeItemFromOrder = (orderId, itemId) =>
  axios.patch(`${API_URL}/orders/${orderId}/remove-item`, { itemId });

/* ===========================
    CATEGORIES MGMT
=========================== */
export const fetchCategoriesAPI = () =>
  axios.get(`${API_URL}/categories`);

export const createCategoryAPI = (data) =>
  axios.post(`${API_URL}/categories`, data);

export const updateCategoryAPI = (id, data) =>
  axios.put(`${API_URL}/categories/${id}`, data);

export const deleteCategoryAPI = (id) =>
  axios.delete(`${API_URL}/categories/${id}`);

/* ===========================
    BILLING
=========================== */
export const createBillAPI = (billData) =>
  axios.post(`${API_URL}/billing/create`, billData);

export const fetchAllBills = () =>
  axios.get(`${API_URL}/billing/all`);

/* ===========================
    HISTORY
=========================== */


// Get summary cards (revenue, orders, avg, top items)
export const fetchHistorySummary = (params) =>
  axios.get(`${API_URL}/history/summary`, { params });


// Get bills with filters (date range, search, payment, status)
export const fetchHistoryBills = (params) =>
  axios.get(`${API_URL}/history/bills`, { params });

// Get revenue trend (line graph)
export const fetchHistoryTrend = () =>
  axios.get(`${API_URL}/history/trend`);

export const fetchBillById = (id) =>
  axios.get(`${API_URL}/billing/${id}`);

/* ===========================
    INVENTORY
=========================== */
export const fetchInventory = () =>
  axios.get(`${API_URL}/inventory`);

export const fetchLowStock = () =>
  axios.get(`${API_URL}/inventory/low-stock`);
export const addInventoryAPI = (data) =>
  axios.post(`${API_URL}/inventory/add`, data);

/* ===========================
    NOTIFICATIONS
=========================== */
export const fetchNotifications = () =>
  axios.get(`${API_URL}/notifications`);

export const createInventoryItem = (data) =>
  axios.post(`${API_URL}/inventory/add`, data);




export default {
  fetchCategories,
  fetchAllMenu,
  fetchMenuByCategory,
  createMenuItemAPI,
  updateMenuItemAPI,
  createInventoryItem,
  deleteMenuItemAPI,
  createOrder,
  fetchAllOrders,
  markOrderServed,
  addItemToOrder,
  removeItemFromOrder,
  createBillAPI,
  fetchAllBills,
  fetchHistorySummary,
  fetchHistoryBills,
  fetchHistoryTrend,
  fetchInventory,
  fetchLowStock,
  fetchNotifications,
  addInventoryAPI,
  uploadImageAPI,
};
