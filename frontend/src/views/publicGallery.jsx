// src/pages/PublicGallery.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi from "../common/summaryApi";
import { FiLogIn } from "react-icons/fi";

const PublicGallery = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
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

  useEffect(() => {
    loadPublicProjects();
  }, [searchTerm, selectedCategory]);

  // const loadPublicProjects = async () => {
  //   try {
  //     setIsLoading(true);

  //     const params = new URLSearchParams();
  //     if (searchTerm) params.append("search", searchTerm);
  //     if (selectedCategory !== "all")
  //       params.append("category", selectedCategory);
  //     params.append("page", "1");
  //     params.append("limit", "50");

  //     const queryString = params.toString();
  //     const url = queryString
  //       ? `${SummaryApi.getPublicProjects.url}?${queryString}`
  //       : SummaryApi.getPublicProjects.url;

  //     const response = await fetch(url, {
  //       method: SummaryApi.getPublicProjects.method,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       setProjects(data.data.projects || []);
  //     } else {
  //       throw new Error(data.message || "Failed to load projects");
  //     }
  //   } catch (error) {
  //     console.error("Error loading public projects:", error);
  //     toast.error("Failed to load projects gallery");
  //     setProjects([]);
  //   } finally {
  //     setIsLoading(false);
  //     setIsInitialLoad(false);
  //   }
  // };

  const loadPublicProjects = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      params.append("page", "1");
      params.append("limit", "50");

      const queryString = params.toString();
      const backendUrl =
        "https://fashionflux-vwrw.vercel.app/api/public/projects";

      const url = queryString ? `${backendUrl}?${queryString}` : backendUrl;

      console.log("📡 Fetching public projects from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

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
      setIsInitialLoad(false);
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
    setIsImageZoomed(false);
  };

  const handleBackToLogin = () => {
    navigate("/login");
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

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsImageZoomed(true);
  };

  const handleZoomClose = (e) => {
    if (e.target === e.currentTarget) {
      setIsImageZoomed(false);
    }
  };

  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects-gallery");
    if (projectsSection) {
      projectsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        text: "⏳ Pending",
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
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const heroBackgroundImages = [
    "https://media.istockphoto.com/id/1735100420/photo/cozy-dressing-room-floor-hanger-with-womens-seasonal-autumn-winter-clothes-coats-pullovers.jpg?s=612x612&w=0&k=20&c=VtF75DgR1N6MfcwjLUZWo1JyfcS7QdtDbZQYcg2fTAE=",
    "https://media.istockphoto.com/id/2208803520/photo/young-woman-choosing-clothes-in-a-second-hand-shop-promoting-sustainable-fashion.jpg?s=612x612&w=0&k=20&c=xstd7XTW0BHBhZFuRaNjVDy5DusUHWrzJbNpy1fQN0E=",
    "https://media.istockphoto.com/id/2188460157/photo/fashion-designer-stylish-drawings-sketches-textile-fabric-material-costume-designer-creative.jpg?s=612x612&w=0&k=20&c=DBbvPzI7fMY5iif2sJew2eteBTfVJarMonWBLWTQttw=",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroBackgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close zoom on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isImageZoomed) {
        setIsImageZoomed(false);
      }
    };

    if (isImageZoomed) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isImageZoomed]);

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 absolute top-0"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg mt-6 animate-pulse">
            Loading creative gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {/* Zoomed Image Overlay */}
      {isImageZoomed && selectedProject && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-fadeIn"
          onClick={handleZoomClose}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110 group"
            >
              <svg
                className="w-8 h-8 text-white group-hover:text-gray-200 transition-colors"
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

            {/* Navigation buttons */}
            {selectedProject.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-2xl hover:scale-110 transition-all duration-300 group"
                >
                  <svg
                    className="w-8 h-8 text-gray-600 group-hover:text-purple-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-2xl hover:scale-110 transition-all duration-300 group"
                >
                  <svg
                    className="w-8 h-8 text-gray-600 group-hover:text-purple-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Zoomed image */}
            <img
              src={selectedProject.images[currentImageIndex].url}
              alt={selectedProject.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full text-lg font-semibold border border-white/20">
              📸 {currentImageIndex + 1} / {selectedProject.images.length}
            </div>

            {/* Zoom controls hint */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium border border-white/20 opacity-80">
              Click anywhere or press ESC to close
            </div>
          </div>
        </div>
      )}

      {/* Project Dialog */}
      {showProjectDialog && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-scaleIn border border-white/20">
            {/* Header */}
            <div className="bg-white p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-3 mb-1">
                    {getStatusBadge(selectedProject.status)}
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {categoryLabels[selectedProject.category]}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-gray-600 text-md">
                    {selectedProject.tagline || "Creative Fashion Design"}
                  </p>
                </div>
                <button
                  onClick={() => setShowProjectDialog(false)}
                  className="bg-gray-100 hover:bg-gray-200 rounded-2xl p-3 transition-all duration-300 hover:scale-110 hover:rotate-90 group"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-gray-700 transition-colors"
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

            <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
              {/* Image Gallery Section */}
              <div className="lg:w-1/2 p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100">
                  {selectedProject.images.length > 0 ? (
                    <>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <div
                          className="w-full h-full cursor-zoom-in"
                          onClick={handleImageClick}
                        >
                          <img
                            src={selectedProject.images[currentImageIndex].url}
                            alt={selectedProject.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                        {/* Zoom hint */}
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-semibold border border-white/20 flex items-center gap-2 pointer-events-none">
                          🔍 Click to zoom
                        </div>

                        {selectedProject.images.length > 1 && (
                          <>
                            {/* Navigation Buttons */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviousImage();
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl hover:bg-white hover:scale-110 transition-all duration-300 group"
                            >
                              <svg
                                className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage();
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl hover:bg-white hover:scale-110 transition-all duration-300 group"
                            >
                              <svg
                                className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 pointer-events-none">
                              📸 {currentImageIndex + 1} /{" "}
                              {selectedProject.images.length}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                      <div className="text-8xl mb-4 animate-float">🎨</div>
                      <p className="text-gray-600 font-medium">
                        No images available
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {selectedProject.images.length > 1 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-lg mr-2">🖼️</span>
                      Gallery ({selectedProject.images.length} images)
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedProject.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative rounded-2xl overflow-hidden border-3 transition-all duration-300 transform ${
                            index === currentImageIndex
                              ? "border-purple-500 ring-4 ring-purple-200 scale-105 shadow-lg"
                              : "border-gray-200 hover:border-purple-300 hover:scale-105 hover:shadow-md"
                          }`}
                        >
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-20 object-cover"
                          />
                          {index === currentImageIndex && (
                            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="lg:w-1/2 p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Project Description */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-2xl mr-4 text-2xl shadow-lg">
                        📖
                      </span>
                      Project Story
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Materials Used */}
                  {selectedProject.materials && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-2xl mr-4 text-2xl shadow-lg">
                          🧵
                        </span>
                        Materials & Techniques
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedProject.materials}
                      </p>
                    </div>
                  )}

                  {/* Design Inspiration */}
                  {selectedProject.inspiration && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-2xl mr-4 text-2xl shadow-lg">
                          ✨
                        </span>
                        Creative Inspiration
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedProject.inspiration}
                      </p>
                    </div>
                  )}

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-6 border border-purple-200 shadow-lg">
                    <div className="text-center">
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="text-2xl mb-2">🏷️</div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-1">
                          Category
                        </h4>
                        <p className="text-gray-900 font-bold text-lg">
                          {categoryLabels[selectedProject.category]}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="text-2xl mb-2">📅</div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-1">
                          Created
                        </h4>
                        <p className="text-gray-900 font-bold text-lg">
                          {new Date(
                            selectedProject.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Designer Information */}
                  {selectedProject.student && (
                    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg mr-3 text-xl">
                            👤
                          </span>
                          Designer Profile
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {/* Designer Header */}
                        <div className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-xl p-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-purple-200">
                            {selectedProject.student.firstName?.[0]}
                            {selectedProject.student.lastName?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-xl">
                              {selectedProject.student.firstName}{" "}
                              {selectedProject.student.lastName}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              Fashion Design Student
                            </p>
                          </div>
                        </div>

                        {/* Academic Details */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              Student ID
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedProject.student.studentId}
                            </p>
                          </div>
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              Course
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedProject.student.department}
                            </p>
                          </div>
                        </div>

                        {/* Contact Information */}
                        {selectedProject.student.email && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                              Email
                            </p>
                            <p className="text-sm font-medium text-purple-600 break-all">
                              {selectedProject.student.email}
                            </p>
                          </div>
                        )}

                        {/* Profile Details */}
                        {selectedProject.student.profile && (
                          <>
                            {selectedProject.student.profile.bio && (
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                  About Designer
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {selectedProject.student.profile.bio}
                                </p>
                              </div>
                            )}

                            {selectedProject.student.profile.specialization && (
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                  Specialization
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {
                                    selectedProject.student.profile
                                      .specialization
                                  }
                                </p>
                              </div>
                            )}

                            {selectedProject.student.profile.skills && (
                              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                  Skills & Expertise
                                </p>
                                <p className="text-sm text-gray-700">
                                  {selectedProject.student.profile.skills}
                                </p>
                              </div>
                            )}

                            {/* Social Links */}
                            {selectedProject.student.profile.socialLinks &&
                              Object.values(
                                selectedProject.student.profile.socialLinks
                              ).some((link) => link) && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                                  <p className="text-xs font-semibold text-gray-500 mb-2">
                                    Connect with Designer
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedProject.student.profile.socialLinks
                                      .instagram && (
                                      <a
                                        href={
                                          selectedProject.student.profile
                                            .socialLinks.instagram
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                                      >
                                        📸 Instagram
                                      </a>
                                    )}
                                    {selectedProject.student.profile.socialLinks
                                      .linkedin && (
                                      <a
                                        href={
                                          selectedProject.student.profile
                                            .socialLinks.linkedin
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                                      >
                                        💼 LinkedIn
                                      </a>
                                    )}
                                    {selectedProject.student.profile.socialLinks
                                      .behance && (
                                      <a
                                        href={
                                          selectedProject.student.profile
                                            .socialLinks.behance
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                                      >
                                        🎨 Behance
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                          </>
                        )}
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
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section - aligned to far left */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  FashionFlux
                </span>
                <span className="text-xs text-gray-500 block -mt-0.5">
                  KTU Creative Gallery
                </span>
              </div>
            </div>

            {/* Login Button - aligned to far right */}
            <div className="ml-auto">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                <FiLogIn className="text-lg" />

                <span>Login</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="relative text-white py-40 overflow-hidden"
        style={{ height: "700px" }}
      >
        {/* Background Images with Crossfade */}
        {heroBackgroundImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${image})`,
              opacity: index === heroImageIndex ? 1 : 0,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-purple-900/30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center h-full flex flex-col justify-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight animate-fadeIn">
            Creative Showcase
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light animate-fadeIn">
            Discover extraordinary fashion talent from KTU's brightest design
            students
          </p>
          <div className="flex flex-col items-center justify-center space-y-6 text-lg animate-fadeIn">
            <button
              onClick={scrollToProjects}
              className="flex items-center space-x-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full hover:bg-white/30 transition-all hover:scale-105 transform cursor-pointer"
            >
              <span className="font-semibold">Fashion Gallery</span>
            </button>

            {/* Scroll down indicator */}
            <div className="flex flex-col items-center mt-4 animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span className="text-sm text-white/70">Scroll To Gallery</span>
            </div>
          </div>

          {/* Image Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {heroBackgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setHeroImageIndex(index)}
                className={`transition-all duration-300 ${
                  index === heroImageIndex
                    ? "w-12 h-2 bg-white rounded-full"
                    : "w-2 h-2 bg-white/50 rounded-full hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects, designers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                  🔍
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform shadow-sm ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-4 flex items-center justify-between bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-gray-700 font-medium">
                🔎 Filtering: {searchTerm && `"${searchTerm}"`}
                {searchTerm && selectedCategory !== "all" && " in "}
                {selectedCategory !== "all" && categoryLabels[selectedCategory]}
              </div>
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Content Area - Fixed Height */}
        <div id="projects-gallery" className="min-h-[600px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/60 rounded-3xl border-2 border-dashed border-gray-300">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-purple-600 absolute top-0"></div>
              </div>
              <p className="text-gray-600 font-semibold text-lg animate-pulse">
                Loading projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/60 rounded-3xl border-2 border-dashed border-gray-300">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                No Projects Found
              </h3>
              <p className="text-gray-600 text-xl mb-8 max-w-md mx-auto text-center">
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
                    key={project._id || `project-${index}`}
                    onClick={() => handleViewProject(project)}
                    className="group cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-300 hover:scale-105 transform">
                      <div className="relative overflow-hidden">
                        {project.images.length > 0 ? (
                          <img
                            src={project.images[0].url}
                            alt={project.title}
                            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                            <div className="text-6xl animate-pulse">🎨</div>
                          </div>
                        )}

                        {project.images.length > 1 && (
                          <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                            📸 {project.images.length}
                          </div>
                        )}

                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          {categoryLabels[project.category].replace(
                            /[^\w\s]/g,
                            ""
                          )}
                        </div>

                        <div className="absolute bottom-4 left-4">
                          {getStatusBadge(project.status)}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                          <button className="w-full bg-white/95 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl text-sm font-bold hover:bg-white transition-colors shadow-lg">
                            👁️ View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 border border-purple-200 shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-4xl font-bold text-purple-600 mb-1">
                      {projects.length}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      Total Projects
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-4xl font-bold text-green-600 mb-1">
                      {new Set(projects.map((p) => p.student?._id)).size}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      Creative Designers
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {projects.reduce(
                        (total, project) =>
                          total + (project.images?.length || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      Total Images
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-4xl font-bold text-orange-600 mb-1">
                      {categories.length - 1}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      Categories
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold">FashionFlux</span>
          </div>
          <p className="text-gray-400 mb-2">
            KTU Fashion Design Portfolio Platform
          </p>
          <p className="text-gray-500 text-sm">
            Showcasing the next generation of fashion innovators
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #2563eb);
        }
      `}</style>
    </div>
  );
};

export default PublicGallery;
