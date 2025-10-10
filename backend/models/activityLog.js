// models/activityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        // Student Actions
        "student_login",
        "student_logout",
        "student_signup",
        "student_profile_update",
        "project_submission",
        "project_view",
        "project_edit",
        "project_delete",

        // Admin Actions
        "admin_login",
        "admin_logout",
        "student_approval",
        "student_rejection",
        "bulk_student_approval",
        "project_approval",
        "project_rejection",
        "project_review",
        "analytics_view",
        "dashboard_view",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["user", "project", "system", "analytics", null],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "resourceType",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
