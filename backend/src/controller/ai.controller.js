import { GoogleGenerativeAI } from "@google/generative-ai"
import { ENV } from "../config/env.js"
import Product from "../model/product.model.js"
import Order from "../model/order.model.js"

const hasGeminiKey = Boolean(ENV.GEMINI_API_KEY)
const genAI = hasGeminiKey ? new GoogleGenerativeAI(ENV.GEMINI_API_KEY) : null
const model = hasGeminiKey ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null

const safeParseJsonArray = (value) => {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const STOP_WORDS = new Set([
  "the", "a", "an", "for", "with", "and", "or", "to", "of", "in", "on", "at", "me", "some", "good", "best", "please", "show", "give", "can", "you", "products", "product", "ideas", "recommend"
])

const toTokens = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length > 1 && !STOP_WORDS.has(token))

const dedupeProducts = (products) => {
  const seen = new Set()
  return products.filter((item) => {
    const key = `${String(item.name || "").toLowerCase()}|${String(item.category || "").toLowerCase()}|${Number(item.price || 0)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const parseBudgetRange = (query) => {
  const text = String(query || "").toLowerCase()

  const between = text.match(/between\s*(\d{2,6})\s*(?:and|to)\s*(\d{2,6})/)
  if (between) {
    const min = Number(between[1])
    const max = Number(between[2])
    return { min: Math.min(min, max), max: Math.max(min, max), target: Math.round((min + max) / 2) }
  }

  const around = text.match(/(?:around|near|approx|approximately)\s*rs?\.?\s*(\d{2,6})/)
  if (around) {
    const target = Number(around[1])
    const delta = Math.max(100, Math.round(target * 0.2))
    return { min: Math.max(0, target - delta), max: target + delta, target }
  }

  const under = text.match(/(?:under|below|less than|within|worth|upto|up to|<=?)\s*rs?\.?\s*(\d{2,6})/)
  if (under) {
    const max = Number(under[1])
    return { min: null, max, target: max }
  }

  const above = text.match(/(?:above|over|more than|>=?)\s*rs?\.?\s*(\d{2,6})/)
  if (above) {
    const min = Number(above[1])
    return { min, max: null, target: min }
  }

  const naked = text.match(/\b(\d{2,6})\b/)
  if (naked) {
    const target = Number(naked[1])
    return { min: null, max: target, target }
  }

  return { min: null, max: null, target: null }
}

const rankProductsForQuery = (query, products, limit = 3) => {
  const queryText = String(query || "").toLowerCase().trim()
  const tokens = toTokens(queryText)
  const { min, max, target } = parseBudgetRange(queryText)
  const uniqueProducts = dedupeProducts(products)

  let candidates = uniqueProducts
  if (typeof min === "number") candidates = candidates.filter((item) => Number(item.price || 0) >= min)
  if (typeof max === "number") candidates = candidates.filter((item) => Number(item.price || 0) <= max)
  if (!candidates.length) candidates = uniqueProducts

  const wantsIdeas = /(idea|suggest|recommend|new|trendy|summer|winter|festival|fest)/i.test(queryText)

  const scored = candidates.map((item) => {
    const name = String(item.name || "").toLowerCase()
    const category = String(item.category || "").toLowerCase()
    const description = String(item.description || "").toLowerCase()

    let score = 0

    if (queryText && name.includes(queryText)) score += 24
    if (queryText && category.includes(queryText)) score += 20
    if (queryText && description.includes(queryText)) score += 14

    for (const token of tokens) {
      if (name.includes(token)) score += 8
      if (category.includes(token)) score += 7
      if (description.includes(token)) score += 4
    }

    if (wantsIdeas) {
      if (/(cotton|light|casual|summer|comfort)/i.test(description + " " + name)) score += 8
      if (/(shirt|shoes|jeans|jacket|saree)/i.test(category + " " + name)) score += 4
    }

    if (typeof target === "number") {
      const distance = Math.abs(Number(item.price || 0) - target)
      score += Math.max(0, 14 - Math.round(distance / 100))
    }

    return { item, score }
  })

  scored.sort((a, b) => b.score - a.score || Number(a.item.price || 0) - Number(b.item.price || 0))

  const picked = scored.slice(0, Math.max(limit, 1)).map((entry) => entry.item)
  return dedupeProducts(picked).slice(0, limit)
}

const buildCatalogFallbackChatReply = (message, products) => {
  if (!products?.length) {
    return "I could not find products in the catalog right now. Please try again shortly."
  }

  const query = String(message || "").toLowerCase().trim()
  const { max } = parseBudgetRange(query)
  const filtered = rankProductsForQuery(query, products, 3)

  const isGreeting = /^(hi|hello|hey|yo|hii|hola)\b/.test(query)
  const asksIdeas = /(idea|ideas|suggest|suggestion|recommend|recommendation)/.test(query)
  const asksSummer = /(summer|hot|heat|light|breathable)/.test(query)

  if (isGreeting) {
    return "Hey! I can help you find products by budget, category, and occasion. Try: 'products under 700', 'best summer options', or 'casual ideas for college'."
  }

  if (!filtered.length) {
    const closest = dedupeProducts(products)
      .slice()
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      .slice(0, 3)

    const closestText = closest.map((item) => `${item.name} (Rs. ${item.price})`).join(", ")
    return `I could not find an exact product match for that request. Closest options from catalog: ${closestText}.`
  }

  // Keep rank order from rankProductsForQuery; do not re-sort by price.
  const top = filtered.slice(0, 3)

  const reasonFor = (item) => {
    const title = `${String(item.name || "")} ${String(item.category || "")} ${String(item.description || "")}`.toLowerCase()
    if (asksSummer) {
      if (/shirt|cotton|light|casual|shoes/.test(title)) return "good for warmer weather and daily comfort"
      if (/jacket/.test(title)) return "best for cooler evenings or AC indoor use"
      return "easy to style for day-to-day summer looks"
    }
    if (typeof max === "number") {
      return `fits your budget range`
    }
    if (asksIdeas) {
      return "a versatile pick for campus styling"
    }
    return "matches your query"
  }

  const lines = top.map((item) => `- ${item.name} (${item.category}) | Rs. ${item.price} | ${reasonFor(item)}`)
  let intro = "Here are the best product matches from our catalog:"

  if (typeof max === "number") {
    intro = `Here are the best product matches under Rs. ${max}:`
  } else if (asksSummer) {
    intro = "Here are recommended options for summer styling:"
  } else if (asksIdeas) {
    intro = "Here are some product ideas you can try:"
  }

  return `${intro}\n${lines.join("\n")}`
}

const buildFallbackDescription = ({ title, category, keywords, tone }) => {
  const toneText = tone || "friendly"
  const keywordText = keywords?.trim() ? ` It highlights ${keywords.trim()}.` : ""
  return `${title} is a ${toneText} ${category} pick built for campus life.${keywordText} It blends comfort, quality, and everyday value for students.`
}

const inferStatusByAge = (createdAt, currentStatus) => {
  if (currentStatus) return currentStatus
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return "Placed"
  if (diffDays <= 1) return "Processing"
  if (diffDays <= 3) return "Shipped"
  if (diffDays <= 5) return "Out for delivery"
  return "Delivered"
}

const buildOrderTrackingReply = async (userId, message) => {
  const queryText = String(message || "").toLowerCase()
  const mongoIdMatch = queryText.match(/\b[a-f0-9]{24}\b/i)
  const razorMatch = queryText.match(/\border_[a-z0-9]+\b/i)

  const findQuery = { user: userId }
  if (mongoIdMatch) {
    findQuery._id = mongoIdMatch[0]
  } else if (razorMatch) {
    findQuery.razorpayOrderId = razorMatch[0]
  }

  const orders = await Order.find(findQuery)
    .populate("products.product", "name")
    .sort({ createdAt: -1 })
    .limit(mongoIdMatch || razorMatch ? 1 : 3)
    .lean()

  if (!orders.length) {
    return "I could not find orders for this account yet. If you recently paid, please wait a moment and try again with your order ID."
  }

  if (mongoIdMatch || razorMatch) {
    const order = orders[0]
    const status = inferStatusByAge(order.createdAt, order.orderStatus)
    const productNames = (order.products || [])
      .map((p) => p?.product?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(", ")
    const shortId = String(order._id).slice(-6)

    return `Order #${shortId} status: ${status}. Total: Rs. ${order.totalAmount}. Items: ${productNames || "Product details unavailable"}.`
  }

  const lines = orders.map((order) => {
    const status = inferStatusByAge(order.createdAt, order.orderStatus)
    const shortId = String(order._id).slice(-6)
    return `- Order #${shortId}: ${status} • Rs. ${order.totalAmount} • ${new Date(order.createdAt).toLocaleDateString()}`
  })

  return `Here are your latest orders:\n${lines.join("\n")}\n\nFor exact tracking, ask: track order <order_id>.`
}

export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "Message is required" })
    }

    const orderTrackingIntent = /(track|tracking|status|where.*order|my order|delivery|shipment|order update)/i.test(String(message))
    if (orderTrackingIntent) {
      const trackingReply = await buildOrderTrackingReply(req.id, message)
      return res.status(200).json({ reply: trackingReply })
    }

    const compactHistory = Array.isArray(history)
      ? history.slice(-8).map((item) => `${item?.role || "user"}: ${item?.content || ""}`).join("\n")
      : ""

    const products = await Product.find({})
      .select("name category price description")
      .limit(140)
      .lean()

    if (!model) {
      return res.status(200).json({
        reply: buildCatalogFallbackChatReply(message, products)
      })
    }

    const productCatalog = products.length
      ? products
          .map((item) => `- ${item.name} | ${item.category} | Rs. ${item.price} | ${String(item.description || "").slice(0, 120)}`)
          .join("\n")
      : "No products available in catalog."

    const prompt = `You are the AI assistant for VIT Campus space.\nYour role: answer product questions accurately and recommend items from the live catalog below.\n\nRules:\n1) Use the catalog data below as source of truth for product names, categories, and prices.\n2) If recommending products, prefer exact catalog names and include price + short reason.\n3) If user asks for budget/category filters, suggest best matching catalog items only.\n4) If no good match exists, clearly say so and suggest the closest alternatives.\n5) Keep answers concise and practical.\n\nLive Catalog:\n${productCatalog}\n\nConversation:\n${compactHistory}\nuser: ${String(message).trim()}\nassistant:`

    let reply = ""
    try {
      const result = await model.generateContent(prompt)
      reply = result?.response?.text?.()?.trim() || ""
    } catch (modelError) {
      console.error("Gemini chat failed, using fallback:", modelError)
      reply = buildCatalogFallbackChatReply(message, products)
    }

    if (!reply) {
      reply = buildCatalogFallbackChatReply(message, products)
    }

    const recommendationIntent = /(recommend|suggest|idea|best|what should i buy|options)/i.test(String(message || ""))
    if (recommendationIntent) {
      const guaranteed = rankProductsForQuery(message, products, 3)
      if (guaranteed.length > 0) {
        const shouldAppend = !guaranteed.some((item) => String(reply).toLowerCase().includes(String(item.name || "").toLowerCase()))
        if (shouldAppend) {
          const picks = guaranteed
            .map((item) => `- ${item.name} (${item.category}) | Rs. ${item.price}`)
            .join("\n")
          reply = `${reply}\n\nTop picks for you:\n${picks}`
        }
      }
    }

    return res.status(200).json({ reply })
  } catch (error) {
    console.error("AI chat error:", error)
    return res.status(500).json({ message: "Unable to process AI chat" })
  }
}

