const User = require("../../models/user");

// ✅ Approve a student account
exports.approveStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "User is not a student",
      });
    }

    student.isApproved = true;
    await student.save();

    res.json({
      success: true,
      message: "Student account approved successfully",
      data: {
        user: student,
      },
    });
  } catch (error) {
    console.error("Approve student error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Get all pending students
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      isApproved: false,
    }).select("-password");

    res.json({
      success: true,
      data: {
        students,
      },
    });
  } catch (error) {
    console.error("Get pending students error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
