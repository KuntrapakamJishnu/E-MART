import mongoose from "mongoose"

const interviewReviewSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    experienceLevel: {
      type: String,
      enum: ["Intern", "Fresher", "1-2 years", "3+ years"],
      default: "Fresher"
    },
    rounds: {
      type: Number,
      min: 1,
      max: 20,
      required: true
    },
    hiringProcessRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    processSummary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    askedQuestions: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    tipsForStudents: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    outcome: {
      type: String,
      enum: ["Selected", "Rejected", "Waiting", "Offer Declined"],
      default: "Waiting"
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    helpfulVotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
)

interviewReviewSchema.index({ companyName: 1, role: 1, createdAt: -1 })
interviewReviewSchema.index({ hiringProcessRating: -1 })
interviewReviewSchema.index({ helpfulVotes: -1 })

const InterviewReview = mongoose.model("InterviewReview", interviewReviewSchema)

export default InterviewReview
