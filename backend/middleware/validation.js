const { body } = require("express-validator");

exports.validateStudentSignup = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("studentId").notEmpty().withMessage("Student ID is required"),

  body("department")
    .isIn([
      "fashion-design",
      "textile-technology",
      "fashion-marketing",
      "pattern-making-garment-construction",
      "fashion-merchandising",
      "apparel-production",
      "fashion-illustration",
      "fashion-styling",
      "accessory-design",
      "footwear-design",
      "fashion-photography",
      "visual-merchandising",
      "sustainable-fashion",
      "fabric-science",
      "costume-design",
      "fashion-communication",
      "fashion-business-management",
      "fashion-technology",
      "jewelry-design",
      "fashion-entrepreneurship",
    ])
    .withMessage("Please select a valid department"),
];

exports.validateAdminSignup = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

exports.validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  body("role")
    .isIn(["student", "admin"])
    .withMessage("Please select a valid role"),
];