export const getSmartRecommendations = async (req, res) => {
  try {
    const query = String(req.query.query || "").trim()
    const limit = Math.min(Math.max(Number(req.query.limit || 6), 1), 12)

    const products = await Product.find({}).select("name category price description imageUrl").lean()
    const uniqueProducts = dedupeProducts(products)

    if (!uniqueProducts.length) {
      return res.status(200).json({ products: [] })
    }

    if (!query) {
      return res.status(200).json({ products: uniqueProducts.slice(0, limit) })
    }

    if (!model) {
      const fallback = rankProductsForQuery(query, uniqueProducts, limit)
      return res.status(200).json({ products: fallback })
    }

    const shortlist = uniqueProducts.slice(0, 80).map((p) => ({
      id: String(p._id),
      name: p.name,
      category: p.category,
      price: p.price,
      description: String(p.description || "").slice(0, 140)
    }))

    const prompt = `You are a shopping recommendation engine.\nUser query: "${query}"\nPick the most relevant product IDs from this list.\nReturn ONLY valid JSON array of IDs, ordered by relevance, max ${limit} IDs.\nProducts: ${JSON.stringify(shortlist)}`

    let orderedIds = []
    try {
      const result = await model.generateContent(prompt)
      const text = result?.response?.text?.()?.trim() || "[]"
      const cleaned = text.replace(/```json|```/gi, "").trim()
      orderedIds = safeParseJsonArray(cleaned)
    } catch (modelError) {
      console.error("Gemini recommendations failed, using fallback:", modelError)
      orderedIds = []
    }

    const mapped = orderedIds
      .map((id) => uniqueProducts.find((item) => String(item._id) === String(id)))
      .filter(Boolean)
      .slice(0, limit)

    if (!mapped.length) {
      const backup = rankProductsForQuery(query, uniqueProducts, limit)
      return res.status(200).json({ products: backup })
    }

    return res.status(200).json({ products: dedupeProducts(mapped).slice(0, limit) })
  } catch (error) {
    console.error("AI recommendations error:", error)
    return res.status(500).json({ message: "Unable to generate recommendations" })
  }
}

export const generateProductDescription = async (req, res) => {
  try {
    const { title, category, keywords = "", tone = "friendly" } = req.body

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" })
    }

    if (!model) {
      return res.status(200).json({
        description: buildFallbackDescription({ title, category, keywords, tone })
      })
    }

    const prompt = `Write a premium e-commerce product description in under 110 words.\nTitle: ${title}\nCategory: ${category}\nTone: ${tone}\nKeywords: ${keywords || "none"}\nInclude campus-friendly value and clear benefit language.`

    const result = await model.generateContent(prompt)
    const description = typeof result?.response?.text === "function"
      ? result.response.text()?.trim()
      : String(result?.response?.text || "").trim()

    return res.status(200).json({
      description: description || buildFallbackDescription({ title, category, keywords, tone })
    })
  } catch (error) {
    console.error("AI description error:", error)
    const { title, category, keywords = "", tone = "friendly" } = req.body || {}

    if (title && category) {
      return res.status(200).json({
        description: buildFallbackDescription({ title, category, keywords, tone })
      })
    }

    return res.status(500).json({ message: "Unable to generate description" })
  }
}
