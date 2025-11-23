import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [tables, setTables] = useState({});
  const [selectedTable, setSelectedTable] = useState("");

  // Load from storage
  useEffect(() => {
    const stored = localStorage.getItem("cafeCaffeaTables");
    if (stored) setTables(JSON.parse(stored));
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem("cafeCaffeaTables", JSON.stringify(tables));
  }, [tables]);

  // ⭐ Always use the MongoDB ID as the key
  const getItemKey = (item) => {
    const sub = (item.subCategory || "regular").toLowerCase();
    return `${item._id}::${sub}`;
  };

  // ===================== ADD TO CART =====================
  const addToCart = (tableName, item) => {
    setTables((prev) => {
      const updated = { ...prev };
      const key = getItemKey(item);

      const table = updated[tableName]
        ? { ...updated[tableName] }
        : { orders: [] };

      updated[tableName] = table;

      let batch = table.orders.find((b) => !b.confirmed);

      if (!batch) {
        batch = { id: Date.now(), items: {}, confirmed: false };
        table.orders = [...table.orders, batch];
      } else {
        batch = { ...batch, items: { ...batch.items } };
        table.orders = table.orders.map((b) =>
          b.id === batch.id ? batch : b
        );
      }

      if (batch.items[key]) {
        batch.items[key] = {
          ...batch.items[key],
          quantity: batch.items[key].quantity + 1,
        };
      } else {
        batch.items[key] = {
          ...item,
          quantity: 1,
          key,
          subCategory: item.subCategory || "regular",
        };
      }

      return updated;
    });
  };

  // ===================== REMOVE FROM CART =====================
  const removeFromCart = (tableName, item) => {
    setTables((prev) => {
      const updated = { ...prev };
      const key = getItemKey(item);

      const table = updated[tableName];
      if (!table) return prev;

      const batchIndex = table.orders.findIndex((b) => !b.confirmed);
      if (batchIndex === -1) return prev;

      const batch = {
        ...table.orders[batchIndex],
        items: { ...table.orders[batchIndex].items },
      };

      if (!batch.items[key]) return prev;

      if (batch.items[key].quantity > 1) {
        batch.items[key] = {
          ...batch.items[key],
          quantity: batch.items[key].quantity - 1,
        };
      } else {
        delete batch.items[key];
      }

      table.orders = table.orders.map((b, i) =>
        i === batchIndex ? batch : b
      );

      return updated;
    });
  };

  // ===================== CONFIRM ORDER =====================
  const confirmOrder = (tableName) => {
    setTables((prev) => {
      const updated = { ...prev };
      const table = updated[tableName];
      if (!table) return prev;

      const batch = table.orders.find((b) => !b.confirmed);
      if (batch) batch.confirmed = true;

      return updated;
    });
  };

  // ===================== ADMIN ADD ITEM =====================
  const addItemByAdmin = (tableName, item) => {
    setTables((prev) => {
      const updated = { ...prev };
      const key = getItemKey(item);

      const table = updated[tableName];
      if (!table) return prev;

      let batch = table.orders[table.orders.length - 1];

      if (!batch || !batch.confirmed) {
        batch = { id: Date.now(), items: {}, confirmed: true };
        table.orders.push(batch);
      }

      if (batch.items[key]) {
        batch.items[key].quantity += 1;
      } else {
        batch.items[key] = { ...item, quantity: 1, key };
      }

      return updated;
    });
  };

  // ===================== ADMIN REMOVE ITEM =====================
  const removeItemByAdmin = (tableName, itemKey) => {
    setTables((prev) => {
      const updated = { ...prev };
      const table = updated[tableName];
      if (!table) return prev;

      table.orders.forEach((batch) => {
        if (batch.items[itemKey]) delete batch.items[itemKey];
      });

      return updated;
    });
  };

  // ===================== CLEAR ALL ORDERS =====================
  const resetAllOrders = () => {
    setTables({});
    localStorage.removeItem("cafeCaffeaTables");
  };

  // ===================== CLEAR SPECIFIC TABLE (USED AFTER BILL) =====================
  const clearTable = (tableName) => {
    setTables((prev) => {
      const updated = { ...prev };
      if (updated[tableName]) {
        delete updated[tableName];
      }
      return updated;
    });
  };

  return (
    <CartContext.Provider
      value={{
        tables,
        selectedTable,
        setSelectedTable,
        addToCart,
        removeFromCart,
        confirmOrder,
        addItemByAdmin,
        removeItemByAdmin,
        resetAllOrders,
        clearTable, // 👈 exposed here
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
