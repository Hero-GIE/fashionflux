// components/ProjectViewDialog.jsx
import { useState, useEffect } from "react";

const ProjectViewDialog = ({
  project,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when modal opens or project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || !project) return;

      if (e.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, project, currentImageIndex]);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === project.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? project.images.length - 1 : prevIndex - 1
    );
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl max-h-[80vh] overflow-y-auto w-full">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h3>
              <div className="flex items-center space-x-3 mt-2">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
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
                <span className="text-sm text-gray-600">
                  by {project.student?.firstName} {project.student?.lastName}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              ×
            </button>
          </div>

          {/* Image Carousel */}
          {project.images.length > 0 && (
            <div className="relative mb-6">
              {/* Main Image */}
              <div className="relative h-80 bg-gray-100 rounded-2xl overflow-hidden">
                {project.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${project.title} - Image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      currentImageIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows - Only show if multiple images */}
              {project.images.length > 1 && (
                <>
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
              {project.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  {currentImageIndex + 1} / {project.images.length}
                </div>
              )}

              {/* Thumbnail Navigation */}
              {project.images.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {project.images.map((_, index) => (
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
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                {project.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Category
                </label>
                <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                  {project.category}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Student Information
                </label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg space-y-1">
                  <p className="text-gray-900 font-medium">
                    {project.student?.firstName} {project.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.student?.studentId}
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.student?.department}
                  </p>
                </div>
              </div>
            </div>

            {project.materials && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Materials Used
                </label>
                <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                  {project.materials}
                </p>
              </div>
            )}

            {project.inspiration && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Design Inspiration
                </label>
                <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                  {project.inspiration}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Submitted Date
                </label>
                <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {project.reviewedAt && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Review Date
                  </label>
                  <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                    {new Date(project.reviewedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>

            {project.rejectionReason && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Rejection Reason
                </label>
                <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                  {project.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            {project.status === "pending" ? (
              <>
                <button
                  onClick={() =>
                    onReject(project._id, "Does not meet guidelines")
                  }
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                >
                  <span>❌</span>
                  <span>Reject Project</span>
                </button>
                <button
                  onClick={() => onApprove(project._id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Approve Project</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
              >
                <span>←</span>
                <span>Close</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewDialog;
