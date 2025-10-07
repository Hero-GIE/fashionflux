// src/components/ProjectViewDialog.js
import { useState } from "react";

const ProjectViewDialog = ({ project, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !project) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[89vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h2>
            <p className="text-gray-600 mt-1">{project.category}</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(project.status)}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
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
              {project.images.length > 0 ? (
                <>
                  <img
                    src={project.images[currentImageIndex].url}
                    alt={project.title}
                    className="w-full h-96 object-cover"
                  />

                  {/* Image Navigation */}
                  {project.images.length > 1 && (
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
                        {currentImageIndex + 1} / {project.images.length}
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
            {project.images.length > 1 && (
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-2">
                  {project.images.map((image, index) => (
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
                  {project.description}
                </p>
              </div>

              {/* Materials */}
              {project.materials && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                      🧵
                    </span>
                    Materials Used
                  </h3>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                    {project.materials}
                  </p>
                </div>
              )}

              {/* Inspiration */}
              {project.inspiration && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                      💫
                    </span>
                    Design Inspiration
                  </h3>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                    {project.inspiration}
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
                    {project.category}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    Created
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    Images
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {project.images.length}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">
                    Status
                  </h4>
                  <div className="inline-block">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </div>

              {/* Student Info */}
              {project.student && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Student Information
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {project.student.firstName?.[0]}
                      {project.student.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {project.student.firstName} {project.student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {project.student.studentId} •{" "}
                        {project.student.department}
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
  );
};

export default ProjectViewDialog;
