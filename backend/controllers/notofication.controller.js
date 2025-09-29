import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "from",
        select: "username profileImg"
      })
      .populate({
        path: "post",
        select: "text img"
      });

    await Notification.updateMany(
      { to: userId },
      { $set: { read: true } }
    );

    res.status(200).json({ notifications });
  } catch (error) {
    console.log("Error in getNotifications controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  const userId = req.user._id;
  try {
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createNotification = async ({ from, to, type, post }) => {
  try {
    const existingNotification = await Notification.findOne({
      from,
      to,
      type,
      post: post || null,
    });

    if (!existingNotification) {
      const notification = new Notification({
        from,
        to,
        type,
        post: post || null,
      });
      await notification.save();
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
