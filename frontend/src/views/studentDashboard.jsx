// src/pages/StudentDashboard.js
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi from "../common/summaryApi";
import { LogoutDialog } from "../components/logout";
import ProjectViewDialog from "../components/projectViewDialog";
import { FiLogOut } from "react-icons/fi";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: "",
    skills: "",
    specialization: "",
    contactEmail: "",
    portfolioUrl: "",
    socialLinks: {
      instagram: "",
      linkedin: "",
      behance: "",
    },
  });
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    materials: "",
    inspiration: "",
    images: [],
  });
  const [copiedLink, setCopiedLink] = useState("");

  // Add this function to handle copying links
  const copyToClipboard = (text, linkType) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(linkType);
      setTimeout(() => setCopiedLink(""), 2000);
    });
  };
  // Add this function to handle dropdown toggle
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Add this useEffect near other useEffect declarations
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest(".relative")) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = getAuthToken();

    if (!userData || !token || userData.role !== "student") {
      window.location.href = "/";
      return;
    }

    setUser(userData);
    loadStudentData();
  }, []);

  // Load student profile and projects
  const loadStudentData = async () => {
    await loadStudentProfile();
    await loadStudentProjects();
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialField = name.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProject.images.length > 10) {
      toast.error("Maximum 10 images allowed per project");
      return;
    }

    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setNewProject((prev) => ({
      ...prev,
      images: [...prev.images, ...imagePreviews],
    }));
  };

  const removeImage = (index) => {
    setNewProject((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Save profile to backend API
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch(SummaryApi.saveProfile.url, {
        method: SummaryApi.saveProfile.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      if (data.success) {
        toast.success("Profile created successfully!");
        setProfileData({
          bio: "",
          skills: "",
          specialization: "",
          contactEmail: "",
          portfolioUrl: "",
          socialLinks: {
            instagram: "",
            linkedin: "",
            behance: "",
          },
        });
      } else {
        throw new Error(data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit project to backend API
  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    if (
      !newProject.title ||
      !newProject.description ||
      !newProject.category ||
      newProject.images.length === 0
    ) {
      toast.error(
        "Please fill all required fields and upload at least one image"
      );
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();

      // Append project data
      formData.append("title", newProject.title);
      formData.append("description", newProject.description);
      formData.append("category", newProject.category);
      formData.append("materials", newProject.materials || "");
      formData.append("inspiration", newProject.inspiration || "");

      // Append images
      newProject.images.forEach((image) => {
        formData.append("images", image.file);
      });

      const response = await fetch(SummaryApi.createProject.url, {
        method: SummaryApi.createProject.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      if (data.success) {
        toast.success("Project submitted for approval!");
        setNewProject({
          title: "",
          description: "",
          category: "",
          materials: "",
          inspiration: "",
          images: [],
        });
        await loadStudentProjects();
        setActiveTab("projects");
      } else {
        throw new Error(data.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Project creation error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load student profile from API
  const loadStudentProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(SummaryApi.getStudentProfile.url, {
        method: SummaryApi.getStudentProfile.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.data.profile) {
        setProfileData({
          bio: data.data.profile.bio || "",
          skills: data.data.profile.skills || "",
          specialization: data.data.profile.specialization || "",
          contactEmail: data.data.profile.contactEmail || "",
          portfolioUrl: data.data.profile.portfolioUrl || "",
          socialLinks: {
            instagram: data.data.profile.socialLinks?.instagram || "",
            linkedin: data.data.profile.socialLinks?.linkedin || "",
            behance: data.data.profile.socialLinks?.behance || "",
          },
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  // Load student projects from API
  const loadStudentProjects = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(SummaryApi.getStudentProjects.url, {
        method: SummaryApi.getStudentProjects.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects || []);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
      toast.error("Logout failed");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        text: "⏳ Pending Review",
      },
      approved: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        text: "✅ Approved",
      },
      rejected: {
        color: "bg-rose-100 text-rose-800 border border-rose-200",
        text: "❌ Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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
        toastStyle={{
          backgroundColor: "white",
          color: "#374151",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        progressStyle={{
          background: "linear-gradient(to right, #8b5cf6, #7c3aed)",
        }}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      <ProjectViewDialog
        project={selectedProject}
        isOpen={showProjectDialog}
        onClose={() => {
          setShowProjectDialog(false);
          setSelectedProject(null);
        }}
      />

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* left side - Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                    FashionFlux
                  </span>
                  <span className="text-xs text-gray-500 block -mt-1">
                    KTU Portfolio
                  </span>
                </div>
              </div>
            </div>

            {/* right side - User profile and logout */}
            <div className="flex items-center space-x-4">
              {/* User profile dropdown */}
              <div className="relative">
                <div
                  className="flex items-center space-x-3 bg-white/60 rounded-lg px-4 py-2 border border-gray-200/60 cursor-pointer hover:bg-white/80 transition-all duration-200"
                  onClick={toggleProfileDropdown}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Welcome, {user.firstName}!
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showProfileDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {user.studentId}
                          </p>
                          <p className="text-white/70 text-sm">
                            {user.department || "Fashion Design"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Data */}
                    <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                      {profileData.bio && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Bio
                          </label>
                          <p className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-3">
                            {profileData.bio}
                          </p>
                        </div>
                      )}
                      {profileData.skills && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Skills
                          </label>
                          <p className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-3">
                            {profileData.skills}
                          </p>
                        </div>
                      )}
                      {profileData.specialization && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Specialization
                          </label>
                          <p className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-3">
                            {profileData.specialization}
                          </p>
                        </div>
                      )}
                      {profileData.contactEmail && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Contact Email
                          </label>
                          <p className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-3">
                            {profileData.contactEmail}
                          </p>
                        </div>
                      )}
                      {profileData.portfolioUrl && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Portfolio
                          </label>
                          <a
                            href={profileData.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-700 bg-gray-50/80 rounded-lg p-3 block break-all"
                          >
                            {profileData.portfolioUrl}
                          </a>
                        </div>
                      )}

                      {/* Social Links */}
                      {(profileData.socialLinks.instagram ||
                        profileData.socialLinks.linkedin ||
                        profileData.socialLinks.behance) && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Social Links
                          </label>
                          <div className="space-y-3 bg-gray-50/80 rounded-lg p-3">
                            {profileData.socialLinks.instagram && (
                              <div className="flex items-center justify-between group">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <span className="text-pink-500 flex-shrink-0">
                                    📷
                                  </span>
                                  <span
                                    className="text-sm text-gray-700 truncate"
                                    title={profileData.socialLinks.instagram}
                                  >
                                    {profileData.socialLinks.instagram}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      profileData.socialLinks.instagram,
                                      "instagram"
                                    )
                                  }
                                  className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 flex-shrink-0 group-hover:opacity-100 opacity-70"
                                  title="Copy link"
                                >
                                  {copiedLink === "instagram" ? (
                                    <svg
                                      className="w-4 h-4 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}

                            {profileData.socialLinks.linkedin && (
                              <div className="flex items-center justify-between group">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <span className="text-blue-600 flex-shrink-0">
                                    💼
                                  </span>
                                  <span
                                    className="text-sm text-gray-700 truncate"
                                    title={profileData.socialLinks.linkedin}
                                  >
                                    {profileData.socialLinks.linkedin}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      profileData.socialLinks.linkedin,
                                      "linkedin"
                                    )
                                  }
                                  className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 flex-shrink-0 group-hover:opacity-100 opacity-70"
                                  title="Copy link"
                                >
                                  {copiedLink === "linkedin" ? (
                                    <svg
                                      className="w-4 h-4 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}

                            {profileData.socialLinks.behance && (
                              <div className="flex items-center justify-between group">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <span className="text-blue-800 flex-shrink-0">
                                    🎨
                                  </span>
                                  <span
                                    className="text-sm text-gray-700 truncate"
                                    title={profileData.socialLinks.behance}
                                  >
                                    {profileData.socialLinks.behance}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      profileData.socialLinks.behance,
                                      "behance"
                                    )
                                  }
                                  className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 flex-shrink-0 group-hover:opacity-100 opacity-70"
                                  title="Copy link"
                                >
                                  {copiedLink === "behance" ? (
                                    <svg
                                      className="w-4 h-4 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Empty State */}
                      {!profileData.bio &&
                        !profileData.skills &&
                        !profileData.contactEmail &&
                        !profileData.portfolioUrl &&
                        !profileData.socialLinks.instagram &&
                        !profileData.socialLinks.linkedin &&
                        !profileData.socialLinks.behance && (
                          <div className="text-center py-6 text-gray-500">
                            <div className="text-4xl mb-2">👤</div>
                            <p className="text-sm">Profile not completed yet</p>
                            <button
                              onClick={() => {
                                setActiveTab("profile");
                                setShowProfileDropdown(false);
                              }}
                              className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-semibold"
                            >
                              Complete your profile →
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/60 p-4 bg-gray-50/50">
                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-sm hover:shadow-lg"
                      >
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout button */}

              <button
                onClick={() => setShowLogoutDialog(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold hover:scale-105 transform flex items-center space-x-2"
              >
                <FiLogOut className="w-4 h-4 text-white" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 mb-8 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                Creative Portfolio Hub
              </h1>
              <p className="text-gray-600 mt-3 text-lg max-w-2xl">
                Showcase your fashion journey, build your professional
                portfolio, and connect with the creative community
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center">
                <p className="text-sm opacity-90">Student ID</p>
                <p className="font-bold text-xl">{user.studentId}</p>
                <p className="text-xs opacity-80 mt-1">
                  {user.department || "Fashion Design"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl mb-8 border border-white/60 overflow-hidden">
          <div className="border-b border-gray-200/60">
            <nav className="flex -mb-px">
              {[
                { id: "profile", name: "👤 My Profile", icon: "👤" },
                { id: "upload", name: "🚀 Upload Project", icon: "🚀" },
                { id: "projects", name: "🎨 My Projects", icon: "🎨" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-5 px-6 text-center border-b-2 font-semibold text-sm transition-all duration-300 group ${
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
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-3">
                    Build Your Creative Profile
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Showcase your skills and connect with the fashion community
                  </p>
                </div>

                <form
                  onSubmit={handleProfileSubmit}
                  className="space-y-8 bg-white/60 rounded-2xl p-8 border border-gray-200/60 shadow-sm"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                            📝
                          </span>
                          Creative Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          rows="5"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="Share your fashion journey, inspirations, and creative philosophy..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                            🛠️
                          </span>
                          Skills & Specializations
                        </label>
                        <input
                          type="text"
                          name="skills"
                          value={profileData.skills}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="Pattern Making, Textile Design, Fashion Illustration..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                            📧
                          </span>
                          Contact Email
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={profileData.contactEmail}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="your.professional@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">
                            🌐
                          </span>
                          Portfolio Website
                        </label>
                        <input
                          type="url"
                          name="portfolioUrl"
                          value={profileData.portfolioUrl}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-3">
                            🔗
                          </span>
                          Social Profiles
                        </label>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-2 rounded-lg text-sm">
                              📷
                            </span>
                            <input
                              type="text"
                              name="social.instagram"
                              value={profileData.socialLinks.instagram}
                              onChange={handleProfileChange}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                              placeholder="@your_instagram"
                            />
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-lg text-sm">
                              💼
                            </span>
                            <input
                              type="text"
                              name="social.linkedin"
                              value={profileData.socialLinks.linkedin}
                              onChange={handleProfileChange}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                              placeholder="linkedin.com/in/yourprofile"
                            />
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 rounded-lg text-sm">
                              🎨
                            </span>
                            <input
                              type="text"
                              name="social.behance"
                              value={profileData.socialLinks.behance}
                              onChange={handleProfileChange}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                              placeholder="behance.net/yourprofile"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-purple-600 text-white px-12 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg disabled:opacity-50 hover:scale-105 transform"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving Profile...</span>
                        </div>
                      ) : (
                        "💾 Save Creative Profile"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Upload Project Tab */}
            {activeTab === "upload" && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-3">
                    Share Your Creative Work
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Upload your fashion projects and showcase your talent to the
                    world
                  </p>
                </div>

                <form
                  onSubmit={handleProjectSubmit}
                  className="space-y-8 bg-white/60 rounded-2xl p-8 border border-gray-200/60 shadow-sm"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                            🎯
                          </span>
                          Project Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={newProject.title}
                          onChange={handleProjectChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="Enter your creative project title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                            📂
                          </span>
                          Category *
                        </label>
                        <select
                          name="category"
                          value={newProject.category}
                          onChange={handleProjectChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        >
                          <option value="">Choose a category</option>
                          <option value="fashion-design">
                            👗 Fashion Design
                          </option>
                          <option value="textile-design">
                            🧵 Textile Design
                          </option>
                          <option value="accessories">💎 Accessories</option>
                          <option value="couture">👑 Couture</option>
                          <option value="sustainable-fashion">
                            🌿 Sustainable Fashion
                          </option>
                          <option value="traditional-wear">
                            🎎 Traditional Wear
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                            🧶
                          </span>
                          Materials Used
                        </label>
                        <input
                          type="text"
                          name="materials"
                          value={newProject.materials}
                          onChange={handleProjectChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="Cotton, Silk, Recycled materials..."
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">
                            💫
                          </span>
                          Design Inspiration
                        </label>
                        <textarea
                          name="inspiration"
                          value={newProject.inspiration}
                          onChange={handleProjectChange}
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          placeholder="Cultural influences, nature, architecture, etc..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-3">
                            🖼️
                          </span>
                          Upload Images * (Max 10)
                        </label>
                        <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white/50 hover:bg-white/70 transition-all duration-300 hover:border-purple-400 group">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold inline-block hover:scale-105 transform"
                          >
                            📁 Choose Project Images
                          </label>
                          <p className="text-sm text-gray-500 mt-4 group-hover:text-gray-700">
                            PNG, JPG, JPEG up to 10MB each • Showcase your best
                            work
                          </p>
                        </div>

                        {/* Image Previews */}
                        {newProject.images.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">
                              Selected Images ({newProject.images.length}/10)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {newProject.images.map((image, index) => (
                                <div
                                  key={`${image.name}-${index}-${image.size}`}
                                  className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                                >
                                  <img
                                    src={image.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 transform shadow-lg"
                                  >
                                    ×
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                    <p className="text-xs text-white truncate">
                                      {image.name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                        📖
                      </span>
                      Project Description *
                    </label>
                    <textarea
                      name="description"
                      value={newProject.description}
                      onChange={handleProjectChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="Describe your creative process, design philosophy, technical details, and what makes this project special..."
                    />
                  </div>

                  <div className="flex justify-center space-x-6 pt-6">
                    <button
                      type="button"
                      onClick={() =>
                        setNewProject({
                          title: "",
                          description: "",
                          category: "",
                          materials: "",
                          inspiration: "",
                          images: [],
                        })
                      }
                      className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold hover:scale-105 transform"
                    >
                      🔄 Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg disabled:opacity-50 hover:scale-105 transform"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Publishing Project...</span>
                        </div>
                      ) : (
                        "🚀 Submit for Review"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Projects Tab */}
            {activeTab === "projects" && (
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-4">
                    My Creative Portfolio
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Showcasing your fashion journey and creative achievements
                    through stunning visual storytelling
                  </p>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-20 bg-gradient-to-br from-white/80 to-purple-50/50 rounded-3xl border-2 border-dashed border-purple-200 shadow-sm">
                    <div className="text-8xl mb-6 animate-bounce">🎨</div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent mb-4">
                      Your Portfolio Awaits
                    </h3>
                    <p className="text-gray-600 text-xl mb-8 max-w-md mx-auto leading-relaxed">
                      Transform your creative vision into an impressive
                      portfolio that tells your unique fashion story
                    </p>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105 transform shadow-lg hover:shadow-purple-500/25"
                    >
                      ✨ Launch Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                      <div
                        key={project._id || project.id || `project-${index}`}
                        className="group cursor-pointer"
                      >
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 hover:scale-105 transform">
                          {/* Image Container */}
                          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                            {project.images.length > 0 ? (
                              <img
                                src={project.images[0].url}
                                alt={project.title}
                                className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                                <div className="text-6xl text-purple-300">
                                  🎨
                                </div>
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                              {getStatusBadge(project.status)}
                            </div>

                            {/* Image Count Badge */}
                            {project.images.length > 1 && (
                              <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                                📸 {project.images.length}
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Hover Actions */}
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowProjectDialog(true);
                                  }}
                                  className="flex-1 bg-white/90 backdrop-blur-sm text-gray-800 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-white transition-colors duration-200"
                                >
                                  👁️ View Details
                                </button>
                                <button className="bg-purple-600/90 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-purple-700 transition-colors duration-200">
                                  ❤️
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            {/* Title and Category */}
                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors duration-200">
                                {project.title}
                              </h3>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  {project.category}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm">
                              {project.description}
                            </p>

                            {/* Materials & Inspiration (if available) */}
                            {(project.materials || project.inspiration) && (
                              <div className="mb-4 space-y-2">
                                {project.materials && (
                                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                                    <span className="text-purple-500 mt-0.5">
                                      🧵
                                    </span>
                                    <span className="line-clamp-1">
                                      {project.materials}
                                    </span>
                                  </div>
                                )}
                                {project.inspiration && (
                                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                                    <span className="text-blue-500 mt-0.5">
                                      💫
                                    </span>
                                    <span className="line-clamp-1">
                                      {project.inspiration}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <span>📅</span>
                                  <span className="text-xs font-medium">
                                    {new Date(
                                      project.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 text-yellow-500">
                                {"★".repeat(3)}
                                <span className="text-gray-400 text-xs">★</span>
                                <span className="text-gray-400 text-xs">★</span>
                              </div>
                            </div>

                            {/* Progress Bar for Pending Projects */}
                            {project.status === "pending" && (
                              <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Under Review</span>
                                  <span>50%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-amber-500 h-1.5 rounded-full w-1/2 animate-pulse"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats Bar when projects exist */}
                {projects.length > 0 && (
                  <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {projects.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Projects
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {
                            projects.filter((p) => p.status === "approved")
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">Approved</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-600">
                          {
                            projects.filter((p) => p.status === "pending")
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">In Review</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {projects.reduce(
                            (total, project) =>
                              total + (project.images?.length || 0),
                            0
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Images
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
