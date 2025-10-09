// src/common/SummaryApi.js
const backendDomain = "http://localhost:8000";

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

  // Student profile endpoints - FIXED: Remove duplicate getProfile
  saveProfile: {
    url: `${backendDomain}/api/student/save-profile`,
    method: "post",
  },
  getStudentProfile: {
    // Make sure this matches what you're using
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

  // Add these new admin statistics endpoints
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
};

export default SummaryApi;
