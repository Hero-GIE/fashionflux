const User = require("../../models/user");
const Project = require("../../models/project");
const ActivityLog = require("../../models/activityLog");
const SystemLogger = require("../../utils/logger");

// Get Platform Analytics Dashboard
exports.getPlatformAnalytics = async (req, res) => {
  try {
    // Check for recent duplicate analytics view logs (within last 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const recentAnalyticsView = await ActivityLog.findOne({
      user: req.user.id,
      action: "analytics_view",
      description: "Admin viewed analytics dashboard",
      timestamp: { $gte: thirtySecondsAgo },
    });

    // Only log if no recent duplicate exists
    if (!recentAnalyticsView) {
      await SystemLogger.logAnalyticsView(
        req.user.id,
        "analytics_view",
        "Admin viewed analytics dashboard",
        {
          dashboard: "platform_overview",
          timestamp: new Date().toISOString(),
        }
      );
    }

    // User Statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$isApproved", false] }, 1, 0] } },
        },
      },
    ]);

    // Project Statistics
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    // Department-wise Statistics
    const departmentStats = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: "$department",
          totalStudents: { $sum: 1 },
          approvedStudents: {
            $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] },
          },
          totalProjects: {
            $sum: {
              $cond: [{ $eq: ["$role", "student"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Recent Activity Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          studentRegistrations: {
            $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] },
          },
          adminRegistrations: {
            $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Project Submission Trends
    const projectTrends = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          submissions: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Popular Project Categories
    const categoryStats = await Project.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgViews: { $avg: "$views" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // System Performance Metrics
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeToday = await ActivityLog.countDocuments({
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProjects,
          activeToday,
          approvalRate: userStats.find((u) => u._id === "student")
            ? (
                (userStats.find((u) => u._id === "student").approved /
                  userStats.find((u) => u._id === "student").count) *
                100
              ).toFixed(1)
            : 0,
        },
        userStats,
        projectStats: projectStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        departmentStats,
        trends: {
          registrations: registrationTrends,
          projects: projectTrends,
        },
        categories: categoryStats,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};

// Get Real-time Activity Feed
exports.getActivityFeed = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const activities = await ActivityLog.find()
      .populate("user", "firstName lastName email role")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments();

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Activity feed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load activity feed",
      error: error.message,
    });
  }
};
