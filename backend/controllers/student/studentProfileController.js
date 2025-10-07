const User = require("../../models/user");

// Save/Update Student Profile
exports.saveStudentProfile = async (req, res) => {
  try {
    const {
      bio,
      skills,
      specialization,
      contactEmail,
      portfolioUrl,
      socialLinks,
    } = req.body;

    // Use userId to match JWT token structure
    const studentId = req.user.userId || req.user.id;

    console.log("Looking up student with ID:", studentId); // Debug log

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update profile data
    student.profile = {
      bio: bio || "",
      skills: skills || "",
      specialization: specialization || "",
      contactEmail: contactEmail || "",
      portfolioUrl: portfolioUrl || "",
      socialLinks: {
        instagram: socialLinks?.instagram || "",
        linkedin: socialLinks?.linkedin || "",
        behance: socialLinks?.behance || "",
      },
      updatedAt: new Date(),
    };

    await student.save();

    res.json({
      success: true,
      message: "Profile saved successfully",
      data: {
        profile: student.profile,
      },
    });
  } catch (error) {
    console.error("Save profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Student Profile
exports.getStudentProfile = async (req, res) => {
  try {
    // FIX: Use req.user.id instead of req.user.userId
    const studentId = req.user.id;

    const student = await User.findById(studentId).select(
      "profile firstName lastName email studentId department"
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: {
        profile: student.profile || {},
        user: {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          studentId: student.studentId,
          department: student.department,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
