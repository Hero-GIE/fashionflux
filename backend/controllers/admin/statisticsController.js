// controllers/admin/statisticsController.js
const User = require("../../models/user");

// Get Student Statistics
exports.getStudentStatistics = async (req, res) => {
  try {
    console.log("📊 Fetching student statistics...");

    // Get total pending students
    const totalPending = await User.countDocuments({
      role: "student",
      isApproved: false,
    });

    // Get total approved students
    const totalApproved = await User.countDocuments({
      role: "student",
      isApproved: true,
    });

    // Get total students (both pending and approved)
    const totalStudents = await User.countDocuments({ role: "student" });

    console.log("📈 Student statistics:", {
      totalPending,
      totalApproved,
      totalStudents,
    });

    res.json({
      success: true,
      data: {
        statistics: {
          totalPending,
          totalApproved,
          totalStudents,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get student statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Detailed Student Analytics
exports.getStudentAnalytics = async (req, res) => {
  try {
    // Get students by department
    const studentsByDepartment = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$isApproved", false] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          role: "student",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        studentsByDepartment,
        registrationTrends,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Get student analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
