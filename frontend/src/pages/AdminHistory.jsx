// src/pages/AdminHistory.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
} from "@mui/material";
import { Modal, Fade, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StarIcon from "@mui/icons-material/Star";
import AssessmentIcon from "@mui/icons-material/Assessment";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import {
  fetchHistoryBills,
  fetchBillById,
} from "../api";

const gold = "#d6ad60";
const darkCard = "#0d423a";
const darkBg = "#0f2d2a";

const AdminHistory = () => {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topItems: [],
  });
  const [trend, setTrend] = useState([]);
  const [bills, setBills] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  // Invoice modal
  const [openBillModal, setOpenBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const handleOpenBill = async (id) => {
    try {
      const res = await fetchBillById(id);
      if (res.data.success) {
        setSelectedBill(res.data.bill);
        setOpenBillModal(true);
      }
    } catch (err) {
      console.error("Error fetching bill by id:", err);
    }
  };

  const closeModal = () => setOpenBillModal(false);

  // ---------- CORE: LOAD BILLS FOR CURRENT FILTERS ----------
  const loadBills = async () => {
    try {
      const res = await fetchHistoryBills({
        range: dateRange,
        from: customFrom,
        to: customTo,
        search,
        payment,
        status,
      });
      if (res.data.success) {
        const billsData = res.data.bills || [];
        setBills(billsData);
        recomputeSummaryAndTrend(billsData);
      }
    } catch (err) {
      console.error("Bills load error:", err);
    }
  };

  // Re-run when filters change
  useEffect(() => {
    loadBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customFrom, customTo, search, payment, status]);

  // ---------- COMPUTE SUMMARY + TREND FROM BILLS ----------
  const recomputeSummaryAndTrend = (billsData) => {
    let totalRevenue = 0;
    const totalOrders = billsData.length;

    const itemStats = {};
    const trendMap = {};

    billsData.forEach((bill) => {
      const amt = Number(bill.totalAmount) || 0;
      totalRevenue += amt;

      // Best-selling items calc
      (bill.items || []).forEach((item) => {
        const key = item.name;
        if (!itemStats[key]) {
          itemStats[key] = { qty: 0, revenue: 0 };
        }
        itemStats[key].qty += Number(item.quantity) || 0;
        itemStats[key].revenue += (Number(item.quantity) || 0) * (Number(item.price) || 0);
      });

      // Trend by date
      if (bill.createdAt) {
        const d = new Date(bill.createdAt);
        const keyDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
        trendMap[keyDate] = (trendMap[keyDate] || 0) + amt;
      }
    });

    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    const topItems = Object.entries(itemStats)
      .map(([name, stats]) => ({
        itemName: name,
        quantitySold: stats.qty,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    const trendArr = Object.entries(trendMap)
      .sort(([d1], [d2]) => new Date(d1) - new Date(d2))
      .map(([date, revenue]) => ({ date, revenue }));

    setSummary({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topItems,
    });
    setTrend(trendArr);
  };

  const ranges = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "half-year", label: "Last 6 Months" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: darkBg,
        p: { xs: 2, md: 4 },
        color: "white",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: gold, mb: 0.5 }}
          >
            Billing History & Analytics
          </Typography>
          <Typography variant="body2" color="#d0e5de">
            Track Café Caffea&apos;s revenue, orders and top selling items over
            time.
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: "#9fb9b2" }}>
          Showing{" "}
          <span style={{ color: gold, fontWeight: 600 }}>{bills.length}</span>{" "}
          bills for the selected period
        </Typography>
      </Box>

      {/* DATE RANGE CHIPS */}
      <Box
        sx={{
          width: "100%",
          background: "transparent",
          py: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            width: "100%",
            maxWidth: "1400px",
            px: 2,
          }}
        >
          {ranges.map((r) => (
            <Chip
              key={r.key}
              label={r.label}
              clickable
              onClick={() => setDateRange(r.key)}
              sx={{
                px: 2,
                py: 0.5,
                fontSize: 14,
                borderRadius: "12px",
                border: `1px solid ${gold}`,
                background: dateRange === r.key ? gold : "transparent",
                color: dateRange === r.key ? "#000" : gold,
                "&:hover": {
                  background: gold,
                  color: "#000",
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* SUMMARY CARDS */}
      <Grid
        container
        spacing={3}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          mb: 4,
          justifyContent: "center",
        }}
      >
        {[
          {
            icon: <TrendingUpIcon sx={{ fontSize: 42, color: gold }} />,
            value:
              "₹ " +
              (summary.totalRevenue
                ? summary.totalRevenue.toFixed(2)
                : 0),
            label: "Total Revenue",
          },
          {
            icon: <ReceiptLongIcon sx={{ fontSize: 42, color: gold }} />,
            value: summary.totalOrders || 0,
            label: "Total Orders",
          },
          {
            icon: <AssessmentIcon sx={{ fontSize: 42, color: gold }} />,
            value:
              "₹ " +
              (summary.avgOrderValue
                ? summary.avgOrderValue.toFixed(2)
                : 0),
            label: "Avg Order Value",
          },
          {
            icon: <StarIcon sx={{ fontSize: 42, color: gold }} />,
            value: summary.topItems?.[0]?.itemName || "—",
            label: "Best Selling Item",
          },
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                background: darkCard,
                borderRadius: "28px",
                height: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                py: 2,
                boxShadow: "0px 4px 14px rgba(0,0,0,0.35)",
                minWidth: 230,
              }}
            >
              {card.icon}
              <Typography variant="h6" sx={{ color: "white" }}>
                {card.value}
              </Typography>
              <Typography
                sx={{
                  color: gold,
                  fontSize: 14,
                  px: 1,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {card.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CHARTS (still your same UI – now using computed trend & summary.topItems)
          Uncomment whenever you want them visible */}

      {false && (
        <Grid
          container
          spacing={3}
          sx={{
            maxWidth: 1200,
            mx: "auto",
            mb: 4,
            justifyContent: "center",
          }}
        >
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: darkCard,
                borderRadius: "28px",
                height: 360,
                boxShadow: "0px 4px 14px rgba(0,0,0,0.35)",
              }}
            >
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6" sx={{ color: gold, mb: 1 }}>
                  Revenue Trend
                </Typography>
                <Divider sx={{ mb: 2, borderColor: "#ffffff25" }} />
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid stroke="#ffffff20" />
                      <XAxis dataKey="date" stroke="#ffffff80" />
                      <YAxis stroke="#ffffff80" />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={gold}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: darkCard,
                borderRadius: "28px",
                height: 360,
                boxShadow: "0px 4px 14px rgba(0,0,0,0.35)",
              }}
            >
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6" sx={{ color: gold, mb: 1 }}>
                  Top Selling Items
                </Typography>
                <Divider sx={{ mb: 2, borderColor: "#ffffff25" }} />
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.topItems}>
                      <CartesianGrid stroke="#ffffff20" />
                      <XAxis dataKey="itemName" stroke="#ffffff80" />
                      <YAxis stroke="#ffffff80" />
                      <RechartsTooltip />
                      <Bar
                        dataKey="quantitySold"
                        fill={gold}
                        barSize={40}
                        radius={[10, 10, 10, 10]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* BILLS TABLE */}
      <Card
        sx={{
          background: darkCard,
          borderRadius: "24px",
          boxShadow: "0px 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: gold }}
            >
              Bills List
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                placeholder="Search invoice / table / customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: gold }} />
                    </InputAdornment>
                  ),
                  style: { color: "white" },
                }}
                sx={{
                  minWidth: 230,
                  background: "#ffffff10",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff30",
                  },
                }}
              />

              <TextField
                select
                label="Payment"
                size="small"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                sx={{
                  minWidth: 140,
                  background: "#ffffff10",
                  borderRadius: 2,
                  "& .MuiInputLabel-root": { color: "#c4d6d1" },
                  "& .MuiSvgIcon-root": { color: gold },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff30",
                  },
                }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
              </TextField>

              <TextField
                select
                label="Status"
                size="small"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{
                  minWidth: 140,
                  background: "#ffffff10",
                  borderRadius: 2,
                  "& .MuiInputLabel-root": { color: "#c4d6d1" },
                  "& .MuiSvgIcon-root": { color: gold },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff30",
                  },
                }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
              </TextField>
            </Stack>
          </Box>

          <Paper
            sx={{
              background: "#ffffff08",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: gold }}>Invoice</TableCell>
                  <TableCell sx={{ color: gold }}>Date</TableCell>
                  <TableCell sx={{ color: gold }}>Table</TableCell>
                  <TableCell sx={{ color: gold }}>Customer</TableCell>
                  <TableCell sx={{ color: gold }}>Status</TableCell>
                  <TableCell sx={{ color: gold }} align="right">
                    Total (₹)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ color: "#c6d6d1" }}>
                      No bills found for selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((b) => (
                    <TableRow
                      key={b._id}
                      hover
                      sx={{
                        "& td": {
                          borderBottomColor: "#ffffff15",
                          color: "#e6f2ee",
                        },
                      }}
                    >
                      <TableCell
                        onClick={() => handleOpenBill(b._id)}
                        sx={{
                          color: gold,
                          cursor: "pointer",
                          textDecoration: "underline",
                          "&:hover": { opacity: 0.8 },
                        }}
                      >
                        {b.invoiceNumber}
                      </TableCell>

                      <TableCell>
                        {new Date(b.createdAt).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>{b.tableName}</TableCell>
                      <TableCell>{b.customerName || "Walk-in"}</TableCell>
                      <TableCell>{b.status}</TableCell>
                      <TableCell align="right">
                        ₹ {Number(b.totalAmount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* INVOICE MODAL */}
      <Modal
        open={openBillModal}
        onClose={closeModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300 }}
      >
        <Fade in={openBillModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 480,
              bgcolor: darkCard,
              color: "white",
              p: 3,
              borderRadius: "20px",
              boxShadow: 24,
            }}
          >
            {/* Header */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6" sx={{ color: gold }}>
                Invoice Details
              </Typography>
              <CloseIcon
                onClick={closeModal}
                sx={{ cursor: "pointer", color: gold }}
              />
            </Box>

            {selectedBill && (
              <>
                <Typography>
                  <strong>Invoice:</strong> {selectedBill.invoiceNumber}
                </Typography>
                <Typography>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedBill.createdAt).toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Table:</strong> {selectedBill.tableName}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {selectedBill.status}
                </Typography>
                <Typography>
                  <strong>Payment:</strong> {selectedBill.paymentMethod}
                </Typography>

                <Divider sx={{ my: 2, borderColor: "#ffffff25" }} />

                <Typography sx={{ mb: 1, color: gold }}>Items</Typography>
                {selectedBill.items.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>
                      {item.name} × {item.quantity}
                    </Typography>
                    <Typography>₹ {item.price}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2, borderColor: "#ffffff25" }} />

                <Typography
                  variant="h6"
                  sx={{ textAlign: "right", color: gold }}
                >
                  Total: ₹ {selectedBill.totalAmount}
                </Typography>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AdminHistory;
