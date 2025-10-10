const User = require("../../models/user");
const Project = require("../../models/project");
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

// Add to routes/route.js

// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        students,
      },
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("student", "firstName lastName studentId department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Get all projects error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete all projects by this student first
    await Project.deleteMany({ student: studentId });

    // Then delete the student
    await User.findByIdAndDelete(studentId);

    res.json({
      success: true,
      message: "Student and all associated projects deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Project.findByIdAndDelete(projectId);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
