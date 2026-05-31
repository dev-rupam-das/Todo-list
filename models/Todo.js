import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: [120, "Title cannot be longer than 120 characters."],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot be longer than 500 characters."],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required."],
      index: true,
    },
    type: {
      type: String,
      enum: ["personal", "global"],
      default: "personal",
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
