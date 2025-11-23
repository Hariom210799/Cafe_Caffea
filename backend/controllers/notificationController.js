import Notification from "../models/Notification.js";

// GET unread notifications
export const getUnreadNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all with optional filter
export const getNotifications = async (req, res) => {
  try {
    const { type, level } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (level) filter.level = level;

    const notifs = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mark one notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// mark all notifications as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// helper - create notifications (used across entire system)
export const createNotification = async ({ type, message, level, data }) => {
  try {
    const notif = new Notification({
      type,
      message,
      level: level || "info",
      data: data || {},
    });

    await notif.save();
    return notif;
  } catch (err) {
    console.error("❌ Error creating notification:", err.message);
  }
};
