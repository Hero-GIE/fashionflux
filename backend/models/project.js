const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "fashion-design",
        "textile-design",
        "accessories",
        "couture",
        "sustainable-fashion",
        "traditional-wear",
      ],
    },
    materials: {
      type: String,
      default: "",
    },
    inspiration: {
      type: String,
      default: "",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publitio_id: {
          type: String,
          required: true,
        },
        width: Number,
        height: Number,
        format: String,
        filename: String,
      },
    ],
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    feedback: {
      type: String,
      default: "",
    },
    approvedAt: Date,
    rejectedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ status: 1, category: 1 });
projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("Project", projectSchema);
