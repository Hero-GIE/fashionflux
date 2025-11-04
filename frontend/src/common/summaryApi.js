// Automatically use localhost in development and production URL otherwise
const backendDomain =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://fashionflux-vwrw.vercel.app");

const SummaryApi = {
  studentSignUp: {
    url: `${backendDomain}/api/student/signup`,
    method: "post",
  },
  adminSignUp: {
    url: `${backendDomain}/api/admin/signup`,
    method: "post",
  },
  signIn: {
    url: `${backendDomain}/api/login`,
    method: "post",
  },
  getMe: {
    url: `${backendDomain}/api/me`,
    method: "get",
  },

  // Student profile endpoints
  saveProfile: {
    url: `${backendDomain}/api/student/save-profile`,
    method: "post",
  },
  getStudentProfile: {
    url: `${backendDomain}/api/student/get-student-profile`,
    method: "get",
  },

  // Project endpoints
  createProject: {
    url: `${backendDomain}/api/student/create-projects`,
    method: "post",
  },
  getStudentProjects: {
    url: `${backendDomain}/api/student/get-student-projects`,
    method: "get",
  },
  getProject: {
    url: `${backendDomain}/api/student/get-projects`,
    method: "get",
  },

  // Public Gallery Endpoints
  getPublicProjects: {
    url: `${backendDomain}/api/public/projects`,
    method: "GET",
  },
  getPublicProjectCategories: {
    url: `${backendDomain}/api/public/projects/categories`,
    method: "GET",
  },

  // Admin statistics endpoints
  getStudentStatistics: {
    url: `${backendDomain}/api/admin/statistics/students`,
    method: "GET",
  },
  getStudentAnalytics: {
    url: `${backendDomain}/api/admin/statistics/analytics`,
    method: "GET",
  },
  getPendingProjects: {
    url: `${backendDomain}/api/admin/pending-projects`,
    method: "GET",
  },
  getProjectStatistics: {
    url: `${backendDomain}/api/admin/project-stats`,
    method: "GET",
  },
  approveProject: {
    url: `${backendDomain}/api/admin/approve-project`,
    method: "PATCH",
  },
  rejectProject: {
    url: `${backendDomain}/api/admin/reject-project`,
    method: "PATCH",
  },

  // Dashboard analytics
  getPlatformAnalytics: {
    url: `${backendDomain}/api/admin/analytics/dashboard`,
    method: "GET",
  },
  getActivityFeed: {
    url: `${backendDomain}/api/admin/analytics/activity-feed`,
    method: "GET",
  },

  // Admin management endpoints
  getAllStudents: {
    url: `${backendDomain}/api/admin/all-students`,
    method: "GET",
  },
  getAllProjects: {
    url: `${backendDomain}/api/admin/all-projects`,
    method: "GET",
  },
  deleteStudent: {
    url: `${backendDomain}/api/admin/delete-student`,
    method: "delete",
  },
  deleteProject: {
    url: `${backendDomain}/api/admin/delete-project`,
    method: "delete",
  },
};

export default SummaryApi;
