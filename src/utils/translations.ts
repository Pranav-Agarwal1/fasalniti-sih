import { Language } from '../types';

export const translations = {
  en: {
    // Brand & Header
    brandName: 'FASALNITI',
    tagline: 'Agricultural Market Decision Intelligence Platform',
    uspHeadline: "Don't just know the price. Know the best way to sell.",
    uspSubheading: 'Fasalniti analyzes buyer offers, mandis, transport freight, storage rent, counterparty risks, and collective pooling to maximize your expected net realization in hand.',
    farmerRole: 'Farmer Portal',
    buyerRole: 'Buyer Desk',
    fpoRole: 'FPO / Aggregation',
    adminRole: 'Intelligence Admin',
    findOptionCTA: 'Calculate Net Realization',
    imBuyerCTA: 'Post Buyer Demand',
    switchLang: 'हिन्दी में देखें',
    
    // Navigation
    navHome: 'Decision Home',
    navAddProduce: 'Analyze My Produce',
    navRecommendation: 'Smart Recommendation',
    navCompare: '4-Way Comparison',
    navAggregation: 'Farmer Pooling',
    navTrends: 'Market Intelligence',
    navLogistics: 'Freight Estimator',
    navDashboard: 'Farmer Dashboard',
    navBuyerPortal: 'Buyer Procurement',
    navAdmin: 'Platform Analytics',

    // Visual Flow
    flowTitle: 'The Fasalniti Decision Engine Flow',
    flowStep1: 'Your Produce',
    flowStep1Sub: 'Crop, Quantity, Moisture & Location',
    flowStep2: 'Market Intelligence',
    flowStep2Sub: 'Buyer Bids, APMC Mandis, Freight & Storage',
    flowStep3: 'Cost & Risk Deductions',
    flowStep3Sub: 'Transport, Mandi Cess, Hamali, Spoilage Risk',
    flowStep4: 'Net Realization',
    flowStep4Sub: 'Actual Take-Home Cash in Bank',
    flowStep5: 'Best Selling Decision',
    flowStep5Sub: 'Actionable Smart Strategy with Proof',

    // Form
    formTitle: 'Analyze Selling Options for Your Lot',
    formSubtitle: 'Enter your crop details to run the multi-channel economic engine.',
    cropLabel: 'Select Crop',
    quantityLabel: 'Quantity',
    unitQuintal: 'Quintals (1 Qtl = 100 kg)',
    unitTonnes: 'Tonnes (10 Qtl)',
    qualityLabel: 'Quality Grade',
    moistureLabel: 'Moisture Level (%)',
    locationLabel: 'Your District / Location',
    harvestDateLabel: 'Harvest / Availability Date',
    storageLabel: 'Do you have local storage / warehouse access?',
    minPriceLabel: 'Minimum Acceptable Price (₹/Qtl - Optional)',
    transportPrefLabel: 'Logistics Preference',
    analyzeButton: 'Calculate Best Selling Strategy',
    loadingCalculation: 'Evaluating Buyer Bids, APMC Mandis, Transport & Storage...',

    // Recommendation Screen
    recBadge: 'TOP RECOMMENDED SELLING STRATEGY',
    whyRecommended: 'Why is this recommended over other options?',
    netRealizationHeader: 'Expected Net Realization',
    grossValue: 'Gross Sale Value',
    totalDeductions: 'Total Deductions (Freight + Handling + Fees)',
    netInBank: 'Net Amount in Your Bank Account',
    netPerQtl: 'Effective Net Realization per Quintal',
    scoreLabel: 'Fasalniti Decision Score',
    advantageOverMandi: 'Extra Net Income vs Nearest Mandi',
    executeCTA: 'Accept Strategy & Lock Deal',
    viewCostBreakdown: 'View Itemized Cost Breakdown',
    askAiCTA: 'Ask AI Advisor About This Decision',

    // Selling Options Labels
    optBuyer: 'Option 1: Direct Corporate Buyer',
    optMandi: 'Option 2: APMC Mandi Auction',
    optAggregation: 'Option 3: Aggregate with Local Farmers',
    optStorage: 'Option 4: Store & Sell Later (Warehouse)',

    // Buyer Desk
    buyerTitle: 'Institutional & Corporate Buyer Desk',
    postDemand: 'Post New Procurement Bid',
    buyerLotsTitle: 'Live Verified Farmer Lots & Pools',
    reliabilityIndex: 'Buyer Trust & Reliability Index',
    avgPaymentSpeed: 'Avg Payment Settlement',
    fulfillmentScore: 'Fulfillment Track Record',

    // Aggregation
    aggTitle: 'Farmer Aggregation & Collective Bargaining',
    aggSubtitle: 'Combine smaller harvests into institutional full-truckload lots to cut transport costs by up to 45% and unlock bulk price premiums.',
    combinedLotSize: 'Potential Combined Pool',
    nearbyFarmersCount: 'Nearby Compatible Farmers in Your Cluster',
    unlockedAdvantage: 'Unlocked Institutional Advantage',
    joinPoolCTA: 'Join Cluster Pool & Save on Freight',

    // Market Trends
    trendsTitle: 'Actionable Market Intelligence',
    trendsSubtitle: 'Real-time price spreads between farmgate buyers and APMC Mandis with 30-day historical trajectories.',
    mspReference: 'Govt. Minimum Support Price (MSP)',
    mandiSpot: 'APMC Mandi Modal Price',
    buyerBid: 'Direct Farmgate Buyer Bid',
    whatToDoTitle: 'What Should I Do Today?',

    // Admin & Unit Economics
    adminTitle: 'Platform Command Center & Decision Analytics',
    scoringWeightsTitle: 'Recommendation Engine Weight Configuration',
    unitEconomicsTitle: 'Platform Unit Economics & GMV Breakdown',
    cacLabel: 'Farmer Acquisition Cost (CAC)',
    ltvLabel: 'Farmer Lifetime Value (LTV)',
    takeRateLabel: 'Average Take Rate',
    contributionMarginLabel: 'Contribution Margin',

    // AI Assistant
    aiAssistantTitle: 'Fasalniti AI Market Strategy Advisor',
    aiAssistantSubtitle: 'Powered by Google Gemini 3.7 Flash • Grounded strictly in real market equations',
    aiPlaceholder: 'Ask a decision question (e.g., Why not Mandi? Should I hold for 30 days?)...',
    aiQuickPrompt1: 'Why is the buyer recommended over the nearest Mandi?',
    aiQuickPrompt2: 'What is the financial risk if I store for 30 days?',
    aiQuickPrompt3: 'How much do I save if I aggregate with nearby farmers?',

    // Common
    rupee: '₹',
    perQtl: '/qtl',
    quintals: 'qtl',
    tonnes: 'Tonnes',
    km: 'km',
    days: 'days',
    verifiedBadge: 'Verified & Insured',
    close: 'Close',
    back: 'Back',
  },
  hi: {
    // Brand & Header
    brandName: 'फसलनीति',
    tagline: 'कृषि उपज विपणन निर्णय प्रणाली',
    uspHeadline: 'सिर्फ भाव मत जानिए। बेचने का सबसे सही तरीका जानिए।',
    uspSubheading: 'फसलनीति खरीदार के ऑफर, मंडी भाव, भाड़ा खर्च, भंडारण किराया, भुगतान जोखिम और किसान समूह तालमेल का सटीक विश्लेषण कर आपको बैंक खाते में अधिकतम शुद्ध कमाई (Net Realization) दिलाता है।',
    farmerRole: 'किसान पोर्टल',
    buyerRole: 'खरीदार डेस्क',
    fpoRole: 'एफपीओ / समूह',
    adminRole: 'प्रशासन एनालिटिक्स',
    findOptionCTA: 'शुद्ध कमाई की गणना करें',
    imBuyerCTA: 'खरीद मांग दर्ज करें',
    switchLang: 'Switch to English',

    // Navigation
    navHome: 'मुख्य पृष्ठ',
    navAddProduce: 'उपज का विश्लेषण',
    navRecommendation: 'सर्वोत्तम सिफारिश',
    navCompare: '4 विकल्पों की तुलना',
    navAggregation: 'किसान समूह पूल',
    navTrends: 'बाजार भाव रुझान',
    navLogistics: 'भाड़ा कैलकुलेटर',
    navDashboard: 'किसान डैशबोर्ड',
    navBuyerPortal: 'खरीदार खरीद',
    navAdmin: 'प्लेटफॉर्म एनालिटिक्स',

    // Visual Flow
    flowTitle: 'फसलनीति निर्णय इंजन की कार्यप्रणाली',
    flowStep1: 'आपकी उपज',
    flowStep1Sub: 'फसल, मात्रा, नमी व गांव की स्थिति',
    flowStep2: 'बाजार के सभी विकल्प',
    flowStep2Sub: 'सीधे खरीदार, मंडी भाव, भाड़ा व गोदाम',
    flowStep3: 'खर्चे व जोखिम की कटौती',
    flowStep3Sub: 'परिवहन, मंडी टैक्स, पल्लेदारी, छंटाई जोखिम',
    flowStep4: 'शुद्ध बचत व कमाई',
    flowStep4Sub: 'बैंक खाते में आने वाली वास्तविक राशि',
    flowStep5: 'सर्वश्रेष्ठ बेचने का निर्णय',
    flowStep5Sub: 'तथ्यों के साथ सबसे सुरक्षित व मुनाफेदार रास्ता',

    // Form
    formTitle: 'अपनी फसल के लिए सबसे मुनाफेदार तरीका खोजें',
    formSubtitle: 'अपनी फसल की जानकारी दर्ज करें और सभी 4 माध्यमों की शुद्ध कमाई जांचें।',
    cropLabel: 'फसल चुनें',
    quantityLabel: 'उपज की मात्रा',
    unitQuintal: 'क्विंटल (1 क्विंटल = 100 किग्रा)',
    unitTonnes: 'टन (10 क्विंटल)',
    qualityLabel: 'गुणवत्ता / ग्रेड',
    moistureLabel: 'नमी का स्तर (%)',
    locationLabel: 'आपका जिला / क्षेत्र',
    harvestDateLabel: 'कटाई / माल तैयार होने की तारीख',
    storageLabel: 'क्या आपके पास गोदाम/वेयरहाउस में रखने की सुविधा है?',
    minPriceLabel: 'न्यूनतम स्वीकार्य भाव (₹/क्विंटल - ऐच्छिक)',
    transportPrefLabel: 'परिवहन प्राथमिकता',
    analyzeButton: 'सर्वश्रेष्ठ बेचने की रणनीति देखें',
    loadingCalculation: 'खरीदार बोलियों, मंडी भाव, भाड़े व भंडारण लागत का विश्लेषण हो रहा है...',

    // Recommendation Screen
    recBadge: 'सबसे अधिक मुनाफेदार व सुरक्षित सिफारिश',
    whyRecommended: 'यह विकल्प अन्य विकल्पों से बेहतर क्यों है?',
    netRealizationHeader: 'अनुमानित शुद्ध कमाई (Net Realization)',
    grossValue: 'सकल बिक्री मूल्य',
    totalDeductions: 'कुल कटौती (भाड़ा + पल्लेदारी + टैक्स + जोखिम)',
    netInBank: 'आपके बैंक खाते में आने वाली शुद्ध रकम',
    netPerQtl: 'प्रति क्विंटल शुद्ध प्राप्ति',
    scoreLabel: 'फसलनीति निर्णय स्कोर',
    advantageOverMandi: 'नजदीकी मंडी की तुलना में अतिरिक्त शुद्ध लाभ',
    executeCTA: 'सिफारिश स्वीकारें व सौदा पक्का करें',
    viewCostBreakdown: 'खर्चों का पूरा ब्यौरा देखें',
    askAiCTA: 'एआई सलाहकार से पूछें',

    // Selling Options Labels
    optBuyer: 'विकल्प 1: सीधे सत्यापित खरीदार को बेचें',
    optMandi: 'विकल्प 2: एपीएमसी मंडी नीलामी',
    optAggregation: 'विकल्प 3: आस-पास के किसानों के साथ मिलकर बेचें',
    optStorage: 'विकल्प 4: भंडारण करें और बाद में बेचें',

    // Buyer Desk
    buyerTitle: 'संस्थागत एवं कॉर्पोरेट खरीदार पोर्टल',
    postDemand: 'नया खरीद कोटेशन पोस्ट करें',
    buyerLotsTitle: 'उपलब्ध सत्यापित किसान लॉट एवं समूह',
    reliabilityIndex: 'खरीदार विश्वसनीयता स्कोर',
    avgPaymentSpeed: 'औसत भुगतान अवधि',
    fulfillmentScore: 'सफल लेनदेन दर',

    // Aggregation
    aggTitle: 'किसान समूहन (Farmer Aggregation) एवं सामूहिक मोलभाव',
    aggSubtitle: 'छोटे लॉट को मिलाकर बड़ा ट्रक लॉट बनाएं और परिवहन खर्च 45% तक घटाकर बड़े संस्थागत खरीदारों से प्रीमियम भाव पाएं।',
    combinedLotSize: 'संभावित संयुक्त लॉट साइज',
    nearbyFarmersCount: 'आपके इलाके के अन्य किसान',
    unlockedAdvantage: 'सामूहिक लाभ',
    joinPoolCTA: 'समूह पूल में शामिल हों और भाड़ा बचाएं',

    // Market Trends
    trendsTitle: 'बाजार भाव एवं रुझान विश्लेषण',
    trendsSubtitle: 'खेत पर सीधे भाव और मंडी भाव का 30-दिवसीय तुलनात्मक अध्ययन।',
    mspReference: 'सरकारी न्यूनतम समर्थन मूल्य (MSP)',
    mandiSpot: 'मंडी का आज का औसत भाव',
    buyerBid: 'सीधे खरीदार की बोली',
    whatToDoTitle: 'आज किसान को क्या करना चाहिए?',

    // Admin & Unit Economics
    adminTitle: 'कमांड सेंटर एवं निर्णय विश्लेषण',
    scoringWeightsTitle: 'सिफारिश एल्गोरिदम वेटेज विन्यास',
    unitEconomicsTitle: 'यूनिट इकोनॉमिक्स एवं जीएमवी',
    cacLabel: 'किसान अधिग्रहण लागत (CAC)',
    ltvLabel: 'किसान आजीवन मूल्य (LTV)',
    takeRateLabel: 'प्लेटफॉर्म कमीशन दर',
    contributionMarginLabel: 'कंट्रीब्यूशन मार्जिन',

    // AI Assistant
    aiAssistantTitle: 'फसलनीति एआई कृषि बाजार सलाहकार',
    aiAssistantSubtitle: 'गूगल जेमिनी 3.7 फ्लैश द्वारा संचालित • पूर्णतः वित्तीय गणित पर आधारित',
    aiPlaceholder: 'निर्णय संबंधी सवाल पूछें (उदा. मंडी क्यों नहीं? क्या 30 दिन रोकना ठीक है?)...',
    aiQuickPrompt1: 'नजदीकी मंडी की जगह यह खरीदार क्यों बेहतर है?',
    aiQuickPrompt2: 'अगर मैं 30 दिन फसल स्टोर करूं तो क्या वित्तीय जोखिम है?',
    aiQuickPrompt3: 'पड़ोसी किसानों के साथ माल मिलाने पर कितनी बचत होगी?',

    // Common
    rupee: '₹',
    perQtl: '/क्विंटल',
    quintals: 'क्विंटल',
    tonnes: 'टन',
    km: 'किमी',
    days: 'दिन',
    verifiedBadge: 'सत्यापित एवं सुरक्षित',
    close: 'बंद करें',
    back: 'वापस',
  }
};
