// utils/logger.js
const ActivityLog = require("../models/activityLog");

class SystemLogger {
  static async logActivity(userId, action, description, metadata = {}) {
    try {
      // Enhanced duplicate prevention - check for same action within last minute
      const oneMinuteAgo = new Date(Date.now() - 60000);

      const recentDuplicate = await ActivityLog.findOne({
        user: userId,
        action: action,
        description: description,
        timestamp: { $gte: oneMinuteAgo },
      });

      // Only create log if no recent duplicate exists
      if (!recentDuplicate) {
        await ActivityLog.create({
          user: userId,
          action,
          description,
          metadata,
          timestamp: new Date(),
        });
        console.log(`✅ Activity logged: ${action} - ${description}`);
      } else {
        console.log(
          `⏭️  Duplicate activity skipped: ${action} - ${description}`
        );
      }
    } catch (error) {
      console.error("Manual logging error:", error);
    }
  }

  // Specific log methods for common actions with enhanced duplicate prevention
  static async logStudentApproval(adminId, studentId, studentName) {
    await this.logActivity(
      adminId,
      "student_approval",
      `Approved student: ${studentName}`,
      { studentId, studentName, actionType: "student_approval" }
    );
  }

  static async logProjectSubmission(studentId, projectId, projectTitle) {
    await this.logActivity(
      studentId,
      "project_submission",
      `Submitted project: ${projectTitle}`,
      { projectId, projectTitle, actionType: "project_submission" }
    );
  }

  static async logBulkApproval(adminId, count) {
    await this.logActivity(
      adminId,
      "bulk_student_approval",
      `Bulk approved ${count} students`,
      { studentCount: count, actionType: "bulk_approval" }
    );
  }

  // Specific method for analytics views with stricter duplicate prevention
  static async logAnalyticsView(userId, dashboardType = "platform_overview") {
    // Very strict duplicate prevention for analytics views - 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 120000);

    const recentAnalyticsView = await ActivityLog.findOne({
      user: userId,
      action: "analytics_view",
      "metadata.dashboard": dashboardType,
      timestamp: { $gte: twoMinutesAgo },
    });

    if (!recentAnalyticsView) {
      await this.logActivity(
        userId,
        "analytics_view",
        `Admin viewed ${dashboardType} analytics`,
        { dashboard: dashboardType, timestamp: new Date().toISOString() }
      );
    }
  }
}

module.exports = SystemLogger;
