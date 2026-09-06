import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gemini SDK - only if API key is configured
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini endpoints will return rule-grounded advice.");
      return null;
    }
    try {
      genAI = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize Gemini client:", err);
      genAI = null;
    }
  }
  return genAI;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    platform: "Fasalniti Decision Intelligence",
    version: "1.0.0",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Counter-offer record for negotiation history preservation
export interface CounterOfferRecord {
  id: string;
  offerId: string;
  pricePerQtl: number;
  quantityQtl: number;
  message?: string;
  sender: 'farmer' | 'buyer';
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// In-memory negotiation store (replace with database in production)
interface NegotiationSession {
  id: string;
  lotId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  originalOffer: {
    pricePerQtl: number;
    quantityQtl: number;
    message: string;
  };
  counterOffers: CounterOfferRecord[];
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  lastUpdated: string;
}

const negotiationSessions: NegotiationSession[] = [];

// Helper to find negotiation session by lotId
function findNegotiationByLotId(lotId: string): NegotiationSession | undefined {
  return negotiationSessions.find((s) => s.lotId === lotId);
}

// Helper to find negotiation session by ID
function findNegotiationById(negId: string): NegotiationSession | undefined {
  return negotiationSessions.find((s) => s.id === negId);
}

function positiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function nonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// POST /api/negotiations - Create new negotiation session from a listing
app.post("/api/negotiations", (req, res) => {
  const { lotId, farmerId, farmerName, buyerId, buyerName, offeredPrice, quantity } = req.body;
  const normalizedPrice = positiveNumber(offeredPrice);
  const normalizedQuantity = positiveNumber(quantity);

  if (!nonEmptyText(lotId) || !nonEmptyText(farmerId) || !nonEmptyText(farmerName) || !nonEmptyText(buyerId) || !nonEmptyText(buyerName) || normalizedPrice === null || normalizedQuantity === null) {
    return res.status(400).json({ error: 'A lot, farmer, buyer, positive price, and positive quantity are required.' });
  }

  const existing = findNegotiationByLotId(lotId);
  if (existing) {
    return res.status(409).json({ error: 'Negotiation already exists for this lot' });
  }

  const session: NegotiationSession = {
    id: `neg-${Date.now()}`,
    lotId,
    farmerId,
    farmerName,
    buyerId,
    buyerName,
    originalOffer: {
      pricePerQtl: normalizedPrice,
      quantityQtl: normalizedQuantity,
      message: 'Initial buyer offer',
    },
    counterOffers: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  negotiationSessions.push(session);
  res.json({ session, message: 'Negotiation started successfully' });
});

// GET /api/negotiations/:lotId - Get negotiation session for a lot
app.get("/api/negotiations/:lotId", (req, res) => {
  const session = findNegotiationByLotId(req.params.lotId);
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }
  res.json(session);
});

// POST /api/negotiations/:id/counter - Make a counter-offer
app.post("/api/negotiations/:id/counter", (req, res) => {
  const { pricePerQtl, quantity, message, sender } = req.body;
  const negId = req.params.id;

  const session = findNegotiationById(negId);
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  if (session.status !== 'active') {
    return res.status(400).json({ error: 'Negotiation is not active' });
  }

  const normalizedPrice = positiveNumber(pricePerQtl);
  const normalizedQuantity = quantity === undefined ? session.originalOffer.quantityQtl : positiveNumber(quantity);
  if (normalizedPrice === null || normalizedQuantity === null || (sender !== undefined && sender !== 'farmer' && sender !== 'buyer')) {
    return res.status(400).json({ error: 'Counter-offer price and quantity must be positive.' });
  }

  const counterOffer: CounterOfferRecord = {
    id: `counter-${Date.now()}`,
    offerId: session.id,
    pricePerQtl: normalizedPrice,
    quantityQtl: normalizedQuantity,
    message: typeof message === 'string' ? message.trim().slice(0, 180) : '',
    sender: sender === 'farmer' ? 'farmer' : 'buyer',
    timestamp: new Date().toISOString(),
    status: 'pending',
  };

  session.counterOffers.push(counterOffer);
  session.lastUpdated = new Date().toISOString();

  // Auto-reject previous offers if this is the latest
  session.counterOffers.forEach((c) => {
    if (c.id !== counterOffer.id) {
      c.status = 'rejected';
    }
  });

  res.json({ session, counterOffer });
});

// POST /api/negotiations/:id/accept - Accept an offer
app.post("/api/negotiations/:id/accept", (req, res) => {
  const { acceptedPrice, acceptedQuantity } = req.body;
  const negId = req.params.id;

  const session = findNegotiationById(negId);
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  if (session.status !== 'active') {
    return res.status(400).json({ error: 'Negotiation is not active' });
  }

  if (acceptedPrice !== undefined && positiveNumber(acceptedPrice) === null) {
    return res.status(400).json({ error: 'Accepted price must be positive.' });
  }
  if (acceptedQuantity !== undefined && positiveNumber(acceptedQuantity) === null) {
    return res.status(400).json({ error: 'Accepted quantity must be positive.' });
  }

  // Create a transaction-ready offer from the latest counter-offer. If nobody
  // has countered yet, the farmer can still accept the buyer's original offer.
  const pendingCounterOffer = session.counterOffers.find((c) => c.status === 'pending');
  const finalOffer = pendingCounterOffer || {
    id: `original-${session.id}`,
    offerId: session.id,
    pricePerQtl: acceptedPrice !== undefined ? Number(acceptedPrice) : session.originalOffer.pricePerQtl,
    quantityQtl: acceptedQuantity !== undefined ? Number(acceptedQuantity) : session.originalOffer.quantityQtl,
    message: session.originalOffer.message,
    sender: 'buyer' as const,
    timestamp: session.createdAt,
    status: 'accepted' as const,
  };

  if (pendingCounterOffer) pendingCounterOffer.status = 'accepted';

  session.status = 'accepted';
  session.lastUpdated = new Date().toISOString();

  res.json({
    session,
    finalOffer,
    message: 'Offer accepted successfully',
  });
});

// POST /api/negotiations/:id/reject - Reject a negotiation
app.post("/api/negotiations/:id/reject", (req, res) => {
  const { reason } = req.body;
  const negId = req.params.id;

  const session = findNegotiationById(negId);
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  session.status = 'rejected';
  session.lastUpdated = new Date().toISOString();

  res.json({ session, message: 'Negotiation rejected' });
});

// Helper to produce structured rule-grounded agricultural advice
function generateGroundedAgriAdvice(query: string, lot: any, recommendation: any, language: string) {
  const langIsHindi = language === "hi";
  const crop = lot?.crop || "Wheat";
  const quantity = lot?.quantityQuintals || 45;
  const recOption = recommendation?.recommendedOptionTitle || recommendation?.recommendedOption?.title || "Direct Institutional Buyer";
  const netVal = recommendation?.recommendedNetRealization || recommendation?.recommendedOption?.netRealization
    ? `₹${(recommendation?.recommendedNetRealization || recommendation?.recommendedOption?.netRealization).toLocaleString("en-IN")}`
    : "₹1,08,750";
  const advantage = recommendation?.advantageOverMandi || recommendation?.netAdvantageOverMandi
    ? `₹${(recommendation?.advantageOverMandi || recommendation?.netAdvantageOverMandi).toLocaleString("en-IN")}`
    : "₹2,760";

  const lowerQ = (query || "").toLowerCase();

  let explanation = "";
  let keyFactors: string[] = [];
  let suggestedActions: string[] = [];

  if (lowerQ.includes("mandi") || lowerQ.includes("मंडी") || lowerQ.includes("price") || lowerQ.includes("भाव")) {
    explanation = langIsHindi
      ? `मंडी में दिखने वाला भाव (Headline Price) अक्सर आकर्षक लगता है, लेकिन 12% से 15% तक की कटौतियां जैसे लंबी दूरी का भाड़ा, पल्लेदारी (Hamali), 1.6% मंडी सेस और खुली मंडी में नमी/ग्रेड रिजेक्शन के कारण आपके बैंक खाते में शुद्ध पैसा कम आता है। ${recOption} आपको सीधे +${advantage} की अतिरिक्त शुद्ध बचत के साथ कुल ${netVal} की पक्की बैंक प्राप्ति देता है।`
      : `While the APMC Mandi headline price might look higher on paper, hidden deductions (long-distance freight, ₹1,260 hamali fees, 1.6% APMC cess, and open-yard moisture docking) erode your margins. Choosing ${recOption} delivers ${netVal} directly into your bank (+${advantage} more in cash).`;
    keyFactors = langIsHindi
      ? ["शून्य मंडी टैक्स एवं सेस", "कम दूरी का भाड़ा खर्च", "डिजिटल वजन पर्ची और लैब ग्रेडिंग", "T+1 सीधा बैंक खाता भुगतान"]
      : ["Zero APMC Mandi Cess", "Reduced Farmgate Freight", "Transparent Digital Weighbridge", "T+1 Guaranteed Bank Transfer"];
    suggestedActions = langIsHindi
      ? ["खरीदार के साथ डील लॉक करें", "एग्रीगेशन पूल में शामिल हों", "डिजिटल अनुबंध पर्ची देखें"]
      : ["Lock Contract with Buyer", "Join Village FPO Pool", "View Digital Weight Slip"];
  } else if (lowerQ.includes("store") || lowerQ.includes("warehouse") || lowerQ.includes("भंडारण") || lowerQ.includes("रख")) {
    explanation = langIsHindi
      ? `आपके ${quantity} क्विंटल ${crop} को 30 दिन स्टोर करने पर ₹0.85/किग्रा मासिक किराया और 2.5% वजन/नमी घटने का स्वाभाविक नुकसान होगा। जब तक अगले 30 दिनों में बाजार का भाव ₹180-220/क्विंटल से अधिक नहीं बढ़ता, तब तक आज ${recOption} पर बेचना ही सबसे सुरक्षित और अधिक शुद्ध आय (${netVal}) देगा।`
      : `Storing your ${quantity} qtl ${crop} incurs ₹0.85/kg monthly rent plus a ~2.5% weight loss from natural shrinkage. Unless market rates rise by at least ₹190-230/qtl in 30 days, selling immediately via ${recOption} secures your optimal net realization of ${netVal}.`;
    keyFactors = langIsHindi
      ? ["मासिक वेयरहाउस किराया व बीमा", "2.5% नमी व वजन कटौती जोखिम", "भविष्य के मूल्य में अनिश्चितता", "तत्काल नकद तरलता"]
      : ["WDRA Monthly Silo Rent", "2.5% Natural Shrinkage Risk", "Off-Season Price Uncertainty", "Immediate Cash Working Capital"];
    suggestedActions = langIsHindi
      ? ["WDRA वेयरहाउस रसीद जांचें", "आज के भाव पर लॉक करें", "मूल्य पूर्वानुमान चार्ट देखें"]
      : ["Check WDRA Silo Locations", "Lock Today's Rate", "Review Price Trend Forecast"];
  } else if (lowerQ.includes("aggregate") || lowerQ.includes("pool") || lowerQ.includes("fpo") || lowerQ.includes("समूह") || lowerQ.includes("पूल")) {
    explanation = langIsHindi
      ? `गाँव के अन्य किसानों के साथ मिलकर 16-टन का साझा ट्रक लोड बनाने से प्रति क्विंटल ₹120 तक लॉजिस्टिक्स की सीधी बचत होती है। साथ ही बड़े खरीदार थोक लॉट पर ₹100-150/क्विंटल का अतिरिक्त प्रीमियम भुगतान करते हैं।`
      : `Aggregating with nearby farmers converts individual small batches into 16T full-truckloads, reducing transport freight by up to 45% (saving ~₹1.20/kg) and unlocking bulk institutional procurement rates.`;
    keyFactors = langIsHindi
      ? ["45% भाड़ा बचत (फुल ट्रकलोड)", "थोक संस्थागत खरीदार प्रीमियम", "गाँव स्तर पर साझा लोडिंग", "FPO डिजिटल समन्वय"]
      : ["45% Freight Cost Reduction", "Bulk Buyer Premium Rates", "Shared Village Dispatch Hub", "FPO Cluster Coordination"];
    suggestedActions = langIsHindi
      ? ["सक्रिय किसान पूल में शामिल हों", "पूल प्रस्थान समय जांचें", "भाड़ा कैलकुलेटर खोलें"]
      : ["Join Active Farmer Pool", "Check Pool Dispatch Schedule", "Open Freight Calculator"];
  } else {
    explanation = langIsHindi
      ? `फसलनीति के आर्थिक निर्णय इंजन के अनुसार, आपके लिए सर्वोत्तम विकल्प ${recOption} है। सभी लागतों (भाड़ा, पल्लेदारी, मंडी टैक्स व जोखिम) को घटाने के बाद आपको कुल ${netVal} की शुद्ध बैंक प्राप्ति होगी, जो सामान्य मंडी से +${advantage} अधिक है।`
      : `According to Fasalniti's Net Realization Decision Engine, ${recOption} is your highest-yielding channel. After subtracting transport, handling, and risk factors, you take home ${netVal} in your bank account (+${advantage} more than local Mandi).`;
    keyFactors = langIsHindi
      ? ["उच्चतम शुद्ध बैंक प्राप्ति (Net Realization)", "सुरक्षित एस्क्रो भुगतान", "कम परिवहन दूरी", "पारदर्शी लैब गुणवत्ता"]
      : ["Highest Bank Take-Home Pay", "Escrow Payment Security", "Optimized Logistics Route", "Objective Quality Grading"];
    suggestedActions = langIsHindi
      ? ["अनुबंध स्वीकार करें", "अन्य 3 विकल्पों की तुलना करें", "एआई से अगला प्रश्न पूछें"]
      : ["Accept Deal Offer", "Compare All 4 Channels", "Ask Another Question"];
  }

  return {
    summary: explanation,
    explanation: explanation,
    recommendedOption: recOption,
    keyFactors: keyFactors,
    suggestedActions: suggestedActions,
  };
}

// Gemini AI Market Strategy Advisor Endpoint
app.post("/api/gemini/advisor", async (req, res) => {
  const userQuery = req.body.query || req.body.question || "";
  const produceContext = req.body.lot || req.body.produceContext;
  const recommendationData = req.body.recommendationSummary || req.body.recommendationData;
  const language = req.body.language || "en";

  try {
    const ai = getGeminiClient();

    const systemPrompt = `You are Fasalniti's Senior Agricultural Market Decision Advisor.
Your job is to explain why a specific selling strategy was recommended to a farmer based strictly on calculated Net Realization economics (Gross Price - Transport - Storage - Handling - Quality/Risk Deductions).

RULES:
1. NEVER hallucinate or invent new prices, quantities, or mathematical values. Use ONLY the data provided in the context.
2. Keep explanations clear, empathetic, practical, and easy for an Indian farmer to understand.
3. Contrast "Headline Visible Price" vs "Actual Net Realization in Bank".
4. If language is 'hi', respond in clear, respectful Hindi (Devanagari script) with relatable agricultural terms (शुद्ध कमाई, पल्लेदारी, ढुलाई खर्च, मंडी टैक्स, नमी कटौती, भरोसा). If language is 'en', respond in clear, friendly English.
5. Limit responses to 2-3 structured, concise bullet points or 1 short paragraph (max 110 words).

Farmer Context:
${JSON.stringify(produceContext || {}, null, 2)}

Recommendation Engine Output:
${JSON.stringify(recommendationData || {}, null, 2)}
`;

    // Try primary model with fallback to fast flash model on demand spikes
    let responseText = "";
    try {
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Farmer question: "${userQuery}". Please provide a helpful, decision-oriented explanation for this farmer based on the Net Realization calculations.`,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          },
        });
        responseText = response.text || "";
      }
    } catch (primaryErr: any) {
      console.warn("Primary Gemini call experienced high demand or error, trying fallback model:", primaryErr?.message);
      try {
        if (ai) {
          const fallbackAiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Farmer question: "${userQuery}". Give a concise 2-sentence explanation for this agricultural produce selling decision.`,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.2,
            },
          });
          responseText = fallbackAiResponse.text || "";
        }
      } catch (secondaryErr: any) {
        console.warn("All Gemini API models unavailable, falling back to rule-grounded decision engine:", secondaryErr?.message);
      }
    }

    if (responseText && responseText.trim().length > 0) {
      const structuredAdvice = {
        summary: responseText,
        explanation: responseText,
        recommendedOption: recommendationData?.recommendedOptionTitle || recommendationData?.recommendedOption?.title || "Direct Buyer",
        keyFactors: language === "hi"
          ? ["शुद्ध बैंक प्राप्ति (Net Realization)", "लॉजिस्टिक्स बचत", "एस्क्रो भुगतान गारंटी"]
          : ["Net Realization in Bank", "Optimized Logistics", "Escrow Settlement Security"],
        suggestedActions: language === "hi"
          ? ["डील लॉक करें", "पूल विकल्प देखें", "विस्तृत रिपोर्ट डाउनलोड करें"]
          : ["Lock Deal Contract", "View FPO Pooling", "Download Pitch Deck"],
      };
      return res.json({ advice: structuredAdvice, source: "gemini" });
    }

    // High quality domain fallback if Gemini is completely unavailable
    const fallbackAdvice = generateGroundedAgriAdvice(userQuery, produceContext, recommendationData, language);
    return res.json({ advice: fallbackAdvice, source: "rules_grounded_fallback" });
  } catch (error: any) {
    console.error("Gemini Advisor API caught error:", error);
    // Never fail with 500 when we can return domain-grounded calculated advice
    const fallbackAdvice = generateGroundedAgriAdvice(userQuery, produceContext, recommendationData, language);
    return res.json({ advice: fallbackAdvice, source: "safe_resilient_fallback" });
  }
});

// Vite Middleware & SPA Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (path.basename(filePath) === "index.html") {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fasalniti server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
