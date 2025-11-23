import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    checkIn: Date,
    checkOut: Date,
    hoursWorked: Number,
    status: {
      type: String,
      enum: ["Present", "Absent", "Half-Day", "Leave"],
      default: "Present",
    },
  },
  { _id: false }
);

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    role: {
      type: String,
      enum: ["Chef", "Waiter", "Manager", "Cashier", "Admin", "Cleaner"],
      required: true,
    },

    phone: String,

    // Monthly salary
    salary: { type: Number, default: 0 },

    // Active / Resigned / On Leave
    status: {
      type: String,
      enum: ["Active", "Resigned", "On Leave"],
      default: "Active",
    },

    joinedAt: { type: Date, default: Date.now },

    // NEW — shift timings
    shift: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
    },

    // NEW — Track employee attendance
    attendance: [AttendanceSchema],

    // NEW — Performance score for Admin Analytics
    performanceScore: { type: Number, default: 100 },

    // NEW — Assigned tables (for waiters)
    assignedTables: [String], // ["Table 1", "Table 4"]

    // NEW — Emergency contact
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", EmployeeSchema);
