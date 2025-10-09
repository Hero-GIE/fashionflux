const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "30d" }
  );
};

// Student Signup
exports.studentSignup = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password, studentId, department } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or student ID",
      });
    }

    // Create new student
    const student = new User({
      firstName,
      lastName,
      email,
      password,
      studentId,
      department,
      role: "student",
      isApproved: false, // Students need admin approval
    });

    await student.save();

    // Generate token
    const token = generateToken(student._id, student.role);

    res.status(201).json({
      success: true,
      message:
        "Student account created successfully. Waiting for admin approval.",
      data: {
        user: student,
        token,
      },
    });
  } catch (error) {
    console.error("Student signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin Signup
exports.adminSignup = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email,
      role: "admin",
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    // Create new admin
    const admin = new User({
      firstName,
      lastName,
      email,
      password,
      role: "admin",
      isApproved: true, // Admins are auto-approved
    });

    await admin.save();

    // Generate token
    const token = generateToken(admin._id, admin.role);

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        user: admin,
        token,
      },
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password, role } = req.body;

    // Find user by email only first
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify the role matches
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid role selection. This email is registered as a ${user.role}.`,
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        message:
          "Your account is pending approval. Please contact administrator.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
