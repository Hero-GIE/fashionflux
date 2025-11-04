// controllers/student/projectController.js
const Project = require("../../models/project");
const path = require("path");
const fileUploadService = require("../../service/fileUploadService");
const fs = require("fs").promises;

// Create New Project
exports.createProject = async (req, res) => {
  try {
    console.log("📝 Creating project...");
    console.log("User ID:", req.user?.id);
    console.log("Body:", req.body);
    console.log("Files:", req.files ? req.files.length : 0);

    const { title, description, category, materials, inspiration } = req.body;
    const studentId = req.user.id;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
      });
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Handle image uploads using FileUploadService
    const imageUrls = [];
    console.log(`📸 Processing ${req.files.length} images...`);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(
        `Uploading image ${i + 1}/${req.files.length}: ${file.originalname}`
      );

      try {
        console.log("Using FileUploadService for upload...");

        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${file.originalname.replace(
          /\s+/g,
          "-"
        )}`;

        // Upload to Publitio using your service
        const uploadResult = await fileUploadService.uploadFile(
          file.buffer,
          uniqueFileName,
          "student-projects" // You can customize the folder name
        );

        console.log(`✅ Image ${i + 1} uploaded successfully:`, {
          publitio_id: uploadResult.publitio_id,
          url: uploadResult.url,
          bytes: uploadResult.bytes,
        });

        // Store the upload result in your desired format
        imageUrls.push({
          url: uploadResult.url,
          publitio_id: uploadResult.publitio_id,
          filename: file.originalname,
          size: uploadResult.bytes,
          format: file.mimetype.split("/")[1] || "jpeg",
          preview: uploadResult.url, // For frontend
          uploadedAt: new Date(),
        });
      } catch (uploadError) {
        console.error(`❌ Image ${i + 1} upload error:`, uploadError);
        return res.status(500).json({
          success: false,
          message: `Failed to upload image ${i + 1}: ${uploadError.message}`,
        });
      }
    }

    console.log("💾 Saving project to database...");

    // Create new project
    const project = new Project({
      title,
      description,
      category,
      materials: materials || "",
      inspiration: inspiration || "",
      images: imageUrls,
      student: studentId,
      status: "pending",
    });

    await project.save();

    // Populate student info for response
    await project.populate(
      "student",
      "firstName lastName studentId department"
    );

    console.log("✅ Project created successfully:", project._id);

    res.status(201).json({
      success: true,
      message: "Project created successfully and submitted for approval",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("❌ Create project error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get Student Projects
// Get Student Projects
exports.getStudentProjects = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query;

    const filter = { student: studentId };
    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .populate("student", "firstName lastName studentId department profile") // ADDED 'profile'
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Single Project
exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    const project = await Project.findOne({
      _id: projectId,
      student: studentId,
    }).populate("student", "firstName lastName studentId department profile"); // ADDED 'profile'

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Project (if needed)
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;
    const { title, description, category, materials, inspiration } = req.body;

    // Find project
    const project = await Project.findOne({
      _id: projectId,
      student: studentId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Handle new file uploads if any
    if (req.files && req.files.length > 0) {
      const newImages = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${file.originalname.replace(
          /\s+/g,
          "-"
        )}`;

        const uploadResult = await fileUploadService.uploadFile(
          file.buffer,
          uniqueFileName,
          "student-projects"
        );

        newImages.push({
          url: uploadResult.url,
          publitio_id: uploadResult.publitio_id,
          filename: file.originalname,
          size: uploadResult.bytes,
          format: file.mimetype.split("/")[1] || "jpeg",
          preview: uploadResult.url,
          uploadedAt: new Date(),
        });
      }

      // Add new images to existing ones
      project.images = [...project.images, ...newImages];
    }

    // Update other fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (materials) project.materials = materials;
    if (inspiration) project.inspiration = inspiration;

    await project.save();
    await project.populate(
      "student",
      "firstName lastName studentId department"
    );

    res.json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get All Approved Projects (Public Route)
exports.getAllProjects = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 5 } = req.query; // Reduced default limit

    console.log("📋 Fetching public projects with filters:", {
      category,
      search,
      page,
      limit,
    });

    // Build filter for approved projects only
    const filter = { status: "approved" };

    // Add category filter if provided
    if (category && category !== "all") {
      filter.category = category;
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { materials: { $regex: search, $options: "i" } },
        { inspiration: { $regex: search, $options: "i" } },
      ];
    }

    console.log("🔍 Database filter:", filter);

    // Add timeout to the query
    const projects = await Project.find(filter)
      .populate("student", "firstName lastName studentId department profile")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .maxTimeMS(60000); // 30 second timeout

    // Get total count for pagination with timeout
    const total = await Project.countDocuments(filter).maxTimeMS(30000);

    console.log(`✅ Found ${projects.length} projects out of ${total} total`);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get all projects error:", error);

    // Handle timeout errors specifically
    if (
      error.name === "MongoServerSelectionError" ||
      error.name === "MongoTimeoutError"
    ) {
      return res.status(503).json({
        success: false,
        message: "Database connection timeout. Please try again.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Get Project Categories (Public Route)
exports.getProjectCategories = async (req, res) => {
  try {
    const categories = await Project.distinct("category", {
      status: "approved",
    });

    console.log("📊 Available categories:", categories);

    res.json({
      success: true,
      data: {
        categories: categories.filter((cat) => cat), // Remove null/undefined
      },
    });
  } catch (error) {
    console.error("Get project categories error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Pending Projects for Admin
exports.getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "pending" })
      .populate("student", "firstName lastName studentId department profile") // ADDED 'profile'
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Pending projects fetched successfully",
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Get pending projects error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Project Statistics for Admin
exports.getProjectStatistics = async (req, res) => {
  try {
    const totalPending = await Project.countDocuments({ status: "pending" });
    const totalApproved = await Project.countDocuments({ status: "approved" });
    const totalRejected = await Project.countDocuments({ status: "rejected" });
    const totalProjects = await Project.countDocuments();

    res.json({
      success: true,
      data: {
        statistics: {
          totalPending,
          totalApproved,
          totalRejected,
          totalProjects,
        },
      },
    });
  } catch (error) {
    console.error("Get project statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Approve Project
exports.approveProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.status = "approved";
    project.reviewedAt = new Date();
    await project.save();

    res.json({
      success: true,
      message: "Project approved successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Approve project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reject Project
exports.rejectProject = async (req, res) => {
  try {
    const { projectId, reason } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.status = "rejected";
    project.rejectionReason = reason;
    project.reviewedAt = new Date();
    await project.save();

    res.json({
      success: true,
      message: "Project rejected successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Reject project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
