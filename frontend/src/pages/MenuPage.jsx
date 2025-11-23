// src/pages/MenuPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchAllMenu, fetchCategories } from "../api";

const MenuPage = () => {
  const navigate = useNavigate();
  const {
    tables,
    selectedTable,
    setSelectedTable,
    addToCart,
    removeFromCart,
  } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showTableSelect, setShowTableSelect] = useState(false);

  // Floating bubble
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });

  // Which variant (subCategory) selected
  const [selectedVariants, setSelectedVariants] = useState({});

  const handleMouseMove = (e) => {
    setBubblePos({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const tablesList = Array.from({ length: 9 }, (_, i) => `Table ${i + 1}`);

  // 1) If a table is already selected (user came back with "Back to Menu"),
  //    keep it selected and show the table selector so Add to Cart works.
  useEffect(() => {
    if (selectedTable) {
      setShowTableSelect(true);
    }
  }, [selectedTable]);

  // 2) Listen for a HARD RESET from ConfirmOrder ("Confirm This Order")
  //    → reset everything + force table reselect.
  // 🔥 HARD RESET when coming from Confirm Order
useEffect(() => {
  const doHardReset = () => {
    console.log("🔥 Hard reset triggered");

    setSelectedTable("");      // clear table
    setShowTableSelect(false); // hide table dropdown
    setSelectedCategory("All");
    setSearch("");
    setSelectedVariants({});
    setShowBubble(false);

    // OPTIONAL: You can clear local cart if needed
    // but CartContext confirmOrder already handles that.
  };

  window.addEventListener("hard-reset-menu", doHardReset);

  return () => window.removeEventListener("hard-reset-menu", doHardReset);
}, []);


  // LOAD CATEGORIES + MENU
  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await fetchCategories();
        setCategories([{ name: "All" }, ...catRes.data]);

        const menuRes = await fetchAllMenu();
        setMenuItems(menuRes.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    load();
  }, []);

  // GROUP MENU ITEMS (same category + name)
  const groupedMenu = useMemo(() => {
    const map = new Map();

    menuItems.forEach((item) => {
      const key = `${item.category}||${item.name}`;
      if (!map.has(key)) {
        map.set(key, { key, base: item, variants: [] });
      }
      map.get(key).variants.push(item);
    });

    // sort variants (small → medium → large)
    const order = ["small", "medium", "large"];
    map.forEach((group) => {
      group.variants.sort((a, b) => {
        const ai = order.indexOf((a.subCategory || "").toLowerCase());
        const bi = order.indexOf((b.subCategory || "").toLowerCase());
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    });

    return Array.from(map.values());
  }, [menuItems]);

  // FILTER MENUS
  const filteredGroups = groupedMenu.filter(({ base }) => {
    const matchCategory =
      selectedCategory === "All" || base.category === selectedCategory;
    const matchSearch = base.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // CART logic (current table)
  const currentTable = tables[selectedTable];
  const currentBatch = currentTable?.orders?.find((b) => !b.confirmed);
  const cartItems = currentBatch?.items || {};

  const totalItems = Object.values(cartItems).reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const totalAmount = Object.values(cartItems).reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // Card image
  const renderCardImage = (item) => {
    if (item.image) {
      return (
        <CardMedia
          component="img"
          image={item.image}
          alt={item.name}
          sx={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            objectPosition: "center",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          width: "100%",
          height: 200,
          background:
            "linear-gradient(135deg, rgba(214,173,96,0.3), rgba(20,49,44,0.9))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f1e8d2",
          fontStyle: "italic",
        }}
      >
        Image not available
      </Box>
    );
  };

  // selected variant getter
  const getCurrentVariant = (group) => {
    const { key, variants } = group;
    if (!variants.length) return null;

    const selectedSub = selectedVariants[key];
    if (!selectedSub) return variants[0];

    return (
      variants.find(
        (v) => (v.subCategory || "").toLowerCase() === selectedSub
      ) || variants[0]
    );
  };

  const handleSelectVariant = (groupKey, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [groupKey]: (variant.subCategory || "").toLowerCase(),
    }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)",
        py: 8,
        px: { xs: 2, md: 8 },
        pb: 14, // space so last card isn't hidden behind footer
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ color: "#d6ad60", mb: 1 }}
        >
          Our Menu
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#cfc7b1", fontStyle: "italic" }}
        >
          Crafted with care, served with comfort — the Cafe Caffea way.
        </Typography>
      </Box>

      {/* Order Now */}
      {!showTableSelect && (
        <Box textAlign="center" mb={8}>
          <Button
            variant="contained"
            onClick={() => setShowTableSelect(true)}
            sx={{
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              fontWeight: "bold",
              px: 5,
              py: 1.3,
              borderRadius: "2rem",
              boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
            }}
          >
            Order Now
          </Button>
        </Box>
      )}

      {/* Table selector */}
      {showTableSelect && (
        <Box
          sx={{
            maxWidth: 420,
            mx: "auto",
            mb: 10,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 4,
            p: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#d6ad60", mb: 3 }}
          >
            Select Your Table
          </Typography>

          <TextField
            select
            fullWidth
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            label="Choose Table"
            sx={{
              "& .MuiOutlinedInput-root fieldset": { borderColor: "#d6ad60" },
              input: { color: "#f1e8d2" },
              "& .MuiSelect-select": { color: "#f1e8d2" },
              "& .MuiInputLabel-root": { color: "#f1e8d2" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#d6ad60" },
            }}
          >
            {tablesList.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {/* Search */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <TextField
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: { xs: "100%", sm: "60%", md: "40%" },
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            input: { color: "#f1e8d2" },
          }}
        />
      </Box>

      {/* Category Chips */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 6,
        }}
      >
        {categories.map((cat) => (
          <Box
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            sx={{
              px: 2,
              py: 1,
              borderRadius: "2rem",
              backgroundColor:
                selectedCategory === cat.name ? "#d6ad60" : "transparent",
              border: "1px solid #d6ad60",
              cursor: "pointer",
              color: selectedCategory === cat.name ? "#1b3a34" : "#e8d5b7",
            }}
          >
            <Typography fontWeight="bold">{cat.name}</Typography>
          </Box>
        ))}
      </Box>

      {/* Menu Cards */}
      <Grid container spacing={4} justifyContent="center">
        {filteredGroups.map((group) => {
          const { key, base, variants } = group;
          const currentVariant = getCurrentVariant(group) || base;

          const variantKey = `${currentVariant._id}::${(
            currentVariant.subCategory || "regular"
          ).toLowerCase()}`;

          const inCart = cartItems[variantKey]?.quantity || 0;

          const isPizzaWithSizes =
            base.category === "Pizza" && variants.length > 1;

          return (
            <Grid item key={key} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  width: 330,
                  minHeight: 520,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "#1b3a34",
                  color: "#f1e8d2",
                  borderRadius: "2rem",
                  overflow: "hidden",
                }}
              >
                {renderCardImage(currentVariant)}

                <CardContent
                  sx={{
                    textAlign: "center",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  {/* Title */}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      minHeight: 52,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {base.name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#cfc7b1",
                      height: 60,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    onMouseEnter={() => {
                      setBubbleText(
                        base.description || currentVariant.description || ""
                      );
                      setShowBubble(true);
                    }}
                    onMouseLeave={() => setShowBubble(false)}
                    onMouseMove={handleMouseMove}
                  >
                    {base.description || currentVariant.description}
                  </Typography>

                  {/* Size pills */}
                  {isPizzaWithSizes && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      {variants.map((v) => {
                        const selectedSub =
                          selectedVariants[key] ||
                          (variants[0].subCategory || "").toLowerCase();

                        const isSelected =
                          (v.subCategory || "").toLowerCase() === selectedSub;

                        return (
                          <Box
                            key={v._id}
                            onClick={() => handleSelectVariant(key, v)}
                            sx={{
                              px: 1.6,
                              py: 0.4,
                              borderRadius: "999px",
                              border: "1px solid #d6ad60",
                              cursor: "pointer",
                              backgroundColor: isSelected
                                ? "#d6ad60"
                                : "transparent",
                              color: isSelected ? "#1b3a34" : "#e8d5b7",
                              fontSize: "0.8rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {v.subCategory || "Regular"}
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Price */}
                  <Typography sx={{ color: "#d6ad60", mt: 0.5 }}>
                    ₹{currentVariant.price.toFixed(2)}
                  </Typography>

                  {/* Add / Remove */}
                  {inCart === 0 ? (
                    <Tooltip
                      title={
                        !showTableSelect
                          ? "Click 'Order Now' first"
                          : !selectedTable
                          ? "Select a table"
                          : ""
                      }
                    >
                      <span>
                        <Button
                          variant="contained"
                          disabled={!showTableSelect || !selectedTable}
                          onClick={() =>
                            addToCart(selectedTable, { ...currentVariant })
                          }
                          sx={{
                            backgroundColor: "#d6ad60",
                            color: "#1b3a34",
                            mt: 0.5,
                            opacity:
                              !showTableSelect || !selectedTable ? 0.6 : 1,
                          }}
                        >
                          Add to Cart
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <IconButton
                        onClick={() =>
                          removeFromCart(selectedTable, { ...currentVariant })
                        }
                        sx={{ color: "#d6ad60" }}
                      >
                        <Remove />
                      </IconButton>

                      <Typography fontWeight="bold">{inCart}</Typography>

                      <IconButton
                        onClick={() =>
                          addToCart(selectedTable, { ...currentVariant })
                        }
                        sx={{ color: "#d6ad60" }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Floating Description Bubble */}
      {showBubble && (
        <Box
          sx={{
            position: "fixed",
            top: bubblePos.y,
            left: bubblePos.x,
            zIndex: 9999,
            maxWidth: "260px",
            background: "rgba(27, 58, 52, 0.85)",
            backdropFilter: "blur(8px)",
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1px solid rgba(214,173,96,0.5)",
            color: "#f1e8d2",
            fontSize: "0.9rem",
            pointerEvents: "none",
          }}
        >
          {bubbleText}
        </Box>
      )}

      {/* BOTTOM CART FOOTER */}
      {totalItems > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#1b3a34",
            py: 2.5,
            px: 3,
            boxShadow: "0 -4px 8px rgba(0,0,0,0.5)",
            borderTop: "1px solid #d6ad60",
            zIndex: 200,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* LEFT: TOTAL */}
          <Typography
            sx={{
              color: "#d6ad60",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              mr: 2,
            }}
          >
            Total: ₹{totalAmount.toFixed(2)}
          </Typography>

          {/* CENTER: ITEMS */}
          <Typography
            sx={{
              color: "#e8d5b7",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              overflowX: "auto",
              flexGrow: 1,
              px: 2,
            }}
          >
            {Object.values(cartItems)
              .map(
                (item) =>
                  `${item.name}${
                    item.subCategory ? " • " + item.subCategory : ""
                  } × ${item.quantity}`
              )
              .join("   |   ")}
          </Typography>

          {/* RIGHT: BUTTON */}
          <Button
            variant="contained"
            onClick={() => navigate("/confirm-order")}
            sx={{
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              fontWeight: "bold",
              borderRadius: "1rem",
              px: 3.5,
              py: 1.2,
              ml: 2,
              whiteSpace: "nowrap",
            }}
          >
            Place Order
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MenuPage;
