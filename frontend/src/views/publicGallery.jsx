// src/pages/PublicGallery.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi from "../common/summaryApi";

const PublicGallery = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const categories = [
    "all",
    "fashion-design",
    "textile-design",
    "accessories",
    "couture",
    "sustainable-fashion",
    "traditional-wear",
  ];

  const categoryLabels = {
    all: "All Categories",
    "fashion-design": "👗 Fashion Design",
    "textile-design": "🧵 Textile Design",
    accessories: "💎 Accessories",
    couture: "👑 Couture",
    "sustainable-fashion": "🌿 Sustainable Fashion",
    "traditional-wear": "🎎 Traditional Wear",
  };

  // Load projects whenever search or category changes
  useEffect(() => {
    loadPublicProjects();
  }, [searchTerm, selectedCategory]);

  const loadPublicProjects = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      params.append("page", "1");
      params.append("limit", "50");

      const queryString = params.toString();
      const url = queryString
        ? `${SummaryApi.getPublicProjects.url}?${queryString}`
        : SummaryApi.getPublicProjects.url;

      console.log("🌐 Fetching from:", url);

      const response = await fetch(url, {
        method: SummaryApi.getPublicProjects.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log("📦 API Response:", data);

      if (data.success) {
        setProjects(data.data.projects || []);
      } else {
        throw new Error(data.message || "Failed to load projects");
      }
    } catch (error) {
      console.error("❌ Error loading public projects:", error);
      toast.error("Failed to load projects gallery");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProject.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedProject.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setShowProjectDialog(true);
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
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
        className={`px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">
            Loading creative gallery...
          </p>
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
      />

      {/* Project View Dialog */}
      {showProjectDialog && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedProject.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {categoryLabels[selectedProject.category]}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(selectedProject.status)}
                <button
                  onClick={() => setShowProjectDialog(false)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
              {/* Image Gallery */}
              <div className="lg:w-1/2 p-6 bg-gray-50">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
                  {selectedProject.images.length > 0 ? (
                    <>
                      <img
                        src={selectedProject.images[currentImageIndex].url}
                        alt={selectedProject.title}
                        className="w-full h-96 object-cover"
                      />

                      {/* Image Navigation */}
                      {selectedProject.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePreviousImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5 text-gray-700"
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
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5 text-gray-700"
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

                          {/* Image Counter */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                            {currentImageIndex + 1} /{" "}
                            {selectedProject.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="text-6xl text-purple-300">🎨</div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {selectedProject.images.length > 1 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProject.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex
                              ? "border-purple-500 ring-2 ring-purple-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                        📖
                      </span>
                      Project Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Materials */}
                  {selectedProject.materials && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                          🧵
                        </span>
                        Materials Used
                      </h3>
                      <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                        {selectedProject.materials}
                      </p>
                    </div>
                  )}

                  {/* Inspiration */}
                  {selectedProject.inspiration && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                          💫
                        </span>
                        Design Inspiration
                      </h3>
                      <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                        {selectedProject.inspiration}
                      </p>
                    </div>
                  )}

                  {/* Project Metadata */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">
                        Category
                      </h4>
                      <p className="text-gray-900 font-medium">
                        {categoryLabels[selectedProject.category]}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">
                        Created
                      </h4>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedProject.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">
                        Images
                      </h4>
                      <p className="text-gray-900 font-medium">
                        {selectedProject.images.length}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">
                        Status
                      </h4>
                      <div className="inline-block">
                        {getStatusBadge(selectedProject.status)}
                      </div>
                    </div>
                  </div>

                  {/* Student Info */}
                  {selectedProject.student && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        Designer Information
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {selectedProject.student.firstName?.[0]}
                          {selectedProject.student.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-lg">
                            {selectedProject.student.firstName}{" "}
                            {selectedProject.student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedProject.student.studentId} •{" "}
                            {selectedProject.student.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    FashionFlux
                  </span>
                  <span className="text-sm text-gray-500 block -mt-1">
                    KTU Creative Gallery
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={handleBackToLogin}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105 transform"
              >
                🎓 Student Portal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Creative Showcase
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover extraordinary fashion talent from KTU's brightest design
            students
          </p>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center space-x-2">
              <span>🎨</span>
              <span>{projects.length} Projects</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span>🌟</span>
              <span>Student Portfolio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-white/60">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects, designers, or keywords..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform ${
                    selectedCategory === category
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Show active filters */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing results for:
                {searchTerm && ` "${searchTerm}"`}
                {searchTerm && selectedCategory !== "all" && " in "}
                {selectedCategory !== "all" && categoryLabels[selectedCategory]}
              </div>
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-3xl border-2 border-dashed border-gray-300">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No Projects Found
            </h3>
            <p className="text-gray-600 text-xl mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "No projects available in the gallery yet"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105 transform"
              >
                🔄 Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {projects.map((project, index) => (
                <div
                  key={project._id || project.id || `project-${index}`}
                  className="group cursor-pointer"
                  onClick={() => handleViewProject(project)}
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 hover:scale-105 transform">
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {project.images.length > 0 ? (
                        <img
                          src={project.images[0].url}
                          alt={project.title}
                          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                          <div className="text-6xl text-purple-300">🎨</div>
                        </div>
                      )}

                      {/* Image Count Badge */}
                      {project.images.length > 1 && (
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                          📸 {project.images.length}
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                        {categoryLabels[project.category]}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(project.status)}
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Hover Action */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button className="w-full bg-white/90 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-white transition-colors duration-200">
                          👁️ View Project Details
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors duration-200">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 mt-2 line-clamp-2 leading-relaxed text-sm">
                          {project.description}
                        </p>
                      </div>

                      {/* Materials & Inspiration Preview */}
                      {(project.materials || project.inspiration) && (
                        <div className="mb-4 space-y-2">
                          {project.materials && (
                            <div className="flex items-start space-x-2 text-xs text-gray-500">
                              <span className="text-purple-500 mt-0.5">🧵</span>
                              <span className="line-clamp-1">
                                {project.materials}
                              </span>
                            </div>
                          )}
                          {project.inspiration && (
                            <div className="flex items-start space-x-2 text-xs text-gray-500">
                              <span className="text-blue-500 mt-0.5">💫</span>
                              <span className="line-clamp-1">
                                {project.inspiration}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Designer Info */}
                      {project.student && (
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {project.student.firstName?.[0]}
                            {project.student.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {project.student.firstName}{" "}
                              {project.student.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {project.student.department}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                        <span className="font-medium">
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          {"★".repeat(3)}
                          <span className="text-gray-400 text-xs">★</span>
                          <span className="text-gray-400 text-xs">★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {projects.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {new Set(projects.map((p) => p.student?._id)).size}
                  </div>
                  <div className="text-sm text-gray-600">
                    Creative Designers
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {projects.reduce(
                      (total, project) => total + (project.images?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Creations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {categories.length - 1}
                  </div>
                  <div className="text-sm text-gray-600">Design Categories</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold">FashionFlux</span>
          </div>
          <p className="text-gray-400 mb-4">
            KTU Fashion Design Portfolio Platform
          </p>
          <p className="text-gray-500 text-sm">
            Showcasing the next generation of fashion innovators
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicGallery;
