import Employee from "../models/Employee.js";
import { createNotification } from "./notificationController.js";

// GET all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD employee
export const addEmployee = async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();

    await createNotification({
      type: "SYSTEM_ALERT",
      level: "success",
      message: `New employee added: ${emp.name} (${emp.role})`,
      data: { employeeId: emp._id },
    });

    res.json({ message: "Employee added", emp });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE employee
export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE employee
export const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK ATTENDANCE
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, status, checkIn } = req.body;

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    emp.attendance.push({
      status,
      checkIn,
      date: new Date(),
    });

    await emp.save();

    res.json({ message: "Attendance marked", emp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK CHECK-OUT
export const markCheckout = async (req, res) => {
  try {
    const { employeeId, checkOut } = req.body;

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const today = emp.attendance.at(-1); // last record
    if (!today) return res.status(400).json({ message: "No check-in found" });

    today.checkOut = checkOut;
    today.hoursWorked = calculateHours(today.checkIn, checkOut);

    await emp.save();

    res.json({ message: "Checkout recorded", emp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function
function calculateHours(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60 * 60);
  return Math.max(diff, 0);
}
