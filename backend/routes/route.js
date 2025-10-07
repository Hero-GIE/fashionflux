// routes/route.js
const express = require("express");
const {
  validateStudentSignup,
  validateAdminSignup,
  validateLogin,
} = require("../middleware/validation");
const {
  studentSignup,
  adminSignup,
  login,
  getMe,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const {
  getPendingStudents,
  approveStudent,
} = require("../controllers/admin/approveStudents");
const {
  saveStudentProfile,
  getStudentProfile,
} = require("../controllers/student/studentProfileController");
const {
  createProject,
  getStudentProjects,
  getProject,
  getAllProjects,
  getProjectCategories,
} = require("../controllers/student/projectController");
const upload = require("../middleware/upload");
const {
  getStudentStatistics,
  getStudentAnalytics,
} = require("../controllers/admin/statisticsController");

const router = express.Router();

// Public routes
router.post("/student/signup", validateStudentSignup, studentSignup);
router.post("/admin/signup", validateAdminSignup, adminSignup);
router.post("/login", validateLogin, login);

// Protected routes
router.get("/me", protect, getMe);

// Admin routes
router.get(
  "/admin/pending-students",
  protect,
  authorize("admin"),
  getPendingStudents
);
router.patch(
  "/admin/approve-student/:studentId",
  protect,
  authorize("admin"),
  approveStudent
);

// Profile routes - REMOVE /api prefix
router.post("/student/save-profile", protect, saveStudentProfile);
router.get("/student/get-student-profile", protect, getStudentProfile);

// Project routes - REMOVE /api prefix
router.post(
  "/student/create-projects",
  protect,
  upload.array("images", 10),
  createProject
);
router.get("/student/get-student-projects", protect, getStudentProjects);
router.get("/student/get-projects/:projectId", protect, getProject);

// Public Gallery Routes (No authentication required)
router.get("/public/projects", getAllProjects);
router.get("/public/projects/categories", getProjectCategories);

// Admin Statistics Routes - ADD THESE
router.get(
  "/admin/statistics/students",
  protect,
  authorize("admin"),
  getStudentStatistics
);
router.get(
  "/admin/statistics/analytics",
  protect,
  authorize("admin"),
  getStudentAnalytics
);

module.exports = router;
