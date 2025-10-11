import { useState } from "react";
import { departments } from "../../../frontend/src/components/departments";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import SummaryApi from "../common/summaryApi";
import { Link } from "react-router-dom";
function LoginSignUp() {
  const [activeTab, setActiveTab] = useState("student");
  const [currentPage, setCurrentPage] = useState("login"); // 'login' or 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    department: "",
    role: "student",
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returns data.message, not data.error
        throw new Error(data.message || "Invalid email or password");
      }

      if (data.success) {
        // Store token and user data
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("userData", JSON.stringify(data.data.user));

        // Show success message
        toast.success("Login successfully!");

        setTimeout(() => {
          if (data.data.user.role === "student") {
            navigate("/student-dashboard");
          } else {
            navigate("/admin-dashboard");
          }
        }, 1500);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
      setLoginData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSignup = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    // Validate password length
    if (signupData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const signupDataToSend = { ...signupData };
      delete signupDataToSend.confirmPassword;

      const response = await fetch(SummaryApi.studentSignUp.url, {
        method: SummaryApi.studentSignUp.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupDataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (data.success) {
        toast.success("Student account created successfully!");
        navigateToLogin();
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Student signup error:", error);
      toast.error(error.message);
      setSignupData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSignup = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // Validate password length
    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const signupDataToSend = { ...signupData };
      delete signupDataToSend.confirmPassword;

      const response = await fetch(SummaryApi.adminSignUp.url, {
        method: SummaryApi.adminSignUp.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupDataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (data.success) {
        // Store token and user data for auto-login
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("userData", JSON.stringify(data.data.user));

        toast.success("Admin account created successfully!");

        setTimeout(() => {
          navigateToLogin();
        }, 1500);
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Admin signup error:", error);
      toast.success(error.message);
      setSignupData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = (e) => {
    if (activeTab === "student") {
      handleStudentSignup(e);
    } else {
      handleAdminSignup(e);
    }
  };

  const navigateToSignup = () => {
    setCurrentPage("signup");
    // Reset signup data when navigating to signup
    setSignupData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
      department: "",
      role: activeTab,
    });
  };

  const navigateToLogin = () => {
    setCurrentPage("login");
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      <span className="ml-2">Processing...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
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
      <nav className="bg-white shadow-sm">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="ml-2 text-xl font-bold text-purple-700">
                FashionFlux KTU
              </span>
            </div>

            {/* Right Section - Nav Links */}
            <div className="flex items-center space-x-4 ml-auto">
              <Link
                to="/gallery"
                className="group flex items-center space-x-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105 transform no-underline"
              >
                <span>🎨</span>
                <span>Explore Gallery</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </Link>

              <button
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-purple-50"
              >
                About
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-800 mb-4">
              Digital Portfolio Platform
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering fashion design students at Koforidua Technical
              University with professional digital portfolios, academic
              archiving, and industry exposure.
            </p>
          </div>

          {/* Login/Signup Section */}
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
            {currentPage === "login" ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-purple-700 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Sign in to access your portfolio
                  </p>
                </div>

                {/* Role Selection */}
                <div className="flex bg-purple-50 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => {
                      setActiveTab("student");
                      setLoginData({ ...loginData, role: "student" });
                    }}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      activeTab === "student"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-600 hover:text-purple-700"
                    }`}
                    disabled={isLoading}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("admin");
                      setLoginData({ ...loginData, role: "admin" });
                    }}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      activeTab === "admin"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-600 hover:text-purple-700"
                    }`}
                    disabled={isLoading}
                  >
                    Administrator
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                      placeholder={`Enter your ${activeTab} email`}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-sm text-purple-600 hover:text-purple-500 transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      `Sign In as ${
                        activeTab === "student" ? "Student" : "Administrator"
                      }`
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={navigateToSignup}
                      className="text-purple-600 hover:text-purple-500 font-medium transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Sign Up Section */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-purple-700 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Join{" "}
                    {activeTab === "student"
                      ? "as a student"
                      : "as an administrator"}
                  </p>
                </div>

                {/* Role Selection for Signup */}
                <div className="flex bg-purple-50 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => {
                      setActiveTab("student");
                      setSignupData({ ...signupData, role: "student" });
                    }}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      activeTab === "student"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-600 hover:text-purple-700"
                    }`}
                    disabled={isLoading}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("admin");
                      setSignupData({ ...signupData, role: "admin" });
                    }}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      activeTab === "admin"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-600 hover:text-purple-700"
                    }`}
                    disabled={isLoading}
                  >
                    Administrator
                  </button>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={signupData.firstName}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                        placeholder="First name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={signupData.lastName}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                        placeholder="Last name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {activeTab === "student" && (
                    <>
                      <div>
                        <label
                          htmlFor="studentId"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Student ID
                        </label>
                        <input
                          type="text"
                          id="studentId"
                          name="studentId"
                          value={signupData.studentId}
                          onChange={handleSignupChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                          placeholder="Enter your student ID"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={signupData.department}
                          onChange={handleSignupChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                          required
                          disabled={isLoading}
                        >
                          <option value="">Select Course</option>

                          {departments.map((dept) => (
                            <option
                              key={dept}
                              value={dept.toLowerCase().replace(/\s+/g, "-")}
                            >
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label
                      htmlFor="signupEmail"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="signupEmail"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                      placeholder={`Enter your ${activeTab} email`}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signupPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="signupPassword"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:opacity-50"
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      `Create ${
                        activeTab === "student" ? "Student" : "Administrator"
                      } Account`
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={navigateToLogin}
                      className="text-purple-600 hover:text-purple-500 font-medium transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      {/* <footer className="bg-purple-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            &copy; 2024 FashionFlux KTU - Koforidua Technical University. All
            rights reserved.
          </p>
          <p className="mt-2 text-purple-200">
            Department of Fashion Design and Technology
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default LoginSignUp;
