// Enhanced AdminDashboard.js with beautiful UI
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi from "../common/summaryApi";
import { LogoutDialog } from "../components/logout";
import DeleteConfirmationDialog from "../components/deleteConfirmDialog";
import ProjectViewDialog from "../components/projectDialog";
import StudentViewDialog from "../components/studentViewDialog";
import {
  AiFillEye,
  AiFillCheckCircle,
  AiFillCloseCircle,
  AiFillDelete,
} from "react-icons/ai";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [pendingProjects, setPendingProjects] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [rejectedProjects, setRejectedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  // Add these state variables with your existing states
  const [allStudents, setAllStudents] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalStudents: 0,
  });

  // Add this projectStats state - you're missing this
  const [projectStats, setProjectStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalProjects: 0,
  });
  const [user, setUser] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [adminData, setAdminData] = useState(null);
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === selectedProject.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedProject.images.length - 1 : prevIndex - 1
    );
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showProjectModal || !selectedProject) return;

      if (e.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "Escape") {
        setShowProjectModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showProjectModal, selectedProject, currentImageIndex]);
  // Reset image index when modal opens/closes or when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProject, showProjectModal]);

  useEffect(() => {
    loadAdminData();
    loadPendingStudents();
    loadDashboardStats();
    loadPendingProjects();
    loadProjectStats();
  }, []);

  // Update the useEffect for tab-based loading
  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalytics();
      loadActivityFeed();
    } else if (activeTab === "students-list") {
      loadAllStudents();
    } else if (activeTab === "projects-list") {
      loadAllProjects();
    }
  }, [activeTab]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = getAuthToken();

    if (!userData || !token || userData.role !== "admin") {
      window.location.href = "/";
      return;
    }

    setUser(userData);
    // Load your admin data here
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // In your AdminDashboard component, replace the delete functions with these:

  const deleteStudent = async (studentId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${SummaryApi.deleteStudent.url}/${studentId}`,
        {
          method: SummaryApi.deleteStudent.method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Student deleted successfully!");
        // Refresh the lists
        loadAllStudents();
        loadPendingStudents();
        loadDashboardStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Delete student error:", error);
      toast.error("Failed to delete student");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${SummaryApi.deleteProject.url}/${projectId}`,
        {
          method: SummaryApi.deleteProject.method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Project deleted successfully!");
        // Refresh the lists
        loadAllProjects();
        loadPendingProjects();
        loadProjectStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Delete project error:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    if (deleteType === "student") {
      await deleteStudent(itemToDelete._id);
    } else if (deleteType === "project") {
      await deleteProject(itemToDelete._id);
    }

    setShowDeleteDialog(false);
    setItemToDelete(null);
    setDeleteType("");
  };

  // Fetch admin user data
  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.getMe.url, {
        method: SummaryApi.getMe.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAdminData(data.data.user);
      } else {
        throw new Error(data.message || "Failed to load admin data");
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin information");
    }
  };

  const loadPendingStudents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:8000/api/admin/pending-students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setPendingStudents(data.data.students);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load pending students");
    }
  };

  // Add this useEffect to auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // In your AdminDashboard.js - Update the loadDashboardStats function
  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.getStudentStatistics.url, {
        method: SummaryApi.getStudentStatistics.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats({
          totalPending: data.data.statistics.totalPending,
          totalApproved: data.data.statistics.totalApproved,
          totalStudents: data.data.statistics.totalStudents,
        });
        console.log("📊 Real statistics loaded:", data.data.statistics);
      } else {
        throw new Error(data.message || "Failed to load statistics");
      }
    } catch (error) {
      console.error("❌ Error loading statistics:", error);
      toast.error("Failed to load dashboard statistics");

      // Fallback to current pending students count
      setStats({
        totalPending: pendingStudents.length,
        totalApproved: 0, // You might want to keep a fallback
        totalStudents: pendingStudents.length,
      });
    }
  };

  const approveStudent = async (studentId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8000/api/admin/approve-student/${studentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Student approved successfully!");
        loadPendingStudents();
        loadDashboardStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("❌ Failed to approve student");
    } finally {
      setIsLoading(false);
    }
  };

  const bulkApproveAll = async () => {
    if (pendingStudents.length === 0) {
      toast.info("No pending students to approve");
      return;
    }

    setIsLoading(true);
    try {
      // This would be your bulk approval endpoint
      for (const student of pendingStudents) {
        await approveStudent(student._id);
      }
      toast.success(`✅ Approved ${pendingStudents.length} students!`);
    } catch (error) {
      toast.error("❌ Failed to bulk approve students");
    } finally {
      setIsLoading(false);
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      "fashion-design": "from-pink-500 to-rose-500",
      "textile-design": "from-purple-500 to-indigo-500",
      "fashion-merchandising": "from-blue-500 to-cyan-500",
      default: "from-gray-500 to-gray-700",
    };
    return colors[department] || colors.default;
  };

  // Get admin initials for avatar
  const getAdminInitials = () => {
    if (!adminData) return "A";
    return (
      `${adminData.firstName?.[0] || ""}${adminData.lastName?.[0] || ""}` || "A"
    );
  };

  // Get admin display name
  const getAdminDisplayName = () => {
    if (!adminData) return "Admin";
    return (
      `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim() ||
      "Administrator"
    );
  };

  // Add these functions to load projects
  const loadPendingProjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.getPendingProjects.url, {
        method: SummaryApi.getPendingProjects.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPendingProjects(data.data.projects || []);
      }
    } catch (error) {
      console.error("Error loading pending projects:", error);
      toast.error("Failed to load pending projects");
    }
  };

  const loadProjectStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.getProjectStatistics.url, {
        method: SummaryApi.getProjectStatistics.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setProjectStats(data.data.statistics); // This should now work
      }
    } catch (error) {
      console.error("Error loading project stats:", error);
    }
  };
  const approveProject = async (projectId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.approveProject.url, {
        method: SummaryApi.approveProject.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Project approved successfully!");
        loadPendingProjects();
        loadProjectStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("Failed to approve project");
    }
  };

  const rejectProject = async (projectId, reason) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.rejectProject.url, {
        method: SummaryApi.rejectProject.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, reason }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Project rejected successfully!");
        loadPendingProjects();
        loadProjectStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("Failed to reject project");
    }
  };

  // Add these functions with your existing load functions
  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.getPlatformAnalytics.url, {
        method: SummaryApi.getPlatformAnalytics.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        throw new Error(data.message || "Failed to load analytics");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const loadActivityFeed = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(SummaryApi.getActivityFeed.url, {
        method: SummaryApi.getActivityFeed.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setActivityFeed(data.data.activities || []);
      } else {
        throw new Error(data.message || "Failed to load activity feed");
      }
    } catch (error) {
      console.error("Error loading activity feed:", error);
      toast.error("Failed to load activity feed");
    }
  };

  // Update the refresh button to only refresh current tab data
  // Update the refresh function
  const handleRefresh = () => {
    if (activeTab === "students") {
      loadPendingStudents();
      loadDashboardStats();
    } else if (activeTab === "projects") {
      loadPendingProjects();
      loadProjectStats();
    } else if (activeTab === "analytics") {
      loadAnalytics();
      loadActivityFeed();
    } else if (activeTab === "students-list") {
      loadAllStudents();
    } else if (activeTab === "projects-list") {
      loadAllProjects();
    }
    toast.success("Data refreshed!");
  };

  // Updated loadAllStudents function
  const loadAllStudents = async () => {
    try {
      setStudentsLoading(true);
      const token = localStorage.getItem("authToken");

      // Add minimum loading time (1.5 seconds)
      const [response] = await Promise.all([
        fetch(SummaryApi.getAllStudents.url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        delay(1500), // Minimum 1.5 seconds loading
      ]);

      const data = await response.json();
      if (data.success) {
        setAllStudents(data.data.students || []);
      } else {
        throw new Error(data.message || "Failed to load students");
      }
    } catch (error) {
      console.error("Error loading all students:", error);
      toast.error("Failed to load students list");
    } finally {
      setStudentsLoading(false);
    }
  };

  // Updated loadAllProjects function
  const loadAllProjects = async () => {
    try {
      setProjectsLoading(true);
      const token = localStorage.getItem("authToken");

      // Add minimum loading time (1.5 seconds)
      const [response] = await Promise.all([
        fetch(SummaryApi.getAllProjects.url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        delay(1500), // Minimum 1.5 seconds loading
      ]);

      const data = await response.json();
      if (data.success) {
        setAllProjects(data.data.projects || []);
      } else {
        throw new Error(data.message || "Failed to load projects");
      }
    } catch (error) {
      console.error("Error loading all projects:", error);
      toast.error("Failed to load projects list");
    } finally {
      setProjectsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteType === "student" ? "Student" : "Project"}`}
        itemType={deleteType}
        itemName={
          deleteType === "student"
            ? `${itemToDelete?.firstName} ${itemToDelete?.lastName} (${itemToDelete?.studentId})`
            : itemToDelete?.title
        }
        message={
          deleteType === "student"
            ? "This student account and all associated data will be permanently deleted. This action cannot be undone."
            : "This project will be permanently deleted. This action cannot be undone."
        }
      />
      <StudentViewDialog
        student={selectedStudent}
        isOpen={showStudentDialog}
        onClose={() => setShowStudentDialog(false)}
        onApprove={approveStudent}
        onDelete={deleteStudent}
      />
      <ProjectViewDialog
        project={selectedProject}
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onApprove={approveProject}
        onReject={rejectProject}
        onDelete={deleteProject}
      />

      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 border-gray-200/60 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                    Admin Portal
                  </span>
                  <span className="text-xs text-gray-500 block -mt-1">
                    FashionFlux KTU
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Profile Section - UPDATED */}
            <div className="flex items-center space-x-4">
              {adminData ? (
                <div className="flex items-center space-x-3 bg-white/60 rounded-lg px-4 py-2 border border-gray-200/60">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getAdminInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getAdminDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {adminData.role === "admin" ? "Administrator" : "User"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-white/60 rounded-lg px-4 py-2 border border-gray-200/60">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Loading...
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              )}
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold hover:scale-105 transform flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 mb-8 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {adminData ? adminData.firstName : "Admin"}!
              </h1>
              <p className="text-gray-600 mt-3 text-lg max-w-2xl">
                Manage student accounts, review submissions, and oversee the
                FashionFlux platform
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center">
                <p className="text-sm opacity-90">
                  {adminData
                    ? `Logged in as ${adminData.role}`
                    : "Active Session"}
                </p>
                <p className="font-bold text-xl">
                  {adminData ? getAdminDisplayName() : "Administrator"}
                </p>
                <p className="text-xs opacity-80 mt-1">FashionFlux KTU</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Overview */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Approval Card */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold mt-2">{stats.totalPending}</p>
                <p className="text-amber-200 text-xs mt-1">Awaiting review</p>
              </div>
              <div className="text-3xl bg-white/20 p-3 rounded-2xl">⏳</div>
            </div>
            {stats.totalPending > 0 && (
              <div className="mt-4 bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{
                    width: `${
                      (stats.totalPending / stats.totalStudents) * 100
                    }%`,
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Approved Students Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Approved Students
                </p>
                <p className="text-3xl font-bold mt-2">{stats.totalApproved}</p>
                <p className="text-green-200 text-xs mt-1">
                  Active on platform
                </p>
              </div>
              <div className="text-3xl bg-white/20 p-3 rounded-2xl">✅</div>
            </div>
            {stats.totalApproved > 0 && (
              <div className="mt-4 bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{
                    width: `${
                      (stats.totalApproved / stats.totalStudents) * 100
                    }%`,
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Total Students Card */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Students
                </p>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                <p className="text-blue-200 text-xs mt-1">
                  All registered students
                </p>
              </div>
              <div className="text-3xl bg-white/20 p-3 rounded-2xl">👥</div>
            </div>
            <div className="mt-4 flex space-x-1">
              <div
                className="bg-green-400 rounded-full h-2 flex-1 transition-all duration-1000"
                style={{
                  width: `${
                    (stats.totalApproved / stats.totalStudents) * 100
                  }%`,
                }}
              ></div>
              <div
                className="bg-amber-400 rounded-full h-2 flex-1 transition-all duration-1000"
                style={{
                  width: `${(stats.totalPending / stats.totalStudents) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        {/* Tabs Navigation */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg mb-8 border border-white/60 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "students", name: "👥 Pending Approvals", icon: "👥" },
                { id: "projects", name: "🎨 Pending Reviews", icon: "🎨" },
                { id: "students-list", name: "📋 All Students", icon: "📋" },
                { id: "projects-list", name: "📊 All Projects", icon: "📊" },
                { id: "analytics", name: "📈 Analytics", icon: "📈" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-semibold text-sm transition-all duration-300 group ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 bg-purple-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "students" && (
              <div>
                {/* Header with Bulk Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Student Account Approvals
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Review and approve student registration requests
                    </p>
                  </div>
                  {pendingStudents.length > 0 && (
                    <button
                      onClick={bulkApproveAll}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>✅</span>
                          <span>Approve All ({pendingStudents.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Students Grid */}
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-8xl mb-6">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      All Caught Up!
                    </h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                      No pending student approvals at the moment. Check back
                      later for new registration requests.
                    </p>
                    <div className="text-sm text-gray-500">
                      Students will appear here as they register
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingStudents.map((student) => (
                      <div
                        key={student._id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-purple-200 group"
                      >
                        <div className="p-6">
                          {/* Student Header */}
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {student.firstName?.[0]}
                              {student.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {student.firstName} {student.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          {/* Student Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 font-medium">
                                Student ID:
                              </span>
                              <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                {student.studentId}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 font-medium">
                                Department:
                              </span>
                              <span
                                className={`font-semibold text-white px-2 py-1 rounded bg-gradient-to-r ${getDepartmentColor(
                                  student.department
                                )}`}
                              >
                                {student.department}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 font-medium">
                                Status:
                              </span>
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">
                                ⏳ Pending Approval
                              </span>
                            </div>
                          </div>

                          {/* Registration Date */}
                          <div className="text-xs text-gray-500 border-t border-gray-100 pt-4">
                            Registered on{" "}
                            {new Date(student.createdAt).toLocaleDateString()}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => approveStudent(student._id)}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center space-x-2"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span>✅</span>
                                <span>Approve Student</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "projects" && (
              <div>
                {/* Project Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  {/* Pending Review Card */}{" "}
                  {/* <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                   */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {/* Badge with number */}
                      <div className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg z-10 ring-4 ring-orange-400">
                        {projectStats.totalPending}
                      </div>
                      {/* Circular container for emoji */}
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 text-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl shadow-inner">
                        ⏳
                      </div>
                    </div>
                    <p className="text-amber-600 text-sm font-semibold tracking-wide uppercase">
                      Pending Review
                    </p>
                  </div>
                  {/* Approved Card */}
                  {/* <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"> */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {/* Badge with number */}
                      <div className="absolute -top-2 -right-2 bg-white text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg z-10 ring-4 ring-emerald-400">
                        {projectStats.totalApproved}
                      </div>
                      {/* Circular container for emoji */}
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl shadow-inner">
                        ✅
                      </div>
                    </div>
                    <p className="text-green-600 text-sm font-semibold tracking-wide uppercase">
                      Approved
                    </p>
                  </div>
                  {/* Rejected Card */}
                  {/* <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"> */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {/* Badge with number */}
                      <div className="absolute -top-2 -right-2 bg-white text-rose-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg z-10 ring-4 ring-rose-400">
                        {projectStats.totalRejected}
                      </div>
                      {/* Circular container for emoji */}
                      <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl shadow-inner">
                        ❌
                      </div>
                    </div>
                    <p className="text-rose-600 text-sm font-semibold tracking-wide uppercase">
                      Rejected
                    </p>
                  </div>
                  {/* Total Projects Card */}
                  {/* <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"> */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {/* Badge with number */}
                      <div className="absolute -top-2 -right-2 bg-white text-cyan-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg z-10 ring-4 ring-cyan-400">
                        {projectStats.totalProjects}
                      </div>
                      {/* Circular container for emoji */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl shadow-inner">
                        🎨
                      </div>
                    </div>
                    <p className="text-blue-600 text-sm font-semibold tracking-wide uppercase">
                      Total Projects
                    </p>
                  </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Project Submissions Review
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Review and approve student project submissions
                    </p>
                  </div>
                </div>

                {/* Projects Grid */}
                {pendingProjects.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-8xl mb-6">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      All Projects Reviewed!
                    </h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                      No pending project submissions at the moment. Check back
                      later for new creative work from students.
                    </p>
                    <div className="text-sm text-gray-500">
                      Projects will appear here as students submit them
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingProjects.map((project) => (
                      <div
                        key={project._id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-purple-200 group"
                      >
                        {/* Project Image */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl overflow-hidden">
                          {project.images.length > 0 ? (
                            <img
                              src={project.images[0].url}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-4xl text-gray-300">🎨</div>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ⏳ Pending
                          </div>
                          {project.images.length > 1 && (
                            <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                              📸 {project.images.length}
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          {/* Project Header */}
                          <div className="mb-4">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">
                              {project.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                                {project.category}
                              </span>
                              <span className="text-gray-500">
                                {new Date(
                                  project.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Student Info */}
                          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {project.student.firstName?.[0]}
                              {project.student.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {project.student.firstName}{" "}
                                {project.student.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {project.student.studentId} •{" "}
                                {project.student.department}
                              </p>
                            </div>
                          </div>

                          {/* Project Description */}
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {project.description}
                          </p>

                          {/* Materials & Inspiration */}
                          {(project.materials || project.inspiration) && (
                            <div className="space-y-2 mb-4 text-xs text-gray-500">
                              {project.materials && (
                                <div className="flex items-center space-x-2">
                                  <span>🧵</span>
                                  <span className="line-clamp-1">
                                    {project.materials}
                                  </span>
                                </div>
                              )}
                              {project.inspiration && (
                                <div className="flex items-center space-x-2">
                                  <span>💫</span>
                                  <span className="line-clamp-1">
                                    {project.inspiration}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setShowProjectModal(true);
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm flex items-center justify-center space-x-2"
                            >
                              <span>👁️</span>
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => approveProject(project._id)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-sm flex items-center justify-center space-x-2"
                            >
                              <span>✅</span>
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Project Detail Modal */}
                {showProjectModal && selectedProject && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedProject.title}
                          </h3>
                          <button
                            onClick={() => setShowProjectModal(false)}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                          >
                            ×
                          </button>
                        </div>

                        {/* Image Carousel */}
                        {selectedProject.images.length > 0 && (
                          <div className="relative mb-6">
                            {/* Main Image */}
                            <div className="relative h-80 bg-gray-100 rounded-2xl overflow-hidden">
                              {selectedProject.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image.url}
                                  alt={`${selectedProject.title} - Image ${
                                    index + 1
                                  }`}
                                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                                    currentImageIndex === index
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Navigation Arrows - Only show if multiple images */}
                            {selectedProject.images.length > 1 && (
                              <>
                                {/* Previous Button */}
                                <button
                                  onClick={goToPreviousImage}
                                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 19l-7-7 7-7"
                                    />
                                  </svg>
                                </button>

                                {/* Next Button */}
                                <button
                                  onClick={goToNextImage}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}

                            {/* Image Counter */}
                            {selectedProject.images.length > 1 && (
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                {currentImageIndex + 1} /{" "}
                                {selectedProject.images.length}
                              </div>
                            )}

                            {/* Thumbnail Navigation */}
                            {selectedProject.images.length > 1 && (
                              <div className="flex justify-center space-x-2 mt-4">
                                {selectedProject.images.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                      currentImageIndex === index
                                        ? "bg-purple-600 scale-125"
                                        : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Project Details */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">
                              Description
                            </label>
                            <p className="text-gray-600 mt-1">
                              {selectedProject.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Category
                              </label>
                              <p className="text-gray-600 mt-1">
                                {selectedProject.category}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Student
                              </label>
                              <p className="text-gray-600 mt-1">
                                {selectedProject.student.firstName}{" "}
                                {selectedProject.student.lastName}
                              </p>
                            </div>
                          </div>

                          {selectedProject.materials && (
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Materials Used
                              </label>
                              <p className="text-gray-600 mt-1">
                                {selectedProject.materials}
                              </p>
                            </div>
                          )}

                          {selectedProject.inspiration && (
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Design Inspiration
                              </label>
                              <p className="text-gray-600 mt-1">
                                {selectedProject.inspiration}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setShowProjectModal(false);
                              rejectProject(
                                selectedProject._id,
                                "Does not meet guidelines"
                              );
                            }}
                            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                          >
                            ❌ Reject Project
                          </button>
                          <button
                            onClick={() => {
                              setShowProjectModal(false);
                              approveProject(selectedProject._id);
                            }}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                          >
                            ✅ Approve Project
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* Analytics Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Platform Analytics
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Comprehensive insights into platform usage and performance
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Analytics Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Total Users Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Total Users
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {analyticsData?.overview?.totalUsers || 0}
                        </p>
                      </div>
                      <div className="text-3xl">👥</div>
                    </div>
                  </div>

                  {/* Total Projects Card */}
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Total Projects
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {analyticsData?.overview?.totalProjects || 0}
                        </p>
                      </div>
                      <div className="text-3xl">🎨</div>
                    </div>
                  </div>

                  {/* Active Today Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          Active Today
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {analyticsData?.overview?.activeToday || 0}
                        </p>
                      </div>
                      <div className="text-3xl">🔥</div>
                    </div>
                  </div>

                  {/* Approval Rate Card */}
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          Approval Rate
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {analyticsData?.overview?.approvalRate || 0}%
                        </p>
                      </div>
                      <div className="text-3xl">📈</div>
                    </div>
                  </div>
                </div>

                {/* Charts and Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Feed */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {activityFeed.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No recent activity
                        </div>
                      ) : (
                        activityFeed.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {activity.user?.firstName?.[0] || "U"}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.user?.firstName}{" "}
                                {activity.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Department Statistics */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Department Distribution
                    </h3>
                    <div className="space-y-3">
                      {analyticsData?.departmentStats?.length > 0 ? (
                        analyticsData.departmentStats.map((dept, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">
                                {dept._id}
                              </span>
                              <span className="text-gray-600">
                                {dept.totalStudents} students
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (dept.totalStudents /
                                      Math.max(
                                        ...analyticsData.departmentStats.map(
                                          (d) => d.totalStudents
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No department data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Students List Tab */}
            {activeTab === "students-list" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      All Students
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Complete list of all registered students with their status
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentsLoading ? (
                          // Enhanced loading state with skeleton rows
                          <>
                            {[...Array(2)].map((_, index) => (
                              <tr key={index} className="animate-pulse">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                    <div>
                                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                                </td>
                              </tr>
                            ))}
                            {/* Loading indicator row */}
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  <div className="text-md font-semibold text-gray-700">
                                    Loading Students...
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Please wait while we fetch the student data
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        ) : allStudents.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="text-6xl">👥</div>
                                <div className="text-lg font-semibold text-gray-900">
                                  No Students Found
                                </div>
                                <div className="text-gray-600 max-w-md">
                                  There are no students registered in the system
                                  yet. Students will appear here once they sign
                                  up.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          allStudents.map((student) => (
                            <tr
                              key={student._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                    {student.firstName?.[0]}
                                    {student.lastName?.[0]}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.firstName} {student.lastName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">
                                  {student.studentId}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(
                                    student.department
                                  )} text-white`}
                                >
                                  {student.department}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    student.isApproved
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {student.isApproved
                                    ? "✅ Approved"
                                    : "⏳ Pending"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  student.createdAt
                                ).toLocaleDateString()}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setShowStudentDialog(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                                  title="View Project"
                                >
                                  <AiFillEye size={20} />
                                </button>
                                {!student.isApproved && (
                                  <button
                                    onClick={() => approveStudent(student._id)}
                                    className="text-green-600 hover:text-green-900 font-semibold"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteClick(student, "student")
                                  }
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                  title="Delete Project"
                                >
                                  <AiFillDelete size={20} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {studentsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allStudents.length
                      )}
                    </div>
                    <div className="text-sm text-blue-800">Total Students</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {studentsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allStudents.filter((s) => s.isApproved).length
                      )}
                    </div>
                    <div className="text-sm text-green-800">
                      Approved Students
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-amber-600">
                      {studentsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allStudents.filter((s) => !s.isApproved).length
                      )}
                    </div>
                    <div className="text-sm text-amber-800">
                      Pending Approval
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Projects List Tab */}
            {activeTab === "projects-list" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      All Projects
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Complete list of all submitted projects with their review
                      status
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reviewed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projectsLoading ? (
                          // Enhanced loading state with skeleton rows
                          <>
                            {[...Array(2)].map((_, index) => (
                              <tr key={index} className="animate-pulse">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3"></div>
                                    <div className="flex-1">
                                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                                </td>
                              </tr>
                            ))}
                            {/* Loading indicator row */}
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  <div className="text-md font-semibold text-gray-700">
                                    Loading Projects...
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Please wait while we fetch the project data
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        ) : allProjects.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-10 text-center">
                              <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
                                <span className="text-5xl">📂</span>
                                <p className="text-lg font-semibold text-gray-700">
                                  No Projects Found
                                </p>
                                <p className="text-sm text-gray-500">
                                  There are currently no submitted projects.
                                </p>
                                <button
                                  onClick={handleRefresh}
                                  className="mt-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                                >
                                  Refresh
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          allProjects.map((project) => (
                            <tr
                              key={project._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {project.images.length > 0 ? (
                                    <img
                                      src={project.images[0].url}
                                      alt={project.title}
                                      className="w-12 h-12 rounded-lg object-cover mr-3"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                      <span className="text-gray-400">🎨</span>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                      {project.title}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                                      {project.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {project.student?.firstName}{" "}
                                  {project.student?.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {project.student?.studentId}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                  {project.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    project.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : project.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {project.status === "approved"
                                    ? "✅ Approved"
                                    : project.status === "rejected"
                                    ? "❌ Rejected"
                                    : "⏳ Pending"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  project.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.reviewedAt
                                  ? new Date(
                                      project.reviewedAt
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowProjectModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                                  title="View Project"
                                >
                                  <AiFillEye size={20} />
                                </button>
                                {project.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        approveProject(project._id)
                                      }
                                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition"
                                      title="Approve Project"
                                    >
                                      <AiFillCheckCircle size={20} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        rejectProject(
                                          project._id,
                                          "Does not meet guidelines"
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                      title="Reject Project"
                                    >
                                      <AiFillCloseCircle size={20} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteClick(project, "project")
                                  }
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                  title="Delete Project"
                                >
                                  <AiFillDelete size={20} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {projectsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allProjects.length
                      )}
                    </div>
                    <div className="text-sm text-blue-800">Total Projects</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {projectsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allProjects.filter((p) => p.status === "approved")
                          .length
                      )}
                    </div>
                    <div className="text-sm text-green-800">Approved</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-amber-600">
                      {projectsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allProjects.filter((p) => p.status === "pending").length
                      )}
                    </div>
                    <div className="text-sm text-amber-800">Pending</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {projectsLoading ? (
                        <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                      ) : (
                        allProjects.filter((p) => p.status === "rejected")
                          .length
                      )}
                    </div>
                    <div className="text-sm text-red-800">Rejected</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
