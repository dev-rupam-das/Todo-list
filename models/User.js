import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      lowercase: true,
      unique: true,
      minlength: [3, "Username must be at least 3 characters."],
      maxlength: [32, "Username cannot be longer than 32 characters."],
      match: [/^[a-z0-9._-]+$/, "Username can only include letters, numbers, dots, hyphens, and underscores."],
    },
    password: {
      type: String,
      required: [true, "Password hash is required."],
      minlength: [8, "Password hash is invalid."],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
