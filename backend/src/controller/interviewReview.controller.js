import InterviewReview from "../model/interviewReview.model.js"

const toCleanNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const createInterviewReview = async (req, res) => {
  try {
    const {
      companyName,
      role,
      experienceLevel,
      rounds,
      hiringProcessRating,
      processSummary,
      askedQuestions,
      tipsForStudents,
      outcome
    } = req.body

    const missingFields = []
    if (!companyName) missingFields.push("companyName")
    if (!role) missingFields.push("role")
    if (!rounds) missingFields.push("rounds")
    if (!hiringProcessRating) missingFields.push("hiringProcessRating")
    if (!processSummary) missingFields.push("processSummary")

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please provide: ${missingFields.join(", ")}`
      })
    }

    const review = await InterviewReview.create({
      companyName,
      role,
      experienceLevel,
      rounds: Number(rounds),
      hiringProcessRating: Number(hiringProcessRating),
      processSummary,
      askedQuestions,
      tipsForStudents,
      outcome,
      author: req.id
    })

    return res.status(201).json({
      message: "Interview review posted successfully",
      review
    })
  } catch (error) {
    console.error("create interview review error:", error)
    return res.status(500).json({ message: "Unable to create interview review" })
  }
}

export const getInterviewReviews = async (req, res) => {
  try {
    const company = String(req.query.company || "").trim()
    const minRating = Number(req.query.minRating || 0)

    const query = {}
    if (company) {
      query.companyName = { $regex: company, $options: "i" }
    }
    if (!Number.isNaN(minRating) && minRating > 0) {
      query.hiringProcessRating = { $gte: minRating }
    }

    const viewerId = String(req.id)

    const reviews = await InterviewReview.find(query)
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean()

    const normalized = reviews.map((item) => {
      const votedBy = Array.isArray(item.helpfulVotedBy) ? item.helpfulVotedBy.map((id) => String(id)) : []
      return {
        ...item,
        helpfulVotes: toCleanNumber(item.helpfulVotes, 0),
        isHelpfulByViewer: votedBy.includes(viewerId),
        isOwner: String(item?.author?._id || "") === viewerId
      }
    })

    const total = normalized.length
    const averageRating = total
      ? Number((normalized.reduce((sum, item) => sum + Number(item.hiringProcessRating || 0), 0) / total).toFixed(2))
      : 0

    return res.status(200).json({
      reviews: normalized,
      total,
      averageRating
    })
  } catch (error) {
    console.error("get interview review error:", error)
    return res.status(500).json({ message: "Unable to fetch interview reviews" })
  }
}

export const updateInterviewReview = async (req, res) => {
  try {
    const reviewId = req.params.id
    const review = await InterviewReview.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    if (String(review.author) !== String(req.id)) {
      return res.status(403).json({ message: "You can edit only your own review" })
    }

    const allowedFields = [
      "companyName",
      "role",
      "experienceLevel",
      "rounds",
      "hiringProcessRating",
      "processSummary",
      "askedQuestions",
      "tipsForStudents",
      "outcome"
    ]

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field]
      }
    }

    await review.save()

    return res.status(200).json({
      message: "Review updated successfully",
      review
    })
  } catch (error) {
    console.error("update interview review error:", error)
    return res.status(500).json({ message: "Unable to update review" })
  }
}

export const deleteInterviewReview = async (req, res) => {
  try {
    const reviewId = req.params.id
    const review = await InterviewReview.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    if (String(review.author) !== String(req.id)) {
      return res.status(403).json({ message: "You can delete only your own review" })
    }

    await InterviewReview.findByIdAndDelete(reviewId)

    return res.status(200).json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("delete interview review error:", error)
    return res.status(500).json({ message: "Unable to delete review" })
  }
}

export const toggleHelpfulVote = async (req, res) => {
  try {
    const reviewId = req.params.id
    const userId = String(req.id)

    const review = await InterviewReview.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    const hasVoted = review.helpfulVotedBy.some((id) => String(id) === userId)

    if (hasVoted) {
      review.helpfulVotedBy = review.helpfulVotedBy.filter((id) => String(id) !== userId)
    } else {
      review.helpfulVotedBy.push(userId)
    }

    review.helpfulVotes = review.helpfulVotedBy.length
    await review.save()

    return res.status(200).json({
      message: hasVoted ? "Helpful vote removed" : "Marked as helpful",
      helpfulVotes: review.helpfulVotes,
      isHelpfulByViewer: !hasVoted
    })
  } catch (error) {
    console.error("toggle helpful vote error:", error)
    return res.status(500).json({ message: "Unable to update helpful vote" })
  }
}

export const getInterviewReviewStats = async (req, res) => {
  try {
    const rows = await InterviewReview.find({})
      .populate("author", "name")
      .select("companyName rounds hiringProcessRating askedQuestions outcome")
      .lean()

    const totalReviews = rows.length
    const averageRating = totalReviews
      ? Number((rows.reduce((sum, row) => sum + toCleanNumber(row.hiringProcessRating, 0), 0) / totalReviews).toFixed(2))
      : 0

    const companyMap = new Map()
    const roundMap = new Map()
    const questionTokenMap = new Map()
    let selectedCount = 0

    for (const row of rows) {
      const company = String(row.companyName || "Unknown").trim() || "Unknown"
      const rounds = toCleanNumber(row.rounds, 0)
      const rating = toCleanNumber(row.hiringProcessRating, 0)

      if (!companyMap.has(company)) {
        companyMap.set(company, {
          companyName: company,
          total: 0,
          ratingSum: 0,
          roundSum: 0
        })
      }

      const bucket = companyMap.get(company)
      bucket.total += 1
      bucket.ratingSum += rating
      bucket.roundSum += rounds

      roundMap.set(rounds, (roundMap.get(rounds) || 0) + 1)

      if (String(row.outcome || "") === "Selected") {
        selectedCount += 1
      }

      const questionText = String(row.askedQuestions || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
      const tokens = questionText
        .split(/\s+/)
        .filter((token) => token.length > 3)

      for (const token of tokens) {
        questionTokenMap.set(token, (questionTokenMap.get(token) || 0) + 1)
      }
    }

    const companies = Array.from(companyMap.values())
      .map((item) => ({
        companyName: item.companyName,
        total: item.total,
        averageRating: Number((item.ratingSum / item.total).toFixed(2)),
        averageRounds: Number((item.roundSum / item.total).toFixed(2))
      }))
      .sort((a, b) => b.total - a.total)

    const roundDistribution = Array.from(roundMap.entries())
      .map(([rounds, count]) => ({ rounds: Number(rounds), count }))
      .sort((a, b) => a.rounds - b.rounds)

    const mostCommonRounds = roundDistribution
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const topQuestionTopics = Array.from(questionTokenMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const selectionRate = totalReviews
      ? Number(((selectedCount / totalReviews) * 100).toFixed(2))
      : 0

    return res.status(200).json({
      totalReviews,
      averageRating,
      selectionRate,
      companies,
      roundDistribution,
      mostCommonRounds,
      topQuestionTopics
    })
  } catch (error) {
    console.error("interview stats error:", error)
    return res.status(500).json({ message: "Unable to fetch placement insights" })
  }
}
