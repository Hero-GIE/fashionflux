// middleware/activityLogger.js
const ActivityLog = require("../models/activityLog");

// Skip logging for these paths to avoid infinite loops
const SKIP_PATHS = [
  "/admin/analytics/",
  "/admin/statistics/",
  "/health-check",
  "/favicon",
];

const activityLogger = async (req, res, next) => {
  // Skip logging for certain paths
  if (SKIP_PATHS.some((path) => req.path.includes(path))) {
    return next();
  }

  const startTime = Date.now();

  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Override response methods to log after response
  res.json = function (data) {
    logActivity(req, res, data, Date.now() - startTime);
    originalJson.call(this, data);
  };

  res.send = function (data) {
    logActivity(req, res, data, Date.now() - startTime);
    originalSend.call(this, data);
  };

  next();
};

async function logActivity(req, res, responseData, responseTime) {
  try {
    // Skip if no user (public routes) OR if user is not authenticated yet
    if (!req.user) {
      return;
    }

    // Skip if this is an analytics/statistics request to prevent loops
    if (req.path.includes("/analytics/") || req.path.includes("/statistics/")) {
      return;
    }

    const action = mapRouteToAction(req);
    if (!action) return;

    // Create a unique identifier for this request to prevent duplicates
    const requestId = `${req.method}-${req.path}-${req.user.id}-${startTime}`;

    const logEntry = {
      user: req.user.id,
      action: action.type,
      description: action.description,
      resourceType: action.resourceType,
      resourceId: action.resourceId,
      metadata: {
        method: req.method,
        route: req.path,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        requestId: requestId, // Add unique request ID
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        body: shouldLogBody(req.method) ? sanitizeBody(req.body) : undefined,
        response: shouldLogResponse(action.type)
          ? sanitizeResponse(responseData)
          : undefined,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    // Check if similar log entry already exists in the last second to prevent duplicates
    const recentDuplicate = await ActivityLog.findOne({
      user: req.user.id,
      action: action.type,
      "metadata.route": req.path,
      timestamp: { $gte: new Date(Date.now() - 1000) }, // Last 1 second
    });

    if (!recentDuplicate) {
      await ActivityLog.create(logEntry);
    }
  } catch (error) {
    console.error("Activity logging error:", error);
    // Don't throw error to avoid breaking the main request
  }
}

// Update the mapRouteToAction function to be more specific
function mapRouteToAction(req) {
  const { method, path, user, params, body } = req;

  // Skip if user is not authenticated
  if (!user) return null;

  // Skip analytics endpoints to prevent logging our own analytics requests
  if (path.includes("/analytics/") || path.includes("/statistics/")) {
    return null;
  }

  // Student Actions
  if (path.includes("/student/")) {
    if (path.includes("/create-projects") && method === "POST") {
      return {
        type: "project_submission",
        description: `${user.firstName} submitted a new project: ${body.title}`,
        resourceType: "project",
        resourceId: null,
      };
    }

    if (path.includes("/save-profile") && method === "POST") {
      return {
        type: "student_profile_update",
        description: `${user.firstName} updated their profile`,
        resourceType: "user",
        resourceId: user.id,
      };
    }
  }

  // Admin Actions - Only log main actions, not data fetches
  if (path.includes("/admin/")) {
    // Only log approval/rejection actions, not data fetching
    if (path.includes("/approve-student") && method === "PATCH") {
      return {
        type: "student_approval",
        description: `Admin approved student: ${params.studentId}`,
        resourceType: "user",
        resourceId: params.studentId,
      };
    }

    if (path.includes("/approve-project") && method === "PATCH") {
      return {
        type: "project_approval",
        description: `Admin approved project: ${body.projectId}`,
        resourceType: "project",
        resourceId: body.projectId,
      };
    }

    if (path.includes("/reject-project") && method === "PATCH") {
      return {
        type: "project_rejection",
        description: `Admin rejected project: ${body.projectId}`,
        resourceType: "project",
        resourceId: body.projectId,
      };
    }

    // Don't log data fetching endpoints like pending-students, pending-projects, etc.
    if (
      method === "GET" &&
      (path.includes("/pending-") ||
        path.includes("/stats") ||
        path.includes("/statistics"))
    ) {
      return null;
    }
  }

  // Authentication Actions - Only log successful logins
  if (path.includes("/login") && method === "POST" && res.statusCode === 200) {
    return {
      type: `${user.role}_login`,
      description: `${user.firstName} logged in`,
      resourceType: "user",
      resourceId: user.id,
    };
  }

  // Logout actions
  if (path.includes("/logout") && method === "POST") {
    return {
      type: `${user.role}_logout`,
      description: `${user.firstName} logged out`,
      resourceType: "user",
      resourceId: user.id,
    };
  }

  return null;
}

// Rest of the functions remain the same...
function shouldLogBody(method) {
  return ["POST", "PUT", "PATCH"].includes(method);
}

function shouldLogResponse(actionType) {
  return [
    "project_submission",
    "student_approval",
    "project_approval",
  ].includes(actionType);
}

function sanitizeBody(body) {
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  return sanitized;
}

function sanitizeResponse(response) {
  if (typeof response === "string") {
    try {
      response = JSON.parse(response);
    } catch (e) {
      return response.substring(0, 200);
    }
  }

  if (typeof response === "object") {
    const sanitized = { ...response };
    delete sanitized.token;
    delete sanitized.password;
    return sanitized;
  }

  return response;
}

module.exports = activityLogger;
