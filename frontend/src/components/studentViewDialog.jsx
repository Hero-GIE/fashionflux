// components/StudentViewDialog.jsx
const StudentViewDialog = ({ student, isOpen, onClose, onApprove }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Student Details
              </h3>
              <p className="text-gray-600 mt-1">
                Complete information about {student.firstName}{" "}
                {student.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Student Information */}
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {student.firstName?.[0]}
                {student.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h4>
                <p className="text-gray-600">{student.email}</p>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                    student.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {student.isApproved ? "✅ Approved" : "⏳ Pending Approval"}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Student ID
                </label>
                <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                  {student.studentId}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Department
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {student.department}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Registration Date
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {new Date(student.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Last Updated
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {new Date(student.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            {student.profile && (
              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Information
                </h5>
                <div className="space-y-4">
                  {student.profile.bio && (
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Bio
                      </label>
                      <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        {student.profile.bio}
                      </p>
                    </div>
                  )}

                  {student.profile.skills && (
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Skills
                      </label>
                      <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        {student.profile.skills}
                      </p>
                    </div>
                  )}

                  {student.profile.specialization && (
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Specialization
                      </label>
                      <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        {student.profile.specialization}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {student.profile.socialLinks && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Social Links
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {student.profile.socialLinks.instagram && (
                          <a
                            href={student.profile.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-pink-50 text-pink-700 px-3 py-2 rounded-lg hover:bg-pink-100 transition-colors"
                          >
                            <span>📷</span>
                            <span className="font-medium">Instagram</span>
                          </a>
                        )}
                        {student.profile.socialLinks.linkedin && (
                          <a
                            href={student.profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <span>💼</span>
                            <span className="font-medium">LinkedIn</span>
                          </a>
                        )}
                        {student.profile.socialLinks.behance && (
                          <a
                            href={student.profile.socialLinks.behance}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <span>🎨</span>
                            <span className="font-medium">Behance</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            {!student.isApproved && (
              <button
                onClick={() => onApprove(student._id)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
              >
                <span>✅</span>
                <span>Approve Student</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
            >
              <span>←</span>
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentViewDialog;
