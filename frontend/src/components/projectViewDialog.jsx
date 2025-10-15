// src/components/ProjectViewDialog.js
import { useState, useEffect } from "react";

const ProjectViewDialog = ({ project, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Reset image index when modal opens or project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsImageZoomed(false);
  }, [project, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || !project) return;

      if (e.key === "ArrowLeft") {
        handlePreviousImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        if (isImageZoomed) {
          setIsImageZoomed(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, project, currentImageIndex, isImageZoomed]);

  // Handle body overflow when zoomed
  useEffect(() => {
    if (isImageZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isImageZoomed]);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === project.images.length - 1 ? 0 : prev + 1
    );
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

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
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

  const categoryLabels = {
    "fashion-design": "👗 Fashion Design",
    "textile-design": "🧵 Textile Design",
    accessories: "💎 Accessories",
    couture: "👑 Couture",
    "sustainable-fashion": "🌿 Sustainable Fashion",
    "traditional-wear": "🎎 Traditional Wear",
  };

  if (!isOpen || !project) return null;

  return (
    <>
      {/* Zoomed Image Overlay */}
      {isImageZoomed && project.images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-fadeIn"
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
            {project.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-2xl hover:scale-110 transition-all duration-300 group"
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
                    className="w-8 h-8 text-white group-hover:text-gray-200 transition-colors"
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
              src={project.images[currentImageIndex].url}
              alt={project.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full text-lg font-semibold border border-white/20">
              📸 {currentImageIndex + 1} / {project.images.length}
            </div>

            {/* Zoom controls hint */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium border border-white/20 opacity-80">
              Click anywhere or press ESC to close
            </div>
          </div>
        </div>
      )}

      {/* Main Project Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
        <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-scaleIn border border-white/20">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <div className="flex items-center gap-3 mb-1">
                  {getStatusBadge(project.status)}
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {categoryLabels[project.category] || project.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                  {project.title}
                </h2>
                <p className="text-gray-600 text-md">
                  {project.tagline || "Creative Fashion Design"}
                </p>
              </div>
              <button
                onClick={onClose}
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
                {project.images.length > 0 ? (
                  <>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* Wrap image in a div to handle clicks properly */}
                      <div
                        className="w-full h-full cursor-zoom-in"
                        onClick={handleImageClick}
                      >
                        <img
                          src={project.images[currentImageIndex].url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                      {/* Zoom hint */}
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-semibold border border-white/20 flex items-center gap-2 pointer-events-none">
                        🔍 Click to zoom
                      </div>

                      {project.images.length > 1 && (
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
                            📸 {currentImageIndex + 1} / {project.images.length}
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
              {project.images.length > 1 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">🖼️</span>
                    Gallery ({project.images.length} images)
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {project.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
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
                    {project.description}
                  </p>
                </div>

                {/* Materials Used */}
                {project.materials && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-2xl mr-4 text-2xl shadow-lg">
                        🧵
                      </span>
                      Materials & Techniques
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {project.materials}
                    </p>
                  </div>
                )}

                {/* Design Inspiration */}
                {project.inspiration && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-2xl mr-4 text-2xl shadow-lg">
                        ✨
                      </span>
                      Creative Inspiration
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {project.inspiration}
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
                        {categoryLabels[project.category] || project.category}
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
                        {new Date(project.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Designer Information */}
                {project.student && (
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
                          {project.student.firstName?.[0]}
                          {project.student.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-xl">
                            {project.student.firstName}{" "}
                            {project.student.lastName}
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
                            {project.student.studentId}
                          </p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Course
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {project.student.department}
                          </p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {project.student.email && (
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Email
                          </p>
                          <p className="text-sm font-medium text-purple-600 break-all">
                            {project.student.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default ProjectViewDialog;
