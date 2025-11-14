const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    required: true,
  },

  // FIXED: removed sparse here
  studentId: {
    type: String,
  },

  department: {
    type: String,
    enum: [
      "fashion-design",
      "textile-technology",
      "fashion-marketing",
      "pattern-making-garment-construction",
      "fashion-merchandising",
      "apparel-production",
      "fashion-illustration",
      "fashion-styling",
      "accessory-design",
      "footwear-design",
      "fashion-photography",
      "visual-merchandising",
      "sustainable-fashion",
      "fabric-science",
      "costume-design",
      "fashion-communication",
      "fashion-business-management",
      "fashion-technology",
      "jewelry-design",
      "fashion-entrepreneurship",
    ],
    default: "",
  },

  isApproved: {
    type: Boolean,
    default: false,
  },

  // PROFILE OBJECT
  profile: {
    bio: { type: String, default: "" },
    skills: { type: String, default: "" },
    specialization: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },

    socialLinks: {
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      behance: { type: String, default: "" },
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✔ Single clean index (no duplicate warning)
userSchema.index({ studentId: 1 }, { unique: true, sparse: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
