// Enhanced AdminDashboard.js with beautiful UI
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi from "../common/summaryApi";

const AdminDashboard = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalStudents: 0,
  });

  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    loadAdminData();
    loadPendingStudents();
    loadDashboardStats();
  }, []);

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

      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                { id: "students", name: "👥 Student Approvals", icon: "👥" },
                { id: "projects", name: "🎨 Project Reviews", icon: "🎨" },
                { id: "analytics", name: "📊 Analytics", icon: "📊" },
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
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-8xl mb-6">🎨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Project Review System
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Project approval features coming soon! This is where you'll
                  review and approve student project submissions.
                </p>
                <div className="text-sm text-gray-500">Under Development</div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-8xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Platform Analytics
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Comprehensive analytics dashboard coming soon! Track platform
                  usage, student engagement, and performance metrics.
                </p>
                <div className="text-sm text-gray-500">Under Development</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
