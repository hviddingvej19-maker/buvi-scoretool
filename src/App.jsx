import React, { useMemo, useState } from "react";

const SCORE_LEVELS = [0, 3, 6, 9, 12];

const DATA_CONFIDENCE_DESCRIPTIONS = {
  1: "Meget svagt datagrundlag: scoren bygger primært på mavefornemmelse, generelle antagelser eller AI-estimat uden konkret virksomhedsdata.",
  2: "Svagt datagrundlag: der findes enkelte oplysninger eller erfaringstal, men centrale forudsætninger mangler stadig at blive dokumenteret.",
  3: "Rimeligt datagrundlag: de vigtigste antagelser er kendte, og scoren kan forklares, men der mangler stadig validering eller præcise målinger.",
  4: "Godt datagrundlag: scoren bygger på konkrete data, relevante kilder og tydelige antagelser, men er ikke nødvendigvis verificeret eksternt.",
  5: "Stærkt datagrundlag: scoren er dokumenteret, sporbar og kan efterprøves af ledelse, kunde eller ekstern part.",
};

const STORAGE_KEY = "buvi-scoretool-workshop-v3-multiple-assessments";

const BRANDING = {
  organization: {
    name: "ProBalance ApS",
    shortName: "ProBalance",
    website: "https://probalance.dk",
    logo: {
      src: "probalance-logo.png",
      alt: "ProBalance logo",
      fallbackText: "ProBalance",
      note: "Læg højopløst logo i public/probalance-logo.png. Alternativt kan src ændres til /probalance-logo.svg, hvis logoet findes som SVG.",
    },
  },
  facilitator: {
    name: "Christian Rasmussen",
    title: "Bæredygtighed, forretningsudvikling og AI-understøttede workshopværktøjer",
    email: "christian@probalance.dk",
    phone: "+45 20 31 01 65",
    phoneRaw: "+4520310165",
    linkedin: "https://www.linkedin.com/in/rasmussen-christian",
  },
  tool: {
    name: "BUVI/OxF scoringsværktøj",
    subtitle: "Konfigurerbart workshopværktøj til vurdering af bæredygtighedsinitiativer",
    version: "v0.3.11-remove-navigation-artifacts",
    context: "Udviklet til workshopbrug i BUVI bæredygtighedsnetværket",
  },
  output: {
    preparedByLabel: "Udarbejdet af",
    contactLabel: "Kontakt",
    confidentialityNote: "Vurderingen er et workshopbaseret beslutningsgrundlag. Data gemmes lokalt i brugerens browser og deles kun, hvis brugeren selv eksporterer eller kopierer indholdet.",
    decisionSupportNote: "Scoren er beslutningsstøtte og bør kvalificeres med dialog, datagrundlag og virksomhedens egne prioriteringer.",
  },
};

const SHARE_LINK = {
  canonicalUrl: "https://hviddingvej19-maker.github.io/buvi-scoretool/",
  shortUrl: "https://probalance.dk/buvi",
  displayShortUrl: "probalance.dk/buvi",
  qrTargetUrl: "https://hviddingvej19-maker.github.io/buvi-scoretool/",
  redirectStatus: "Planlagt redirect",
  redirectNote: "Når redirectet på probalance.dk/buvi er aktivt, kan qrTargetUrl ændres til shortUrl, så QR-koden peger på den pæne adresse.",
};

const SECTION_THEMES = {
  configuration: {
    card: "border-l-4 border-l-sky-400 bg-sky-50/30",
    soft: "bg-sky-50 ring-sky-200",
    icon: "bg-sky-100 text-sky-800 ring-sky-200",
    label: "Konfiguration",
  },
  engine: {
    card: "border-l-4 border-l-slate-400 bg-slate-50/40",
    soft: "bg-slate-100 ring-slate-200",
    icon: "bg-slate-100 text-slate-800 ring-slate-200",
    label: "Motor",
  },
  standardLogic: {
    card: "border-l-4 border-l-violet-400 bg-violet-50/30",
    soft: "bg-violet-50 ring-violet-200",
    icon: "bg-violet-100 text-violet-800 ring-violet-200",
    label: "Standardlogik",
  },
  factorDescriptions: {
    card: "border-l-4 border-l-amber-400 bg-amber-50/30",
    soft: "bg-amber-50 ring-amber-200",
    icon: "bg-amber-100 text-amber-800 ring-amber-200",
    label: "Fælles beskrivelser",
  },
  scoring: {
    card: "border-l-4 border-l-emerald-400 bg-emerald-50/30",
    soft: "bg-emerald-50 ring-emerald-200",
    icon: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    label: "Initiativscoring",
  },
  result: {
    card: "border-l-4 border-l-blue-400 bg-blue-50/30",
    soft: "bg-blue-50 ring-blue-200",
    icon: "bg-blue-100 text-blue-800 ring-blue-200",
    label: "Resultat",
  },
  gates: {
    card: "border-l-4 border-l-rose-400 bg-rose-50/30",
    soft: "bg-rose-50 ring-rose-200",
    icon: "bg-rose-100 text-rose-800 ring-rose-200",
    label: "Gates",
  },
};

function createAssessmentId() {
  return `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAssessment(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: overrides.id || createAssessmentId(),
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    companyId: overrides.companyId || "nybo",
    initiativeType: overrides.initiativeType || "produkt_cirkularitet",
    maturity: overrides.maturity || "workshop",
    initiativeName: overrides.initiativeName || "Take-back og reparation af arbejdstøj for udvalgte kunder",
    initiativeLink: overrides.initiativeLink || "",
    anchorStyle: overrides.anchorStyle || "absolute",
    scores: overrides.scores || {},
    overallNotes: overrides.overallNotes || "",
  };
}

function cloneAssessment(assessment, nameSuffix = " (kopi)") {
  const now = new Date().toISOString();
  return createAssessment({
    ...assessment,
    id: createAssessmentId(),
    createdAt: now,
    updatedAt: now,
    initiativeName: `${assessment.initiativeName || "Initiativ"}${nameSuffix}`,
    scores: JSON.parse(JSON.stringify(assessment.scores || {})),
  });
}

function getInitialWorkshopState(savedState) {
  const savedAssessments = Array.isArray(savedState?.assessments) ? savedState.assessments.filter(Boolean) : [];
  if (savedAssessments.length > 0) {
    const normalized = savedAssessments.map((assessment) => createAssessment(assessment));
    const activeAssessmentId = normalized.some((assessment) => assessment.id === savedState?.activeAssessmentId) ? savedState.activeAssessmentId : normalized[0].id;
    return { assessments: normalized, activeAssessmentId };
  }

  const legacyActive = savedState?.activeAssessment;
  const fallbackAssessment = createAssessment(legacyActive || {});
  return { assessments: [fallbackAssessment], activeAssessmentId: fallbackAssessment.id };
}

function loadSavedWorkshopState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.warn("Kunne ikke indlæse lokal BUVI-data", error);
    return null;
  }
}

function saveWorkshopState(state) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
    return true;
  } catch (error) {
    console.warn("Kunne ikke gemme lokal BUVI-data", error);
    return false;
  }
}

function clearSavedWorkshopState() {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn("Kunne ikke nulstille lokal BUVI-data", error);
    return false;
  }
}

const companies = [
  { id: "business_viborg", name: "Business Viborg", package: "erhvervsfremme_netvaerk", label: "Erhvervsfremme / netværk / rådgivning / workshopfacilitering" },
  { id: "fredborg", name: "Fredborg A/S", package: "byggeri_anlaeg", label: "Byggeri / erhvervsbyggeri" },
  { id: "geovent", name: "Geovent A/S", package: "tekniske_produkter", label: "Industriel ventilation / tekniske produkter" },
  { id: "himmerland", name: "Himmerlandskød A/S", package: "foedevarer", label: "Fødevarer / kødforædling" },
  { id: "jema", name: "JEMA AGRO A/S", package: "produktion_agro", label: "Agro / maskin- og udstyrsproduktion" },
  { id: "kematek", name: "KEMATEK Danmark ApS", package: "kemi_industri", label: "Industriel kemi / smøremidler" },
  { id: "kloak", name: "Kloak Ekspressen", package: "kloak_miljoe", label: "Kloakservice / miljøteknik" },
  { id: "myrthue", name: "Myrthue A/S Tømrer & Snedker", package: "byggeri_anlaeg", label: "Tømrer / snedker / byggeri" },
  { id: "nybo", name: "Nybo Workwear A/S", package: "tekstil_workwear", label: "Tekstil / arbejdstøj" },
  { id: "tjele", name: "Tjele Entreprenør Forretning", package: "byggeri_anlaeg", label: "Entreprenør / anlæg / kloak" },
];

const initiativeTypes = [
  { id: "energi_drift", name: "Energi og drift", hint: "Varmepumpe, LED, procesenergi, køl, trykluft, varmegenvinding" },
  { id: "flaade_transport", name: "Flåde og transport", hint: "Elbiler, ruteoptimering, brændstof, maskiner, servicekørsel" },
  { id: "materialer_spild", name: "Materialer og spild", hint: "Affald, råvarer, procesoptimering, genbrug, materialeskift" },
  { id: "produkt_cirkularitet", name: "Produkt og cirkularitet", hint: "Reparation, take-back, levetid, service-/returmodeller" },
  { id: "esg_data", name: "ESG-data og rapportering", hint: "Datakilder, dokumentation, klimaregnskab, leverandørdata" },
  { id: "klimakommunikation", name: "Klimakommunikation", hint: "Grønne udsagn, hjemmeside, salgsargumenter, dokumentationskrav" },
  { id: "arbejdsmiljoe_social", name: "Arbejdsmiljø og social bæredygtighed", hint: "Sikkerhed, trivsel, inklusion, kompetencer, lokale effekter" },
];

const maturityOptions = [
  { id: "screening", name: "Hurtig screening", factorLimit: 8, hint: "Få faktorer, hurtigt overblik, høj usikkerhed accepteres" },
  { id: "workshop", name: "Workshop – fælles vurdering og dialog", factorLimit: 12, hint: "God balance mellem dialog, scoring og konkret næste skridt" },
  { id: "business_case", name: "Business case – bedre data og økonomi", factorLimit: 16, hint: "Flere faktorer, tydeligere datakrav og økonomisk vurdering" },
  { id: "kommunikation", name: "Kommunikation / rapportering", factorLimit: 14, hint: "Dokumentation, verificerbarhed og greenwashing-risiko vægtes højere" },
];

const anchorStyleOptions = [
  {
    id: "absolute",
    name: "Absolutte scoregrænser",
    hint: "Bruges når score 6 kan beskrives med et konkret tal, fx 10 tons CO2e, 50.000 kr. eller 30 dage. Score 0, 3, 9 og 12 beregnes automatisk ud fra score 6-niveauet.",
  },
  {
    id: "relative",
    name: "Relative forbedringer",
    hint: "Bruges når effekten bedst beskrives som forbedring i forhold til baseline, fx procentvis reduktion eller forbedring.",
  },
  {
    id: "general",
    name: "Generelle vurderingsbeskrivelser",
    hint: "Bruges tidligt i workshoppen, når der ikke er nok data til talgrænser endnu.",
  },
  {
    id: "documentation",
    name: "Dokumentationssprog",
    hint: "Bruges når vurderingen især skal handle om dokumentation, sporbarhed og om scoren kan forklares eksternt.",
  },
];

const coreFactors = [
  { id: "co2", dim: "Værdi", name: "CO2- og miljøeffekt", tags: ["core", "klima"], weight: 1.15, anchor0: "Negativ eller udokumenteret miljøeffekt", anchor12: ">30 % forbedring eller transformativ effekt" },
  { id: "opex", dim: "Værdi", name: "Driftsøkonomisk effekt", tags: ["core", "økonomi"], weight: 1.05, anchor0: "Øger driftsomkostninger uden gevinst", anchor12: "Meget kort tilbagebetaling eller markant OPEX-besparelse" },
  { id: "strategi", dim: "Værdi", name: "Regulatorisk og strategisk relevans", tags: ["core", "compliance"], weight: 1.0, anchor0: "Modarbejder strategi eller skaber risiko", anchor12: "Nødvendigt for lovkrav eller strategisk nøgleprioritet" },
  { id: "kundevaerdi", dim: "Værdi", name: "Kundeværdi", tags: ["core", "marked"], weight: 0.95, anchor0: "Negativ eller ingen kundeeffekt", anchor12: "Afgørende for markedsadgang eller differentiering" },
  { id: "kapacitet", dim: "Gennemførlighed", name: "Intern kapacitet og viden", tags: ["core", "organisation"], weight: 1.0, anchor0: "Ingen relevante kompetencer", anchor12: "Fuld kapacitet og kompetence er til stede" },
  { id: "investering", dim: "Gennemførlighed", name: "Investeringsbyrde", tags: ["core", "økonomi"], weight: 1.05, anchor0: "Urealistisk investering ift. økonomisk kapacitet", anchor12: "Ingen eller minimal investering krævet" },
  { id: "teknisk", dim: "Gennemførlighed", name: "Teknisk modenhed", tags: ["core", "teknik"], weight: 0.95, anchor0: "Uprøvet løsning med høj usikkerhed", anchor12: "Standardiseret og fuldt afprøvet løsning" },
  { id: "data", dim: "Gennemførlighed", name: "Datakvalitet og dokumentation", tags: ["core", "data"], weight: 1.15, anchor0: "Ingen data eller dokumentation", anchor12: "Stærke, sporbare og verificerbare data" },
];

const moduleFactors = {
  energi_drift: [
    { id: "energi", dim: "Værdi", name: "Energiforbrug", tags: ["energi", "klima"], weight: 1.2, anchor0: "Ingen målbar energiforbedring", anchor12: "Stor og dokumenterbar energireduktion" },
    { id: "driftsforstyrrelse", dim: "Gennemførlighed", name: "Driftsforstyrrelse", tags: ["drift"], weight: 0.95, anchor0: "Kræver lang nedetid eller høj produktionsrisiko", anchor12: "Kan gennemføres uden væsentlig driftsforstyrrelse" },
    { id: "tilbagebetaling", dim: "Værdi", name: "Tilbagebetalingstid", tags: ["økonomi"], weight: 1.05, anchor0: ">7 år eller ukendt", anchor12: "<1 år eller meget sikker økonomisk gevinst" },
  ],
  flaade_transport: [
    { id: "braendstof", dim: "Værdi", name: "Brændstof-/energiforbrug", tags: ["transport", "energi"], weight: 1.15, anchor0: "Ingen reduktion", anchor12: "Markant reduktion i energi pr. km/opgave" },
    { id: "asset", dim: "Gennemførlighed", name: "Asset-levetid og udskiftningscyklus", tags: ["transport"], weight: 0.95, anchor0: "Udskiftning sker på dårligt tidspunkt", anchor12: "Passer perfekt med naturlig udskiftning" },
    { id: "infrastruktur", dim: "Gennemførlighed", name: "Ladning / infrastruktur / forsyning", tags: ["transport", "drift"], weight: 1.05, anchor0: "Kritisk flaskehals", anchor12: "Infrastruktur er klar og driftssikker" },
  ],
  materialer_spild: [
    { id: "ressourcer", dim: "Værdi", name: "Ressourceforbrug", tags: ["materialer"], weight: 1.2, anchor0: "Øger ressourceforbruget", anchor12: "Reducerer råvareforbrug markant" },
    { id: "affald", dim: "Værdi", name: "Affaldsgenerering", tags: ["affald"], weight: 1.05, anchor0: "Mere affald eller vanskeligere bortskaffelse", anchor12: "Markant mindre affald eller højere genanvendelse" },
    { id: "procesfit", dim: "Gennemførlighed", name: "Procesfit", tags: ["produktion", "drift"], weight: 0.95, anchor0: "Kræver grundlæggende procesændring", anchor12: "Passer direkte i eksisterende proces" },
  ],
  produkt_cirkularitet: [
    { id: "levetid", dim: "Værdi", name: "Levetidsforlængelse", tags: ["cirkularitet", "produkt"], weight: 1.15, anchor0: "Ingen levetidsforlængelse", anchor12: "Levetid forlænges markant og dokumenterbart" },
    { id: "returflow", dim: "Gennemførlighed", name: "Returflow og take-back-infrastruktur", tags: ["cirkularitet", "logistik"], weight: 1.1, anchor0: "Ingen returproces", anchor12: "Integreret take-back med data, sortering og partnerflow" },
    { id: "cirkulaer_model", dim: "Værdi", name: "Cirkulær forretningsmodelværdi", tags: ["cirkularitet", "marked"], weight: 1.05, anchor0: "Ingen forretningsmæssig kobling", anchor12: "Ny eller stærkt forbedret cirkulær forretningsmodel" },
    { id: "sporbarhed", dim: "Gennemførlighed", name: "Sporbarhed", tags: ["data", "produkt"], weight: 1.0, anchor0: "Ingen sporbarhed", anchor12: "Sporbarhed på produkt-, materiale- og kunde-/batchniveau" },
  ],
  esg_data: [
    { id: "kildedokumentation", dim: "Gennemførlighed", name: "Kildedokumentation", tags: ["data", "rapportering"], weight: 1.2, anchor0: "Kilder mangler eller er usikre", anchor12: "Kilder er dokumenterede, sporbare og ajourførte" },
    { id: "esrs", dim: "Værdi", name: "Rapporteringsegnethed", tags: ["rapportering", "compliance"], weight: 1.05, anchor0: "Kan ikke bruges i ESG-opgørelse", anchor12: "Direkte anvendeligt i ESG-/kunderapportering" },
    { id: "systematik", dim: "Gennemførlighed", name: "Dataflow og systematik", tags: ["data", "proces"], weight: 1.0, anchor0: "Manuel, usikker og personafhængig proces", anchor12: "Stabilt dataflow med ansvar, frekvens og kontrol" },
  ],
  klimakommunikation: [
    { id: "greenwashing", dim: "Gennemførlighed", name: "Greenwashing-risiko", tags: ["kommunikation", "compliance"], weight: 1.25, anchor0: "Høj risiko for vildledende udsagn", anchor12: "Udsagn er konkrete, præcise og dokumenterede" },
    { id: "kommunikationsvaerdi", dim: "Værdi", name: "Kommunikationsværdi", tags: ["kommunikation", "marked"], weight: 0.9, anchor0: "Lav eller negativ kommunikationsværdi", anchor12: "Stærk og troværdig fortælling med høj relevans" },
    { id: "verificerbarhed", dim: "Gennemførlighed", name: "Verificerbarhed", tags: ["data", "kommunikation"], weight: 1.15, anchor0: "Kan ikke efterprøves", anchor12: "Kan kontrolleres af tredjepart eller kunde" },
  ],
  arbejdsmiljoe_social: [
    { id: "arbejdsmiljoe", dim: "Værdi", name: "Arbejdsmiljø og sikkerhed", tags: ["social", "arbejdsmiljø"], weight: 1.15, anchor0: "Forringer arbejdsmiljø eller sikkerhed", anchor12: "Markant og dokumenterbar forbedring" },
    { id: "kompetencer", dim: "Gennemførlighed", name: "Kompetencebehov", tags: ["organisation"], weight: 0.95, anchor0: "Kræver omfattende ny kompetencebase", anchor12: "Kan løftes med eksisterende kompetencer" },
    { id: "medarbejderaccept", dim: "Gennemførlighed", name: "Medarbejderaccept", tags: ["social", "organisation"], weight: 1.0, anchor0: "Forventet modstand", anchor12: "Stærk accept og tydeligt ejerskab" },
  ],
};

const industryBoosts = {
  erhvervsfremme_netvaerk: ["esg_data", "klimakommunikation", "arbejdsmiljoe_social"],
  byggeri_anlaeg: ["materialer_spild", "arbejdsmiljoe_social", "klimakommunikation"],
  tekniske_produkter: ["energi_drift", "produkt_cirkularitet", "esg_data"],
  foedevarer: ["energi_drift", "materialer_spild", "esg_data"],
  produktion_agro: ["energi_drift", "materialer_spild", "produkt_cirkularitet"],
  kemi_industri: ["materialer_spild", "esg_data", "klimakommunikation"],
  kloak_miljoe: ["flaade_transport", "arbejdsmiljoe_social", "esg_data"],
  tekstil_workwear: ["produkt_cirkularitet", "materialer_spild", "klimakommunikation"],
};

const defaultCenterConfigs = {
  co2: { kind: "number", centerValue: 10, unit: "tons CO2e/år", direction: "higherBetter", centerText: "Score 6 svarer til en dokumenteret CO2-reduktion på ca. 10 tons CO2e pr. år." },
  energi: { kind: "number", centerValue: 50000, unit: "kWh/år", direction: "higherBetter", centerText: "Score 6 svarer til en dokumenteret energireduktion på ca. 50.000 kWh pr. år." },
  opex: { kind: "number", centerValue: 50000, unit: "kr./år", direction: "higherBetter", centerText: "Score 6 svarer til en årlig driftsøkonomisk forbedring på ca. 50.000 kr." },
  tilbagebetaling: { kind: "number", centerValue: 36, unit: "måneder", direction: "lowerBetter", centerText: "Score 6 svarer til en tilbagebetalingstid på ca. 36 måneder." },
  investering: { kind: "number", centerValue: 250000, unit: "kr. investering", direction: "lowerBetter", centerText: "Score 6 svarer til en betydelig, men håndterbar investering på ca. 250.000 kr." },
  driftsforstyrrelse: { kind: "number", centerValue: 2, unit: "dages driftsstop", direction: "lowerBetter", centerText: "Score 6 svarer til en håndterbar driftsforstyrrelse på ca. 2 dage." },
  braendstof: { kind: "number", centerValue: 5000, unit: "liter diesel/år", direction: "higherBetter", centerText: "Score 6 svarer til en dokumenteret reduktion på ca. 5.000 liter diesel pr. år." },
  ressourcer: { kind: "number", centerValue: 1000, unit: "kg materialer/år", direction: "higherBetter", centerText: "Score 6 svarer til en materialereduktion på ca. 1.000 kg pr. år." },
  affald: { kind: "number", centerValue: 1000, unit: "kg affald/år", direction: "higherBetter", centerText: "Score 6 svarer til en affaldsreduktion eller øget genanvendelse på ca. 1.000 kg pr. år." },
  levetid: { kind: "number", centerValue: 12, unit: "måneders levetidsforlængelse", direction: "higherBetter", centerText: "Score 6 svarer til en gennemsnitlig levetidsforlængelse på ca. 12 måneder." },
};

const qualitativeCenterTexts = {
  strategi: "Score 6 betyder, at initiativet understøtter virksomhedens ESG-struktur og strategi, men ikke er et krav eller en nøgleprioritet.",
  kundevaerdi: "Score 6 betyder, at initiativet skaber tydelig værdi for nogle kunder, men ikke er afgørende for salg eller markedsadgang.",
  kapacitet: "Score 6 betyder, at virksomheden har delvis erfaring og kan gennemføre initiativet med begrænset ekstern støtte.",
  teknisk: "Score 6 betyder, at løsningen er afprøvet andre steder, men kræver tilpasning eller pilot i virksomheden.",
  data: "Score 6 betyder, at der findes et rimeligt datagrundlag, men at dele af dokumentationen stadig skal forbedres.",
  asset: "Score 6 betyder, at initiativet nogenlunde passer med eksisterende udskiftningsplaner, men ikke perfekt.",
  infrastruktur: "Score 6 betyder, at infrastruktur kan etableres med almindelig planlægning og enkelte praktiske afklaringer.",
  procesfit: "Score 6 betyder, at initiativet kræver tilpasninger, men kan rummes i den eksisterende proces.",
  returflow: "Score 6 betyder, at der kan gennemføres pilot med udvalgte kunder, enkel sortering og manuel registrering.",
  cirkulaer_model: "Score 6 betyder, at initiativet kan styrke forretningen, men endnu ikke er en fuld cirkulær forretningsmodel.",
  sporbarhed: "Score 6 betyder, at sporbarhed er mulig for centrale data, men ikke fuldt integreret på produkt-, materiale- og kundeniveau.",
  kildedokumentation: "Score 6 betyder, at centrale kilder er identificeret, men at sporbarhed og kvalitetssikring stadig skal forbedres.",
  esrs: "Score 6 betyder, at data kan bruges i intern ESG-struktur, men kræver bearbejdning før ekstern rapportering.",
  systematik: "Score 6 betyder, at dataflowet kan gentages, men stadig er delvist manuelt og personafhængigt.",
  greenwashing: "Score 6 betyder, at udsagnet kan gøres ansvarligt, hvis det præciseres og dokumenteres bedre.",
  kommunikationsvaerdi: "Score 6 betyder, at initiativet er relevant at kommunikere om, men ikke stærkt nok som selvstændig hovedfortælling.",
  verificerbarhed: "Score 6 betyder, at udsagnet kan efterprøves internt, men kræver bedre dokumentation før ekstern kontrol.",
  arbejdsmiljoe: "Score 6 betyder, at initiativet giver en konkret, men begrænset forbedring af arbejdsmiljø eller sikkerhed.",
  kompetencer: "Score 6 betyder, at der kræves noget opkvalificering, men at initiativet kan løftes med eksisterende organisation.",
  medarbejderaccept: "Score 6 betyder, at der forventes blandet, men håndterbar medarbejderaccept.",
};

function uniqueById(list) {
  const map = new Map();
  list.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function getDimensionCounts(factors) {
  const value = factors.filter((factor) => factor.dim === "Værdi").length;
  const feasibility = factors.filter((factor) => factor.dim === "Gennemførlighed").length;
  const difference = Math.abs(value - feasibility);
  return { value, feasibility, difference, isBalanced: difference <= 1 };
}

function groupFactorsByDimension(factors) {
  return {
    value: factors.filter((factor) => factor.dim === "Værdi"),
    feasibility: factors.filter((factor) => factor.dim === "Gennemførlighed"),
  };
}

function priorityScore(candidates, count, priorityMap) {
  return candidates.slice(0, count).reduce((sum, factor) => sum + (priorityMap.get(factor.id) || 0), 0);
}

function buildBalancedFactorList(sortedFactors, factorLimit) {
  const valueCandidates = sortedFactors.filter((factor) => factor.dim === "Værdi");
  const feasibilityCandidates = sortedFactors.filter((factor) => factor.dim === "Gennemførlighed");
  const priorityMap = new Map(sortedFactors.map((factor, index) => [factor.id, sortedFactors.length - index]));
  const maxTotal = Math.min(factorLimit, sortedFactors.length);
  let best = null;

  for (let total = maxTotal; total >= 0; total -= 1) {
    for (let valueCount = 0; valueCount <= total; valueCount += 1) {
      const feasibilityCount = total - valueCount;
      const isValid = Math.abs(valueCount - feasibilityCount) <= 1 && valueCount <= valueCandidates.length && feasibilityCount <= feasibilityCandidates.length;
      if (!isValid) continue;
      const score = priorityScore(valueCandidates, valueCount, priorityMap) + priorityScore(feasibilityCandidates, feasibilityCount, priorityMap);
      if (!best || score > best.score) best = { valueCount, feasibilityCount, score, total };
    }
    if (best) break;
  }

  if (!best) return sortedFactors.slice(0, factorLimit);

  const selectedValueIds = new Set(valueCandidates.slice(0, best.valueCount).map((factor) => factor.id));
  const selectedFeasibilityIds = new Set(feasibilityCandidates.slice(0, best.feasibilityCount).map((factor) => factor.id));
  return sortedFactors.filter((factor) => (factor.dim === "Værdi" ? selectedValueIds.has(factor.id) : selectedFeasibilityIds.has(factor.id)));
}

function buildFactors(companyPackage, initiativeType, factorLimit) {
  const boostedModules = industryBoosts[companyPackage] || [];
  const direct = moduleFactors[initiativeType] || [];
  const industry = boostedModules.flatMap((id) => moduleFactors[id] || []).map((factor) => ({ ...factor, weight: factor.weight * 0.9 }));
  const directIds = new Set(direct.map((factor) => factor.id));
  const sortedFactors = uniqueById([...coreFactors, ...direct, ...industry]).sort((a, b) => {
    const directA = directIds.has(a.id) ? 1 : 0;
    const directB = directIds.has(b.id) ? 1 : 0;
    if (directA !== directB) return directB - directA;
    if (a.dim !== b.dim) return a.dim === "Værdi" ? -1 : 1;
    return b.weight - a.weight;
  });
  return buildBalancedFactorList(sortedFactors, factorLimit);
}

function getDefaultCenterConfig(factor) {
  if (defaultCenterConfigs[factor.id]) return defaultCenterConfigs[factor.id];
  return {
    kind: "text",
    centerText: qualitativeCenterTexts[factor.id] || `Score 6 betyder, at ${factor.name.toLowerCase()} er relevant og håndterbar, men ikke stærk eller transformativ.`,
    direction: "higherBetter",
  };
}

function createAnchorConfigBank(configsByFactorId = {}) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    configsByFactorId: configsByFactorId || {},
  };
}

function getAnchorConfigFromBank(anchorConfigBank, factor) {
  const configsByFactorId = anchorConfigBank?.configsByFactorId || {};
  return { ...getDefaultCenterConfig(factor), ...(configsByFactorId[factor.id] || {}) };
}

function getFactorAnchorStyle(anchorConfigBank, factor, fallbackAnchorStyle = "general") {
  const config = anchorConfigBank?.configsByFactorId?.[factor.id];
  return config?.anchorStyle || fallbackAnchorStyle || "general";
}

function updateFactorAnchorStyle(anchorConfigBank, factorId, nextAnchorStyle) {
  const existingConfig = anchorConfigBank?.configsByFactorId?.[factorId] || {};
  return updateAnchorConfigBank(anchorConfigBank, factorId, { ...existingConfig, anchorStyle: nextAnchorStyle });
}

function updateAnchorConfigBank(anchorConfigBank, factorId, nextConfig) {
  return {
    version: anchorConfigBank?.version || 1,
    updatedAt: new Date().toISOString(),
    configsByFactorId: {
      ...(anchorConfigBank?.configsByFactorId || {}),
      [factorId]: nextConfig,
    },
  };
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 }).format(number);
}

function rangeText(from, to, unit) {
  return `${formatNumber(from)}-${formatNumber(to)} ${unit}`;
}

function makeAbsoluteCenterText(factor, config) {
  if (config.kind !== "number") return config.centerText || getDefaultCenterConfig(factor).centerText;
  const centerValue = Math.max(0, Number(config.centerValue) || 0);
  const unit = config.unit || "enheder";
  const valueText = `${formatNumber(centerValue)} ${unit}`;
  if (config.direction === "lowerBetter") return `Score 6 svarer til et håndterbart midterniveau på ca. ${valueText}. Lavere niveauer scorer højere, fordi byrden er mindre.`;
  return `Score 6 svarer til en relevant og målbar effekt på ca. ${valueText}. Højere niveauer scorer højere, fordi effekten er større.`;
}

function makeCenterStatement(factor, config, anchorStyle) {
  if (anchorStyle === "absolute") return makeAbsoluteCenterText(factor, config);
  if (anchorStyle === "relative") return `Score 6 betyder, at ${factor.name.toLowerCase()} ligger på et relevant midterniveau i forhold til baseline, typisk en tydelig, men ikke markant, forbedring.`;
  if (anchorStyle === "documentation") return `Score 6 betyder, at ${factor.name.toLowerCase()} kan forklares med et rimeligt datagrundlag, men at dokumentation, sporbarhed eller validering stadig bør forbedres.`;
  return `Score 6 betyder, at ${factor.name.toLowerCase()} er relevant og vurderbar, men ikke stærk, kritisk eller transformativ.`;
}

function buildAbsoluteAnchors(factor, config) {
  const centerText = makeCenterStatement(factor, config, "absolute");
  if (config.kind !== "number") {
    return {
      0: `Klart under center: ${factor.anchor0}`,
      3: "Svagt niveau. Der er kun begrænset effekt, modenhed eller dokumentation.",
      6: centerText,
      9: "Stærkt niveau. Initiativet ligger tydeligt over centerbeskrivelsen og kan forsvares med konkrete observationer.",
      12: `Meget stærkt niveau: ${factor.anchor12}`,
    };
  }
  const c = Math.max(0, Number(config.centerValue) || 0);
  const unit = config.unit || "enheder";
  if (config.direction === "lowerBetter") {
    return {
      0: `Meget tungt niveau: over ${formatNumber(c * 4)} ${unit}.`,
      3: `Tungt niveau: ca. ${rangeText(c * 2, c * 4, unit)}.`,
      6: centerText,
      9: `Let niveau: ca. ${rangeText(c * 0.25, c * 0.5, unit)}.`,
      12: `Meget let niveau: under ${formatNumber(c * 0.25)} ${unit} eller næsten ingen byrde.`,
    };
  }
  return {
    0: `Ingen, negativ eller udokumenteret effekt: under ${formatNumber(c * 0.1)} ${unit}.`,
    3: `Lav effekt: ca. ${rangeText(c * 0.25, c * 0.75, unit)}.`,
    6: centerText,
    9: `Stærk effekt: ca. ${rangeText(c * 1.5, c * 2.5, unit)}.`,
    12: `Meget stærk effekt: over ${formatNumber(c * 2.5)} ${unit}.`,
  };
}

function buildRelativeAnchors(factor, config) {
  const centerText = makeCenterStatement(factor, config, "relative");
  return {
    0: "Forværrer situationen eller flytter problemet til et andet sted.",
    3: "Lille forbedring i forhold til baseline, typisk under 5 %, eller usikker effekt.",
    6: centerText,
    9: "Tydelig forbedring i forhold til baseline, typisk 15-30 %, med rimeligt datagrundlag.",
    12: "Meget stor forbedring i forhold til baseline, typisk over 30 %, eller transformativ effekt.",
  };
}

function buildGeneralAnchors(factor, config) {
  const centerText = makeCenterStatement(factor, config, "general");
  return {
    0: "Negativ, uønsket eller ikke relevant effekt. Initiativet bør som udgangspunkt ikke prioriteres i denne form.",
    3: "Svagt eller usikkert niveau. Effekten eller gennemførligheden er begrænset og kræver væsentlig afklaring.",
    6: centerText,
    9: "Stærkt niveau. Initiativet er tydeligt relevant og sandsynligvis værd at prioritere.",
    12: "Meget stærkt niveau. Initiativet er ekstraordinært relevant, værdiskabende eller enkelt at gennemføre.",
  };
}

function buildDocumentationAnchors(factor, config) {
  const centerText = makeCenterStatement(factor, config, "documentation");
  return {
    0: "Kan ikke dokumenteres eller vil være risikabelt at bruge som beslutnings- eller kommunikationsgrundlag.",
    3: "Bygger mest på antagelser. Kræver væsentlig datavalidering før scoren kan bruges.",
    6: centerText,
    9: "Godt dokumenteret. Centrale antagelser, kilder og beregninger kan forklares.",
    12: "Stærkt dokumenteret. Scoren kan efterprøves, genberegnes og forklares over for kunde, ledelse eller ekstern part.",
  };
}

function buildAnchors(factor, config, anchorStyle = "general") {
  if (anchorStyle === "relative") return buildRelativeAnchors(factor, config);
  if (anchorStyle === "documentation") return buildDocumentationAnchors(factor, config);
  if (anchorStyle === "general") return buildGeneralAnchors(factor, config);
  return buildAbsoluteAnchors(factor, config);
}

function defaultScores(factors) {
  const out = {};
  factors.forEach((factor) => {
    out[factor.id] = { low: null, high: null, confidence: 2, assumption: "", touched: false };
  });
  return out;
}

function isScoreValue(value) {
  return Number.isFinite(value);
}

function normalizeScoreRange(score) {
  const low = isScoreValue(score.low) ? score.low : null;
  const high = isScoreValue(score.high) ? score.high : null;
  if (low === null || high === null) return { ...score, low: null, high: null, touched: false };
  return { ...score, low: Math.min(low, high), high: Math.max(low, high), touched: score.touched !== false };
}

function applyBoundScore(current, field, nextValue) {
  const score = normalizeScoreRange(current || { low: null, high: null, confidence: 2, assumption: "", touched: false });
  if (!score.touched) return { ...score, low: nextValue, high: nextValue, touched: true };
  if (field === "low") return normalizeScoreRange({ ...score, low: nextValue, high: Math.max(score.high, nextValue), touched: true });
  if (field === "high") return normalizeScoreRange({ ...score, low: Math.min(score.low, nextValue), high: nextValue, touched: true });
  return score;
}

function applyAnchorClick(current, nextValue) {
  const score = normalizeScoreRange(current || { low: null, high: null, confidence: 2, assumption: "", touched: false });
  if (!score.touched) return { ...score, low: nextValue, high: nextValue, touched: true };
  if (score.low === score.high) {
    if (score.low === nextValue) return { ...score, low: null, high: null, touched: false };
    return { ...score, low: Math.min(score.low, nextValue), high: Math.max(score.high, nextValue), touched: true };
  }
  if (nextValue < score.low) return { ...score, low: nextValue, high: score.high, touched: true };
  if (nextValue > score.high) return { ...score, low: score.low, high: nextValue, touched: true };
  return { ...score, low: nextValue, high: nextValue, touched: true };
}

function bestScore(score) {
  const normalized = normalizeScoreRange(score || { low: null, high: null, touched: false });
  if (!normalized.touched) return null;
  return Math.round(((normalized.low + normalized.high) / 2) * 10) / 10;
}

function weightedAverage(factors, scores, dim, field = "best") {
  const selected = factors
    .filter((factor) => factor.dim === dim)
    .map((factor) => ({ factor, score: normalizeScoreRange(scores[factor.id] || { low: null, high: null, touched: false }) }))
    .filter(({ score }) => score.touched);
  const weightSum = selected.reduce((sum, item) => sum + item.factor.weight, 0);
  if (selected.length === 0 || weightSum === 0) return null;
  return selected.reduce((sum, item) => {
    const value = field === "best" ? bestScore(item.score) : item.score[field];
    return sum + (Number.isFinite(value) ? value : 0) * item.factor.weight;
  }, 0) / weightSum;
}

function scoreStatus(value, feasibility, confidence) {
  if (!Number.isFinite(value) && !Number.isFinite(feasibility)) return { label: "Ikke scoret endnu", tone: "gray" };
  if (!Number.isFinite(value)) return { label: "Mangler værdiscore", tone: "amber" };
  if (!Number.isFinite(feasibility)) return { label: "Mangler gennemførlighedsscore", tone: "amber" };
  if (confidence < 2.2) return { label: "Interessant, men datagrundlag er svagt", tone: "amber" };
  if (value >= 8 && feasibility >= 8) return { label: "Stærk kandidat", tone: "green" };
  if (value >= 8 && feasibility < 6) return { label: "Høj værdi - kræver afklaring", tone: "amber" };
  if (value < 6 && feasibility >= 8) return { label: "Let at gennemføre - men lav værdi", tone: "gray" };
  if (value < 6 && feasibility < 6) return { label: "Lav prioritet", tone: "red" };
  return { label: "Relevant til sammenligning", tone: "blue" };
}

function displayScore(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "-";
}

function displayRawScore(value) {
  return Number.isFinite(value) ? value : "-";
}

function normalizeInitiativeLink(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getQrCodeUrl(value, size = 260) {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: value,
    margin: "12",
    format: "png",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

function makeSafeFileName(value) {
  return String(value || "buvi-vurdering")
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "oe")
    .replace(/[å]/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "buvi-vurdering";
}

function selectedAnchorMarker(score, level) {
  const normalized = normalizeScoreRange(score || { low: null, high: null, touched: false });
  if (!normalized.touched) return "";
  const isLow = normalized.low === level;
  const isHigh = normalized.high === level;
  if (isLow && isHigh) return "VALGT";
  if (isLow) return "VALGT LAV";
  if (isHigh) return "VALGT HØJ";
  return "";
}

function getSelectedAnchors(score, anchors) {
  const normalized = normalizeScoreRange(score || { low: null, high: null, touched: false });
  if (!normalized.touched) return { low: null, high: null };
  return {
    low: { score: normalized.low, text: anchors[normalized.low] || "" },
    high: { score: normalized.high, text: anchors[normalized.high] || "" },
  };
}

function isCriticalUnscoredFactor(factor) {
  const criticalIds = new Set(["greenwashing", "data", "co2"]);
  return criticalIds.has(factor.id) || factor.tags.includes("compliance");
}

function scoreIntervalText(score) {
  const normalized = normalizeScoreRange(score || { low: null, high: null, touched: false });
  if (!normalized.touched) return "Ikke scoret";
  if (normalized.low === normalized.high) return `${normalized.low}`;
  return `${normalized.low}-${normalized.high}`;
}

function factorCommentText(row) {
  return String(row?.score?.assumption || "").trim();
}

function getFactorCommentRowsForAssessmentResult(result) {
  const scores = result?.assessment?.scores || {};
  return (result?.factors || [])
    .map((factor) => {
      const score = normalizeScoreRange(scores[factor.id] || { low: null, high: null, confidence: 2, assumption: "", touched: false });
      return {
        factor,
        score,
        comment: factorCommentText({ score }),
      };
    })
    .filter((row) => row.comment);
}

function getCommentStatsForFactors(factors, scores) {
  const rows = (factors || []).map((factor) => {
    const score = normalizeScoreRange(scores?.[factor.id] || { low: null, high: null, confidence: 2, assumption: "", touched: false });
    const hasComment = Boolean(String(score.assumption || "").trim());
    return { factor, score, hasComment };
  });
  const scoredRows = rows.filter((row) => row.score.touched);
  const scoredWithComments = scoredRows.filter((row) => row.hasComment);
  const scoredWithoutComments = scoredRows.filter((row) => !row.hasComment);
  const unscoredWithComments = rows.filter((row) => !row.score.touched && row.hasComment);
  return {
    totalFactors: rows.length,
    scoredCount: scoredRows.length,
    commentedScoreCount: scoredWithComments.length,
    missingCommentCount: scoredWithoutComments.length,
    unscoredCommentCount: unscoredWithComments.length,
    commentCoverage: scoredRows.length ? scoredWithComments.length / scoredRows.length : 0,
  };
}

function commentNudgeText(score) {
  const normalized = normalizeScoreRange(score || { low: null, high: null, touched: false });
  if (!normalized.touched) return "Kommentér gerne, hvis faktoren blev drøftet uden at blive scoret.";
  return "Notér kort antagelser, uenigheder, databehov eller næste afklaring for denne score.";
}

function scrollToSection(id) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildWorkshopSummary({ company, directType, maturityOption, initiativeName, initiativeLink, valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh, confidence, status, roiProxy, factorCounts, overallNotes }) {
  const lines = [
    "BUVI/OxF workshopvurdering",
    `Virksomhed: ${company.name}`,
    `Initiativ: ${initiativeName || "Ikke navngivet"}`,
    `Initiativtype: ${directType.name}`,
    `Beslutningsniveau: ${maturityOption.name}`,
  ];

  if (initiativeLink) lines.push(`Initiativbeskrivelse: ${normalizeInitiativeLink(initiativeLink)}`);

  lines.push(
    `Værdi: ${displayScore(valueBest)} (${displayScore(valueLow)}-${displayScore(valueHigh)})`,
    `Gennemførlighed: ${displayScore(feasibilityBest)} (${displayScore(feasibilityLow)}-${displayScore(feasibilityHigh)})`,
    `Datagrundlag / sikkerhed: ${displayScore(confidence)}/5`,
    `Prioriteringsindikator: ${Number.isFinite(roiProxy) ? roiProxy.toFixed(0) : "-"}`,
    `Status: ${status.label}`,
    `Faktorbalance: ${factorCounts.value} Værdi / ${factorCounts.feasibility} Gennemførlighed`
  );

  if (overallNotes && overallNotes.trim()) {
    lines.push("", "Noter / næste skridt:", overallNotes.trim());
  }

  lines.push(
    "",
    `${BRANDING.output.preparedByLabel}:`,
    `${BRANDING.organization.name} / ${BRANDING.facilitator.name}`,
    BRANDING.facilitator.title,
    `${BRANDING.output.contactLabel}: ${BRANDING.facilitator.email} / ${BRANDING.facilitator.phone}`,
    `LinkedIn: ${BRANDING.facilitator.linkedin}`,
    `Web: ${BRANDING.organization.website}`,
    "",
    BRANDING.output.decisionSupportNote,
    BRANDING.output.confidentialityNote
  );

  return lines.join("\n");
}

function buildExportPayload({ company, directType, maturityOption, initiativeName, initiativeLink, defaultAnchorStyle, factorCounts, factors, scores, anchorConfigBank, result, overallNotes }) {
  return {
    schemaVersion: "buvi-scoretool-export-v0.2",
    appVersion: "v0.3.11-remove-navigation-artifacts",
    branding: BRANDING,
    shareLink: SHARE_LINK,
    anchorConfigBank,
    exportedAt: new Date().toISOString(),
    assessment: {
      companyId: company.id,
      companyName: company.name,
      companyPackage: company.package,
      initiativeTypeId: directType.id,
      initiativeTypeName: directType.name,
      maturityId: maturityOption.id,
      maturityName: maturityOption.name,
      initiativeName,
      initiativeLink: normalizeInitiativeLink(initiativeLink),
      defaultAnchorStyle,
      factorBalance: factorCounts,
    },
    result,
    factors: factors.map((factor) => {
      const centerConfig = getAnchorConfigFromBank(anchorConfigBank, factor);
      const factorAnchorStyle = getFactorAnchorStyle(anchorConfigBank, factor, defaultAnchorStyle);
      const anchors = buildAnchors(factor, centerConfig, factorAnchorStyle);
      const score = normalizeScoreRange(scores[factor.id] || { low: null, high: null, confidence: 2, assumption: "", touched: false });
      return {
        id: factor.id,
        name: factor.name,
        dimension: factor.dim,
        weight: factor.weight,
        tags: factor.tags,
        score,
        centerConfig: anchorConfigBank?.configsByFactorId?.[factor.id] || null,
        anchorStyle: factorAnchorStyle,
        anchorStyleName: anchorStyleOptions.find((item) => item.id === factorAnchorStyle)?.name || factorAnchorStyle,
        anchors,
        selectedAnchors: getSelectedAnchors(score, anchors),
        isCriticalUnscored: !score.touched && isCriticalUnscoredFactor(factor),
      };
    }),
    overallNotes,
  };
}

function buildPortfolioExportPayload({ assessments, assessmentResults, anchorConfigBank }) {
  return {
    schemaVersion: "buvi-scoretool-portfolio-export-v0.1",
    appVersion: "v0.3.11-remove-navigation-artifacts",
    branding: BRANDING,
    shareLink: SHARE_LINK,
    exportedAt: new Date().toISOString(),
    anchorConfigBank,
    portfolio: {
      assessmentCount: assessments.length,
      scoredAssessmentCount: assessmentResults.filter((result) => result.hasMatrixScore).length,
    },
    assessments: assessmentResults.map((result, index) => ({
      index: index + 1,
      id: result.assessment.id,
      createdAt: result.assessment.createdAt,
      updatedAt: result.assessment.updatedAt,
      companyId: result.company.id,
      companyName: result.company.name,
      companyPackage: result.company.package,
      initiativeTypeId: result.directType.id,
      initiativeTypeName: result.directType.name,
      maturityId: result.maturityOption.id,
      maturityName: result.maturityOption.name,
      initiativeName: result.assessment.initiativeName || "Ikke navngivet initiativ",
      initiativeLink: normalizeInitiativeLink(result.assessment.initiativeLink),
      defaultAnchorStyle: result.assessment.anchorStyle,
      factorBalance: result.factorCounts,
      result: {
        valueBest: result.valueBest,
        feasibilityBest: result.feasibilityBest,
        valueLow: result.valueLow,
        valueHigh: result.valueHigh,
        feasibilityLow: result.feasibilityLow,
        feasibilityHigh: result.feasibilityHigh,
        confidence: result.confidence,
        roiProxy: result.roiProxy,
        status: result.status.label,
        hasMatrixScore: result.hasMatrixScore,
      },
      scores: result.assessment.scores || {},
      overallNotes: result.assessment.overallNotes || "",
    })),
  };
}

function buildPortfolioSummary({ assessmentResults }) {
  const lines = [
    "BUVI/OxF samlet initiativliste",
    `Antal initiativer: ${assessmentResults.length}`,
    `Scorede initiativer i matrix: ${assessmentResults.filter((result) => result.hasMatrixScore).length}`,
    "",
    "Initiativer:",
  ];

  assessmentResults.forEach((result, index) => {
    lines.push(
      `${index + 1}. ${result.assessment.initiativeName || "Ikke navngivet initiativ"}`,
      `   Virksomhed: ${result.company.name}`,
      `   Initiativtype: ${result.directType.name}`,
      `   Værdi: ${displayScore(result.valueBest)} (${displayScore(result.valueLow)}-${displayScore(result.valueHigh)})`,
      `   Gennemførlighed: ${displayScore(result.feasibilityBest)} (${displayScore(result.feasibilityLow)}-${displayScore(result.feasibilityHigh)})`,
      `   Datagrundlag: ${displayScore(result.confidence)}/5`,
      `   Status: ${result.status.label}`,
      `   Link: ${normalizeInitiativeLink(result.assessment.initiativeLink) || "-"}`,
      ""
    );
  });

  lines.push(
    `${BRANDING.output.preparedByLabel}: ${BRANDING.organization.name} / ${BRANDING.facilitator.name}`,
    `${BRANDING.output.contactLabel}: ${BRANDING.facilitator.email} / ${BRANDING.facilitator.phone}`,
    `Web: ${BRANDING.organization.website}`
  );

  return lines.join("\n");
}

function downloadJsonFile(payload, filenamePrefix) {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${makeSafeFileName(filenamePrefix)}-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.warn("Kunne ikke eksportere JSON", error);
    return false;
  }
}

async function copyTextToClipboard(text) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn("Kunne ikke kopiere opsummering", error);
    return false;
  }
}

function runPrototypeTests() {
  const nyboFactors = buildFactors("tekstil_workwear", "produkt_cirkularitet", 12);
  console.assert(nyboFactors.length <= 12, "buildFactors respects factor limit");
  console.assert(getDimensionCounts(nyboFactors).isBalanced, "Nybo factor list respects value/feasibility balance");
  console.assert(groupFactorsByDimension(nyboFactors).value.every((factor) => factor.dim === "Værdi"), "factor grouping keeps value factors together");
  console.assert(groupFactorsByDimension(nyboFactors).feasibility.every((factor) => factor.dim === "Gennemførlighed"), "factor grouping keeps feasibility factors together");
  console.assert(getDimensionCounts(buildFactors("erhvervsfremme_netvaerk", "esg_data", 12)).isBalanced, "Business Viborg ESG factor list is balanced");
  console.assert(getDimensionCounts(buildFactors("byggeri_anlaeg", "materialer_spild", 11)).difference <= 1, "odd factor limits allow max one factor difference");
  companies.forEach((company) => {
    initiativeTypes.forEach((initiativeType) => {
      maturityOptions.forEach((maturityOption) => {
        const factors = buildFactors(company.package, initiativeType.id, maturityOption.factorLimit);
        console.assert(getDimensionCounts(factors).difference <= 1, `balanced factors for ${company.id}/${initiativeType.id}/${maturityOption.id}`);
      });
    });
  });
  console.assert(nyboFactors.some((factor) => factor.id === "returflow"), "Nybo circularity includes take-back factor");
  console.assert(uniqueById([{ id: "a" }, { id: "a" }, { id: "b" }]).length === 2, "uniqueById removes duplicate IDs");
  const scores = defaultScores(nyboFactors);
  console.assert(weightedAverage(nyboFactors, scores, "Værdi", "best") === null, "default value average is not calculated before scoring");
  console.assert(weightedAverage(nyboFactors, scores, "Gennemførlighed", "best") === null, "default feasibility average is not calculated before scoring");
  console.assert(scoreStatus(9, 9, 4).tone === "green", "high value and feasibility gives green status");
  console.assert(normalizeScoreRange({ low: 9, high: 3, touched: true }).low === 3, "score ranges are normalized");
  console.assert(applyBoundScore({ low: 3, high: 6, touched: true }, "low", 9).high === 9, "setting low above high moves high with it");
  console.assert(applyBoundScore({ low: 6, high: 9, touched: true }, "high", 3).low === 3, "setting high below low moves low with it");
  console.assert(applyAnchorClick({ low: null, high: null, touched: false }, 9).low === 9, "first anchor click sets low to selected score");
  console.assert(applyAnchorClick({ low: null, high: null, touched: false }, 9).high === 9, "first anchor click sets high to selected score");
  console.assert(applyAnchorClick({ low: 6, high: 6, touched: true }, 6).touched === false, "clicking a single selected score deselects it");
  console.assert(applyAnchorClick({ low: 6, high: 6, touched: true }, 9).low === 6, "second different anchor click creates interval low");
  console.assert(applyAnchorClick({ low: 6, high: 6, touched: true }, 9).high === 9, "second different anchor click creates interval high");
  console.assert(applyAnchorClick({ low: 3, high: 9, touched: true }, 6).low === 6, "click inside interval collapses to single score low");
  console.assert(applyAnchorClick({ low: 3, high: 9, touched: true }, 6).high === 6, "click inside interval collapses to single score high");
  console.assert(applyAnchorClick({ low: 3, high: 9, touched: true }, 0).low === 0, "click below interval extends low boundary");
  console.assert(applyAnchorClick({ low: 3, high: 9, touched: true }, 0).high === 9, "click below interval keeps high boundary");
  console.assert(applyAnchorClick({ low: 3, high: 9, touched: true }, 12).low === 3, "click above interval keeps low boundary");
  console.assert(applyAnchorClick({ low: 3, high: 9, touched: true }, 12).high === 12, "click above interval extends high boundary");
  console.assert(buildFactors("unknown", "unknown", 20).length === coreFactors.length, "unknown config falls back to core factors");
  console.assert(getDimensionCounts(buildFactors("unknown", "unknown", 20)).isBalanced, "unknown config fallback remains balanced");
  console.assert(companies.some((company) => company.id === "business_viborg"), "Business Viborg is available as an organization");
  console.assert(buildFactors("erhvervsfremme_netvaerk", "esg_data", 12).some((factor) => factor.id === "kildedokumentation"), "Business Viborg configuration includes ESG data factors");
  console.assert(weightedAverage([], {}, "Værdi", "best") === null, "empty factor list returns null average before scoring");
  console.assert(loadSavedWorkshopState() === null || typeof loadSavedWorkshopState() === "object", "local storage loader returns null or state object");
  console.assert(normalizeInitiativeLink("") === "", "empty initiative link is allowed");
  console.assert(normalizeInitiativeLink("example.com/buvi.pptx") === "https://example.com/buvi.pptx", "initiative link gets https when protocol is missing");
  console.assert(normalizeInitiativeLink("https://example.com/buvi.pptx") === "https://example.com/buvi.pptx", "initiative link preserves https links");
  console.assert(BRANDING.facilitator.email === "christian@probalance.dk", "branding includes facilitator email");
  console.assert(BRANDING.facilitator.linkedin.startsWith("https://"), "branding LinkedIn URL is normalized");
  console.assert(!BRANDING.organization.logo.src.startsWith("/"), "branding logo uses a relative public path so GitHub Pages base paths work");
  console.assert(SECTION_THEMES.configuration.card.includes("sky"), "configuration section has its own color theme");
  console.assert(SECTION_THEMES.factorDescriptions.card.includes("amber"), "factor description section has its own color theme");
  console.assert(SECTION_THEMES.scoring.card.includes("emerald"), "initiative scoring section has its own color theme");
  console.assert(BRANDING.tool.version.includes("remove-navigation-artifacts"), "version label reflects section navigation work");
  console.assert(maturityOptions[0].name.includes("Hurtig screening"), "maturity label uses workshop-oriented language");
  const testAssessment = createAssessment({ initiativeName: "Testinitiativ" });
  console.assert(testAssessment.id && testAssessment.initiativeName === "Testinitiativ", "assessment factory creates a named assessment");
  console.assert(cloneAssessment(testAssessment).id !== testAssessment.id, "assessment clone gets a new id");
  console.assert(getInitialWorkshopState({ assessments: [testAssessment], activeAssessmentId: testAssessment.id }).activeAssessmentId === testAssessment.id, "initial workshop state preserves active assessment id");
  const scoredAssessment = createAssessment({ scores: { co2: { low: 6, high: 6, confidence: 3, touched: true }, opex: { low: 6, high: 6, confidence: 3, touched: true }, strategi: { low: 6, high: 6, confidence: 3, touched: true }, kundevaerdi: { low: 6, high: 6, confidence: 3, touched: true }, kapacitet: { low: 6, high: 6, confidence: 3, touched: true }, investering: { low: 6, high: 6, confidence: 3, touched: true }, teknisk: { low: 6, high: 6, confidence: 3, touched: true }, data: { low: 6, high: 6, confidence: 3, touched: true } } });
  console.assert(getAssessmentResult(scoredAssessment).hasMatrixScore, "assessment result supports comparison matrix when both dimensions are scored");
  const portfolioPayload = buildPortfolioExportPayload({ assessments: [scoredAssessment], assessmentResults: [getAssessmentResult(scoredAssessment)], anchorConfigBank: createAnchorConfigBank() });
  console.assert(portfolioPayload.portfolio.assessmentCount === 1, "portfolio export includes assessment count");
  console.assert(portfolioPayload.assessments[0].result.hasMatrixScore, "portfolio export includes matrix-ready result");
  console.assert(buildPortfolioSummary({ assessmentResults: [getAssessmentResult(scoredAssessment)] }).includes("BUVI/OxF samlet initiativliste"), "portfolio summary has a readable heading");
  console.assert(typeof PortfolioPrintReport === "function", "portfolio print report component is available");
  const commentedAssessment = createAssessment({ scores: { co2: { low: 6, high: 6, confidence: 3, touched: true, assumption: "  vigtig drøftelse  " } } });
  console.assert(getFactorCommentRowsForAssessmentResult(getAssessmentResult(commentedAssessment))[0].comment === "vigtig drøftelse", "portfolio print can extract factor comments and discussion notes");
  const commentStats = getCommentStatsForFactors(coreFactors.slice(0, 2), { co2: { low: 6, high: 6, touched: true, confidence: 3, assumption: "" }, opex: { low: 6, high: 6, touched: true, confidence: 3, assumption: "note" } });
  console.assert(commentStats.scoredCount === 2 && commentStats.commentedScoreCount === 1 && commentStats.missingCommentCount === 1, "comment stats identify scored factors without comments");
  console.assert(commentNudgeText({ low: 6, high: 6, touched: true }).includes("antagelser"), "comment nudge prompts workshop documentation for scored factors");
  console.assert(SHARE_LINK.shortUrl.includes("probalance.dk/buvi"), "share link has a presentation-friendly short URL");
  console.assert(getQrCodeUrl(SHARE_LINK.canonicalUrl).includes("data="), "QR code URL is generated for the public tool link");
  console.assert(getQrCodeUrl(SHARE_LINK.canonicalUrl).includes("api.qrserver.com"), "QR code URL uses the configured QR generator");
  const testAnchorBank = createAnchorConfigBank({ co2: { kind: "number", centerValue: 42, unit: "tons", direction: "higherBetter" } });
  console.assert(getAnchorConfigFromBank(testAnchorBank, coreFactors[0]).centerValue === 42, "anchor config bank overrides default factor center config");
  console.assert(updateAnchorConfigBank(testAnchorBank, "data", { kind: "text", centerText: "Test", direction: "higherBetter" }).configsByFactorId.data.centerText === "Test", "anchor config bank can update a factor config");
  console.assert(getFactorAnchorStyle(createAnchorConfigBank({ co2: { anchorStyle: "documentation" } }), coreFactors[0], "absolute") === "documentation", "factor-level anchor style overrides default style");
  console.assert(getFactorAnchorStyle(createAnchorConfigBank(), coreFactors[0], "relative") === "relative", "factor-level anchor style falls back to default style");
  console.assert(updateFactorAnchorStyle(createAnchorConfigBank(), "co2", "general").configsByFactorId.co2.anchorStyle === "general", "factor-level anchor style can be updated in anchorConfigBank");
  console.assert(makeSafeFileName("Æ Ø Å test!") === "ae-oe-aa-test", "safe file names normalize Danish characters");
  console.assert(buildWorkshopSummary({ company: companies[0], directType: initiativeTypes[0], maturityOption: maturityOptions[0], initiativeName: "Test", initiativeLink: "example.com", valueBest: 6, feasibilityBest: 9, valueLow: 3, valueHigh: 9, feasibilityLow: 9, feasibilityHigh: 9, confidence: 3, status: { label: "Teststatus" }, roiProxy: 54, factorCounts: { value: 4, feasibility: 4 }, overallNotes: "Næste skridt" }).includes("https://example.com"), "workshop summary includes normalized initiative link");
  console.assert(buildWorkshopSummary({ company: companies[0], directType: initiativeTypes[0], maturityOption: maturityOptions[0], initiativeName: "Test", initiativeLink: "", valueBest: null, feasibilityBest: null, valueLow: null, valueHigh: null, feasibilityLow: null, feasibilityHigh: null, confidence: 2, status: { label: "Ikke scoret" }, roiProxy: null, factorCounts: { value: 4, feasibility: 4 }, overallNotes: "" }).split("\n").length >= 9, "workshop summary is newline separated and handles empty scores");
  console.assert(selectedAnchorMarker({ low: 3, high: 9, touched: true }, 3) === "VALGT LAV", "selected anchor marker identifies low score");
  console.assert(selectedAnchorMarker({ low: 3, high: 9, touched: true }, 9) === "VALGT HØJ", "selected anchor marker identifies high score");
  console.assert(selectedAnchorMarker({ low: 6, high: 6, touched: true }, 6) === "VALGT", "selected anchor marker identifies single score");
  console.assert(isCriticalUnscoredFactor({ id: "greenwashing", tags: ["kommunikation"] }), "greenwashing is a critical unscored factor");
  console.assert(scoreIntervalText({ low: null, high: null, touched: false }) === "Ikke scoret", "score interval text handles unscored factors");
  console.assert(factorCommentText({ score: { assumption: "  Kommentar til faktor  " } }) === "Kommentar til faktor", "factor comments are trimmed for print output");
  console.assert(matrixGeometry({ valueBest: 6, feasibilityBest: 6, valueLow: 3, valueHigh: 9, feasibilityLow: 3, feasibilityHigh: 9 }).hasMatrixScore, "matrix geometry detects score point");
  console.assert(!matrixGeometry({ valueBest: null, feasibilityBest: 6, valueLow: null, valueHigh: null, feasibilityLow: 3, feasibilityHigh: 9 }).hasMatrixScore, "matrix geometry handles missing score point");
  const absolute = buildAbsoluteAnchors({ id: "co2", anchor0: "x", anchor12: "y" }, { kind: "number", centerValue: 10, unit: "tons", direction: "higherBetter", centerText: "Score 6 er 10 tons." }, "absolute");
  console.assert(absolute[6].includes("10 tons"), "absolute anchors use score 6 center text");
  const relativeCenter = buildRelativeAnchors({ id: "co2", name: "CO2- og miljøeffekt", anchor0: "x", anchor12: "y" }, { kind: "number", centerValue: 10, unit: "tons", direction: "higherBetter" });
  console.assert(!relativeCenter[6].includes("10 tons"), "relative score 6 statement follows the selected description logic");
  const generalCenter = buildGeneralAnchors({ id: "co2", name: "CO2- og miljøeffekt", anchor0: "x", anchor12: ">30 % forbedring" }, { kind: "number", centerValue: 10, unit: "tons", direction: "higherBetter" });
  console.assert(!generalCenter[6].includes("10 tons"), "general score 6 statement does not expose absolute calibration");
  console.assert(!generalCenter[12].includes("30"), "general score 12 statement does not reuse percentage-based factor anchor text");
  console.assert(DATA_CONFIDENCE_DESCRIPTIONS[2].includes("Svagt"), "data confidence score 2 has a description");
  console.assert(absolute[12].includes("25"), "absolute higher-better score 12 follows automatically from center value");
  const investment = buildAbsoluteAnchors({ id: "investering", anchor0: "x", anchor12: "y" }, { kind: "number", centerValue: 100000, unit: "kr.", direction: "lowerBetter", centerText: "Score 6 er 100.000 kr." }, "absolute");
  console.assert(investment[12].includes("under"), "lower-better absolute anchors invert the scale");
}

runPrototypeTests();

function Card({ children, className = "", ...props }) {
  return <section {...props} className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 scroll-mt-6 ${className}`}>{children}</section>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Badge({ children, tone = "slate", className = "" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    dark: "bg-slate-900 text-white ring-slate-900",
    blue: "bg-sky-50 text-sky-800 ring-sky-200",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    red: "bg-rose-50 text-rose-800 ring-rose-200",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tones[tone] || tones.slate} ${className}`}>{children}</span>;
}

function Icon({ label }) {
  return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{label}</span>;
}

function SectionIcon({ label, theme }) {
  return <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-1 ${theme?.icon || SECTION_THEMES.engine.icon}`}>{label}</span>;
}

function SectionHeader({ label, title, theme, children }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <SectionIcon label={label} theme={theme} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children && <div className="mt-2 text-sm text-slate-600">{children}</div>}
    </div>
  );
}

function StartHereGuide() {
  const steps = [
    { label: "0", title: "Initiativer", text: "Opret, vælg eller duplikér initiativ", target: "section-initiatives" },
    { label: "1", title: "Konfiguration", text: "Vælg virksomhed, type og vurderingsniveau", target: "section-configuration" },
    { label: "2", title: "Standardforklaring", text: "Vælg standard, hvis faktorer ikke tilpasses", target: "section-standard-logic" },
    { label: "3", title: "Scoreforklaring", text: "Tilpas hvad score 0, 3, 6, 9 og 12 betyder", target: "section-factor-descriptions" },
    { label: "4", title: "Scoring", text: "Score det aktive initiativ og skriv kommentarer", target: "section-scoring" },
    { label: "5", title: "Resultat og eksport", text: "Se resultat, matrix og lav PDF/opsamling", target: "section-result" },
    { label: "6", title: "Gates", text: "Notér samlet beslutning og næste skridt", target: "section-gates" },
  ];
  return (
    <Card id="section-start" className="border-l-4 border-l-emerald-500 bg-emerald-50/40 scroll-mt-6">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2"><SectionIcon label="▶" theme={SECTION_THEMES.scoring} /><h2 className="text-lg font-semibold">Start her</h2></div>
        <p className="max-w-4xl text-sm text-slate-700">Brug værktøjet som beslutningsstøtte i workshoppen. Scoren er kun halvdelen af outputtet; kommentarer, antagelser og databehov er lige så vigtige.</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
          {steps.map((step) => (
            <a
              key={step.target}
              href={`#${step.target}`}
              onClick={(event) => { event.preventDefault(); scrollToSection(step.target); }}
              className="block rounded-xl bg-white p-3 text-left text-xs leading-relaxed ring-1 ring-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <div className="mb-1 flex items-center gap-2 font-semibold text-emerald-900"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] ring-1 ring-emerald-200">{step.label}</span>{step.title}</div>
              <div className="text-slate-700">{step.text}</div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BackToStartButton({ label = "Tilbage til Start her" }) {
  return (
    <div className="mt-5 flex justify-end border-t border-slate-200 pt-4 no-print">
      <button type="button" onClick={() => scrollToSection("section-start")} className="rounded-xl bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow">
        ↑ {label}
      </button>
    </div>
  );
}

function BrandingLogo({ className = "h-10 w-auto", showFallback = true }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={BRANDING.organization.logo.src}
        alt={BRANDING.organization.logo.alt}
        className={`${className} object-contain`}
        onError={(event) => {
          event.currentTarget.style.display = "none";
          const fallback = event.currentTarget.nextElementSibling;
          if (fallback) fallback.style.display = "inline-flex";
        }}
      />
      {showFallback && <span className="hidden rounded-xl border border-slate-200 px-3 py-1 text-sm font-semibold tracking-wide text-slate-900">{BRANDING.organization.logo.fallbackText}</span>}
    </div>
  );
}

function BrandingContactBlock({ compact = false, className = "" }) {
  return (
    <div className={`text-sm text-slate-600 ${className}`}>
      <div className="font-semibold text-slate-900">{BRANDING.organization.name}</div>
      <div>{BRANDING.facilitator.name}</div>
      {!compact && <div>{BRANDING.facilitator.title}</div>}
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <a className="underline decoration-slate-300 underline-offset-2" href={`mailto:${BRANDING.facilitator.email}`}>{BRANDING.facilitator.email}</a>
        <a className="underline decoration-slate-300 underline-offset-2" href={`tel:${BRANDING.facilitator.phoneRaw}`}>{BRANDING.facilitator.phone}</a>
        <a className="underline decoration-slate-300 underline-offset-2" href={BRANDING.organization.website} target="_blank" rel="noreferrer">{BRANDING.organization.website}</a>
        <a className="underline decoration-slate-300 underline-offset-2" href={BRANDING.facilitator.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
  );
}

function ShareLinkQrBlock({ compact = false, onCopy, status = "" }) {
  return (
    <div className={`rounded-2xl bg-white p-4 ring-1 ring-slate-200 ${compact ? "" : "shadow-sm"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Del værktøjet</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{SHARE_LINK.displayShortUrl}</div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Brug den pæne adresse i præsentationen, når redirectet er sat op. QR-koden peger lige nu på den aktive GitHub Pages-version, så den virker med det samme.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-slate-800" href={SHARE_LINK.qrTargetUrl} target="_blank" rel="noreferrer">Åbn værktøj</a>
            <button type="button" onClick={() => onCopy?.(SHARE_LINK.qrTargetUrl)} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Kopiér aktivt link</button>
            <Badge tone="amber">{SHARE_LINK.redirectStatus}</Badge>
            {status && <Badge tone={status.includes("kopieret") ? "green" : "amber"}>{status}</Badge>}
          </div>
          {!compact && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">{SHARE_LINK.redirectNote}</div>}
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <img src={getQrCodeUrl(SHARE_LINK.qrTargetUrl, compact ? 180 : 220)} alt={`QR-kode til ${SHARE_LINK.qrTargetUrl}`} className={`${compact ? "h-40 w-40" : "h-52 w-52"} rounded-xl bg-white p-2 ring-1 ring-slate-200`} />
          <div className="max-w-52 break-all text-center text-[11px] text-slate-500">{SHARE_LINK.qrTargetUrl}</div>
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, hint }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</label>
      <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function ScoreAnchorButton({ level, text, selectedLow, selectedHigh, onClick }) {
  const selected = selectedLow || selectedHigh;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-32 flex-col rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-400"}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`text-2xl font-semibold ${selected ? "text-white" : "text-slate-900"}`}>{level}</span>
        <span className="flex gap-1">
          {selectedLow && selectedHigh && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-800"}`}>Valgt</span>}
          {selectedLow && !selectedHigh && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selected ? "bg-white text-slate-900" : "bg-sky-100 text-sky-800"}`}>Lav</span>}
          {selectedHigh && !selectedLow && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selected ? "bg-white text-slate-900" : "bg-emerald-100 text-emerald-800"}`}>Høj</span>}
        </span>
      </div>
      <span className={`text-xs leading-relaxed ${selected ? "text-slate-100" : "text-slate-600"}`}>{text}</span>
    </button>
  );
}

function CenterConfigEditor({ factor, config, anchorStyle, currentCenterStatement, onChange, onAnchorStyleChange }) {
  const isNumber = config.kind === "number";
  const showAbsoluteCalibration = isNumber && anchorStyle === "absolute";
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faktorbeskrivelse</div>
          <div className="text-xs text-slate-500">Fælles scorelogik for denne faktor.</div>
        </div>
        <Badge tone={isNumber ? "green" : "amber"}>{isNumber ? "Talgrænse" : "Kvalitativ"}</Badge>
      </div>
      <div className="mb-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Beskrivelseslogik</div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {anchorStyleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onAnchorStyleChange?.(option.id)}
              className={`rounded-xl p-3 text-left text-xs ring-1 transition hover:-translate-y-0.5 hover:shadow-sm ${anchorStyle === option.id ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200"}`}
            >
              <div className="font-semibold">{option.name}</div>
              <div className={`mt-1 leading-relaxed ${anchorStyle === option.id ? "text-slate-100" : "text-slate-500"}`}>{option.hint}</div>
            </button>
          ))}
        </div>
      </div>
      {showAbsoluteCalibration ? (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
          <label className="space-y-1">
            <span className="text-xs text-slate-500">Score 6 tal</span>
            <input type="number" min="0" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2" value={config.centerValue} onChange={(event) => onChange({ ...config, centerValue: Number(event.target.value) })} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-slate-500">Enhed</span>
            <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2" value={config.unit} onChange={(event) => onChange({ ...config, unit: event.target.value })} />
          </label>
        </div>
      ) : isNumber ? (
        <div className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
          Der findes en fælles absolut kalibrering for denne faktor, men den skjules her, fordi den valgte beskrivelseslogik ikke bruger konkrete tal. Skift til <span className="font-semibold">Absolutte scoregrænser</span> for at redigere score 6-tal og enhed på tværs af initiativer.
        </div>
      ) : (
        <label className="space-y-1">
          <span className="text-xs text-slate-500">Fælles kvalitativ score 6-beskrivelse</span>
          <textarea className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-slate-300 focus:ring-2" value={config.centerText || ""} onChange={(event) => onChange({ ...config, centerText: event.target.value })} />
        </label>
      )}
      <div className="mt-3 rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
        <span className="font-semibold">Score 6:</span> {currentCenterStatement}
      </div>
    </div>
  );
}

function getAssessmentResult(assessment) {
  const company = companies.find((item) => item.id === assessment.companyId) || companies[0];
  const maturityOption = maturityOptions.find((item) => item.id === assessment.maturity) || maturityOptions[1];
  const directType = initiativeTypes.find((item) => item.id === assessment.initiativeType) || initiativeTypes[0];
  const factors = buildFactors(company.package, directType.id, maturityOption.factorLimit);
  const scores = assessment.scores || {};
  const valueBest = weightedAverage(factors, scores, "Værdi", "best");
  const feasibilityBest = weightedAverage(factors, scores, "Gennemførlighed", "best");
  const valueLow = weightedAverage(factors, scores, "Værdi", "low");
  const valueHigh = weightedAverage(factors, scores, "Værdi", "high");
  const feasibilityLow = weightedAverage(factors, scores, "Gennemførlighed", "low");
  const feasibilityHigh = weightedAverage(factors, scores, "Gennemførlighed", "high");
  const confidence = factors.length ? factors.reduce((sum, factor) => sum + ((scores[factor.id] && scores[factor.id].confidence) || 1), 0) / factors.length : 0;
  const status = scoreStatus(valueBest, feasibilityBest, confidence);
  return {
    assessment,
    company,
    directType,
    maturityOption,
    factors,
    factorCounts: getDimensionCounts(factors),
    valueBest,
    feasibilityBest,
    valueLow,
    valueHigh,
    feasibilityLow,
    feasibilityHigh,
    confidence,
    roiProxy: Number.isFinite(valueBest) && Number.isFinite(feasibilityBest) ? valueBest * feasibilityBest : null,
    status,
    hasMatrixScore: Number.isFinite(valueBest) && Number.isFinite(feasibilityBest),
  };
}

function matrixGeometry({ valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh }) {
  const hasMatrixScore = Number.isFinite(valueBest) && Number.isFinite(feasibilityBest);
  const hasMatrixRange = Number.isFinite(valueLow) && Number.isFinite(valueHigh) && Number.isFinite(feasibilityLow) && Number.isFinite(feasibilityHigh);
  return {
    hasMatrixScore,
    hasMatrixRange,
    pointX: hasMatrixScore ? Math.min(92, Math.max(8, (feasibilityBest / 12) * 84 + 8)) : null,
    pointY: hasMatrixScore ? Math.min(92, Math.max(8, 100 - ((valueBest / 12) * 84 + 8))) : null,
    rectX: hasMatrixRange ? Math.min((feasibilityLow / 12) * 84 + 8, (feasibilityHigh / 12) * 84 + 8) : null,
    rectY: hasMatrixRange ? Math.min(100 - ((valueHigh / 12) * 84 + 8), 100 - ((valueLow / 12) * 84 + 8)) : null,
    rectW: hasMatrixRange ? Math.abs(((feasibilityHigh - feasibilityLow) / 12) * 84) : null,
    rectH: hasMatrixRange ? Math.abs(((valueHigh - valueLow) / 12) * 84) : null,
  };
}

function MatrixDiagram({ valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh, className = "h-72 w-full", labelSize = 5.2 }) {
  const geometry = matrixGeometry({ valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh });
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Matrix med værdi på y-aksen og gennemførlighed på x-aksen">
      <rect x="8" y="8" width="84" height="84" rx="3" fill="white" stroke="#cbd5e1" />
      <line x1="8" y1="50" x2="92" y2="50" stroke="#e2e8f0" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="#e2e8f0" />
      <path d="M 14 86 C 24 64, 40 48, 58 35 C 72 25, 82 18, 90 14" fill="none" stroke="#cbd5e1" strokeDasharray="3 3" />
      {geometry.hasMatrixRange && <rect x={geometry.rectX} y={geometry.rectY} width={Math.max(2, geometry.rectW)} height={Math.max(2, geometry.rectH)} rx="2" fill="#bfdbfe" opacity="0.55" stroke="#60a5fa" />}
      {geometry.hasMatrixScore && <circle cx={geometry.pointX} cy={geometry.pointY} r="3.4" fill="#0f172a" />}
      {!geometry.hasMatrixScore && <text x="50" y="51" fontSize={labelSize} textAnchor="middle" fill="#64748b">Ingen score valgt endnu</text>}
      <text x="50" y="98" fontSize={labelSize} textAnchor="middle" fill="#334155" fontWeight="600">Gennemførlighed</text>
      <text x="2.8" y="52" fontSize={labelSize} textAnchor="middle" fill="#334155" fontWeight="600" transform="rotate(-90 2.8 52)">Værdi</text>
      <text x="11" y="15" fontSize={labelSize * 0.75} fill="#64748b" fontWeight="600">Høj værdi</text>
      <text x="61" y="88" fontSize={labelSize * 0.75} fill="#64748b" fontWeight="600">Let at gennemføre</text>
    </svg>
  );
}

function ComparisonMatrixDiagram({ assessmentResults, activeAssessmentId, onSelect, className = "h-80 w-full", labelSize = 5.2 }) {
  const activeResult = assessmentResults.find((result) => result.assessment.id === activeAssessmentId);
  const activeGeometry = activeResult ? matrixGeometry(activeResult) : null;
  const scoredResults = assessmentResults.filter((result) => result.hasMatrixScore);
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Sammenligningsmatrix med flere initiativer">
      <rect x="8" y="8" width="84" height="84" rx="3" fill="white" stroke="#cbd5e1" />
      <line x1="8" y1="50" x2="92" y2="50" stroke="#e2e8f0" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="#e2e8f0" />
      <path d="M 14 86 C 24 64, 40 48, 58 35 C 72 25, 82 18, 90 14" fill="none" stroke="#cbd5e1" strokeDasharray="3 3" />
      {activeGeometry?.hasMatrixRange && <rect x={activeGeometry.rectX} y={activeGeometry.rectY} width={Math.max(2, activeGeometry.rectW)} height={Math.max(2, activeGeometry.rectH)} rx="2" fill="#bfdbfe" opacity="0.5" stroke="#60a5fa" />}
      {scoredResults.length === 0 && <text x="50" y="51" fontSize={labelSize} textAnchor="middle" fill="#64748b">Ingen initiativer har både værdi- og gennemførlighedsscore endnu</text>}
      {scoredResults.map((result, index) => {
        const geometry = matrixGeometry(result);
        const isActive = result.assessment.id === activeAssessmentId;
        return (
          <g key={result.assessment.id} onClick={() => onSelect?.(result.assessment.id)} className="cursor-pointer">
            <circle cx={geometry.pointX} cy={geometry.pointY} r={isActive ? "4.2" : "3"} fill={isActive ? "#0f172a" : "#0284c7"} opacity={isActive ? "1" : "0.72"} stroke="white" strokeWidth="1.2" />
            <text x={geometry.pointX + 4.2} y={geometry.pointY - 2.6} fontSize={labelSize * 0.7} fill={isActive ? "#0f172a" : "#0369a1"} fontWeight={isActive ? "700" : "600"}>{index + 1}</text>
          </g>
        );
      })}
      <text x="50" y="98" fontSize={labelSize} textAnchor="middle" fill="#334155" fontWeight="600">Gennemførlighed</text>
      <text x="2.8" y="52" fontSize={labelSize} textAnchor="middle" fill="#334155" fontWeight="600" transform="rotate(-90 2.8 52)">Værdi</text>
      <text x="11" y="15" fontSize={labelSize * 0.75} fill="#64748b" fontWeight="600">Høj værdi</text>
      <text x="61" y="88" fontSize={labelSize * 0.75} fill="#64748b" fontWeight="600">Let at gennemføre</text>
    </svg>
  );
}

function PortfolioPrintReport({ assessmentResults, activeAssessmentId, onClose }) {
  const scoredResults = assessmentResults.filter((result) => result.hasMatrixScore);
  const activeResult = assessmentResults.find((result) => result.assessment.id === activeAssessmentId);
  return (
    <div className="print-report-shell fixed inset-0 z-50 overflow-auto bg-white p-6 text-slate-900">
      <div className="no-print sticky top-0 z-10 mb-6 flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold">Portefølje print-/PDF-visning</div>
          <div className="text-xs text-slate-500">Brug browserens printdialog og vælg “Gem som PDF”, hvis sammenligningen skal gemmes digitalt.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Udskriv / Gem som PDF</button>
          <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Luk porteføljevisning</button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <BrandingLogo className="h-28 w-auto print:h-24" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{BRANDING.tool.name}</div>
                <h1 className="mt-1 text-2xl font-semibold">Sammenligning af initiativscoringer</h1>
                <p className="mt-2 text-sm text-slate-600">Porteføljerapport med samlet matrix, initiativliste og dokumenterede faktorkommentarer.</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <Badge tone="blue">{BRANDING.tool.version}</Badge>
              <BrandingContactBlock compact className="mt-3" />
            </div>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><span className="font-semibold">Antal initiativer:</span> {assessmentResults.length}</div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><span className="font-semibold">Scoret i matrix:</span> {scoredResults.length}</div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><span className="font-semibold">Aktivt initiativ:</span> {activeResult?.assessment?.initiativeName || "-"}</div>
          </div>
        </section>

        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Samlet sammenligningsmatrix</h2>
              <p className="mt-1 text-sm text-slate-600">Alle initiativer med både værdi- og gennemførlighedsscore vises som punkter. Det aktive initiativ er mørkt og viser usikkerhedsinterval.</p>
            </div>
            <Badge tone="blue">{scoredResults.length}/{assessmentResults.length} scoret</Badge>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <ComparisonMatrixDiagram assessmentResults={assessmentResults} activeAssessmentId={activeAssessmentId} className="h-96 w-full print:h-80" labelSize={6.2} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Initiativliste</h2>
          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Initiativ</th>
                  <th className="p-3">Virksomhed / type</th>
                  <th className="p-3 text-right">Værdi</th>
                  <th className="p-3 text-right">Gennemførlighed</th>
                  <th className="p-3 text-right">Data</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {assessmentResults.map((result, index) => {
                  const isActive = result.assessment.id === activeAssessmentId;
                  return (
                    <tr key={result.assessment.id} className={isActive ? "bg-slate-900 text-white" : "border-t border-slate-200 bg-white"}>
                      <td className="p-3 align-top font-semibold">{index + 1}</td>
                      <td className="p-3 align-top">
                        <div className="font-semibold">{result.assessment.initiativeName || "Ikke navngivet initiativ"}</div>
                        {normalizeInitiativeLink(result.assessment.initiativeLink) && <div className={isActive ? "mt-1 break-all text-xs text-slate-200" : "mt-1 break-all text-xs text-slate-500"}>{normalizeInitiativeLink(result.assessment.initiativeLink)}</div>}
                      </td>
                      <td className="p-3 align-top"><div>{result.company.name}</div><div className={isActive ? "text-xs text-slate-200" : "text-xs text-slate-500"}>{result.directType.name}</div></td>
                      <td className="p-3 text-right align-top">{displayScore(result.valueBest)}<div className={isActive ? "text-xs text-slate-200" : "text-xs text-slate-500"}>{displayScore(result.valueLow)}-{displayScore(result.valueHigh)}</div></td>
                      <td className="p-3 text-right align-top">{displayScore(result.feasibilityBest)}<div className={isActive ? "text-xs text-slate-200" : "text-xs text-slate-500"}>{displayScore(result.feasibilityLow)}-{displayScore(result.feasibilityHigh)}</div></td>
                      <td className="p-3 text-right align-top">{displayScore(result.confidence)}/5</td>
                      <td className="p-3 align-top">{result.status.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Noter pr. initiativ</h2>
          <div className="mt-3 space-y-3">
            {assessmentResults.map((result, index) => (
              <article key={result.assessment.id} className="rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200">
                <div className="font-semibold">{index + 1}. {result.assessment.initiativeName || "Ikke navngivet initiativ"}</div>
                <div className="mt-2 whitespace-pre-wrap text-slate-700">{result.assessment.overallNotes?.trim() || "Ingen noter tilføjet."}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Faktorkommentarer og drøftelser</h2>
          <p className="mt-1 text-sm text-slate-600">Kommentarerne under de enkelte faktorer er medtaget, fordi de dokumenterer vurderingens antagelser, diskussioner og databehov.</p>
          <div className="mt-4 space-y-4">
            {assessmentResults.map((result, index) => {
              const commentRows = getFactorCommentRowsForAssessmentResult(result);
              return (
                <article key={result.assessment.id} className="print-break-inside-avoid rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold">{index + 1}. {result.assessment.initiativeName || "Ikke navngivet initiativ"}</div>
                      <div className="text-xs text-slate-500">{result.company.name} · {result.directType.name}</div>
                    </div>
                    <Badge>{commentRows.length} kommentar{commentRows.length === 1 ? "" : "er"}</Badge>
                  </div>
                  {commentRows.length === 0 ? (
                    <div className="rounded-xl bg-white p-3 text-sm text-slate-500 ring-1 ring-slate-200">Ingen faktorkommentarer tilføjet.</div>
                  ) : (
                    <div className="space-y-3">
                      {commentRows.map((row) => (
                        <div key={row.factor.id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="font-semibold">{row.factor.name}</div>
                              <div className="mt-1 text-xs text-slate-500">{row.factor.dim} · Score {scoreIntervalText(row.score)} · Datagrundlag {row.score.confidence}/5</div>
                            </div>
                            <Badge tone={row.factor.dim === "Værdi" ? "dark" : "blue"}>{row.factor.dim}</Badge>
                          </div>
                          <div className="mt-2 whitespace-pre-wrap rounded-xl bg-amber-50 p-3 text-slate-800 ring-1 ring-amber-200">{row.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <footer className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <BrandingLogo className="h-20 w-auto print:h-16" />
              <BrandingContactBlock />
            </div>
            <div className="max-w-xl text-xs leading-relaxed text-slate-500 md:text-right">
              <p>{BRANDING.output.decisionSupportNote}</p>
              <p className="mt-2">{BRANDING.output.confidentialityNote}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PrintReport({ company, directType, maturityOption, initiativeName, initiativeLink, defaultAnchorStyleLabel, factorCounts, valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh, confidence, status, roiProxy, factorReportRows, criticalUnscoredRows, overallNotes, onClose }) {
  const scoredRows = factorReportRows.filter((row) => row.score.touched);
  const unscoredRowsWithComments = factorReportRows.filter((row) => !row.score.touched && factorCommentText(row));
  return (
    <div className="print-report-shell fixed inset-0 z-50 overflow-auto bg-white p-6 text-slate-900">
      <div className="no-print sticky top-0 z-10 mb-6 flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold">Print-/PDF-visning</div>
          <div className="text-xs text-slate-500">Brug browserens printdialog og vælg “Gem som PDF”, hvis rapporten skal gemmes digitalt.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Udskriv / Gem som PDF</button>
          <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Luk printvisning</button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">
        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <BrandingLogo className="h-28 w-auto print:h-24" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{BRANDING.tool.name}</div>
                <h1 className="mt-1 text-2xl font-semibold">{initiativeName || "Ikke navngivet initiativ"}</h1>
                <p className="mt-2 text-sm text-slate-600">{BRANDING.tool.subtitle}</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <Badge tone="blue">{BRANDING.tool.version}</Badge>
              <BrandingContactBlock compact className="mt-3" />
            </div>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div><span className="font-semibold">Virksomhed:</span> {company.name}</div>
            <div><span className="font-semibold">Initiativtype:</span> {directType.name}</div>
            <div><span className="font-semibold">Beslutningsniveau:</span> {maturityOption.name}</div>
            <div><span className="font-semibold">Standard scorelogik:</span> {defaultAnchorStyleLabel}</div>
            <div className="md:col-span-2"><span className="font-semibold">Initiativbeskrivelse:</span> {initiativeLink ? <span className="break-all">{normalizeInitiativeLink(initiativeLink)}</span> : "Ikke tilføjet"}</div>
          </div>
        </section>

        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Samlet vurdering</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">Værdi</div><div className="text-2xl font-semibold">{displayScore(valueBest)}</div><div className="text-xs text-slate-500">Interval {displayScore(valueLow)}-{displayScore(valueHigh)}</div></div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">Gennemførlighed</div><div className="text-2xl font-semibold">{displayScore(feasibilityBest)}</div><div className="text-xs text-slate-500">Interval {displayScore(feasibilityLow)}-{displayScore(feasibilityHigh)}</div></div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">Datagrundlag / sikkerhed</div><div className="text-2xl font-semibold">{displayScore(confidence)}/5</div><div className="text-xs text-slate-500">Prioriteringsindikator {Number.isFinite(roiProxy) ? roiProxy.toFixed(0) : "-"}</div></div>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><span className="font-semibold">Status:</span> {status.label}</div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><span className="font-semibold">Faktorbalance:</span> {factorCounts.value} Værdi / {factorCounts.feasibility} Gennemførlighed</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.2fr]">
            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed ring-1 ring-slate-200">
              <div className="font-semibold">Matrixfortolkning</div>
              <p className="mt-2 text-slate-700">Diagrammet viser initiativets bedste bud som punkt og usikkerhedsinterval som felt. Værdi læses lodret, og gennemførlighed læses vandret.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <h3 className="mb-2 text-base font-semibold">Værdi vs. gennemførlighed</h3>
              <MatrixDiagram valueBest={valueBest} feasibilityBest={feasibilityBest} valueLow={valueLow} valueHigh={valueHigh} feasibilityLow={feasibilityLow} feasibilityHigh={feasibilityHigh} className="h-80 w-full print:h-72" labelSize={6.2} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Scorede faktorer</h2>
            <p className="text-sm text-slate-600">Alle anchor statements vises, så vurderingen kan gennemgås og justeres uden PC. Valgte score(r) er markeret.</p>
          </div>
          {scoredRows.length === 0 ? <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">Ingen faktorer er scoret endnu.</div> : scoredRows.map((row) => (
            <article key={row.factor.id} className="print-break-inside-avoid rounded-2xl border border-slate-200 p-5">
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.factor.dim}</div>
                  <h3 className="text-base font-semibold">{row.factor.name}</h3>
                  <div className="mt-1 text-xs text-slate-500">Tags: {row.factor.tags.join(", ")}</div>
                  <div className="mt-1 text-xs text-slate-500">Beskrivelseslogik: {row.anchorStyleName}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                  <div><span className="font-semibold">Valgt score:</span> {scoreIntervalText(row.score)}</div>
                  <div><span className="font-semibold">Bedste bud:</span> {displayRawScore(bestScore(row.score))}</div>
                  <div><span className="font-semibold">Datagrundlag:</span> {row.score.confidence}/5</div>
                </div>
              </div>
              <div className="space-y-2">
                {SCORE_LEVELS.map((level) => {
                  const marker = selectedAnchorMarker(row.score, level);
                  return (
                    <div key={level} className={`rounded-xl border p-3 text-sm ${marker ? "border-2 border-slate-900 bg-white text-slate-950 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400 opacity-70"}`}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className={`font-semibold ${marker ? "text-slate-950" : "text-slate-500"}`}>Score {level}</span>
                        {marker && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-slate-900">{marker}</span>}
                      </div>
                      <div className={marker ? "font-medium text-slate-900" : "text-slate-500"}>{row.anchors[level]}</div>
                    </div>
                  );
                })}
              </div>
              {factorCommentText(row) && <div className="mt-3 whitespace-pre-wrap rounded-xl bg-amber-50 p-3 text-sm ring-1 ring-amber-200"><span className="font-semibold">Kommentar / databehov:</span> {factorCommentText(row)}</div>}
            </article>
          ))}
        </section>

        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Ikke-scorede faktorer med kommentarer</h2>
          {unscoredRowsWithComments.length === 0 ? <p className="mt-2 text-sm text-slate-600">Ingen kommentarer til ikke-scorede faktorer.</p> : (
            <div className="mt-3 space-y-3">
              {unscoredRowsWithComments.map((row) => (
                <article key={row.factor.id} className="rounded-xl bg-amber-50 p-3 text-sm ring-1 ring-amber-200">
                  <div className="font-semibold">{row.factor.name} <span className="font-normal text-slate-600">({row.factor.dim}, ikke scoret)</span></div>
                  <div className="mt-2 whitespace-pre-wrap text-slate-700">{factorCommentText(row)}</div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Kritiske ikke-scorede faktorer</h2>
          {criticalUnscoredRows.length === 0 ? <p className="mt-2 text-sm text-slate-600">Ingen kritiske/gate-relevante faktorer er udeladt fra scoringen.</p> : (
            <ul className="mt-3 space-y-2 text-sm">
              {criticalUnscoredRows.map((row) => <li key={row.factor.id} className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200"><span className="font-semibold">{row.factor.name}</span> ({row.factor.dim}) er ikke scoret, men bør vurderes før ekstern kommunikation eller endelig prioritering.</li>)}
            </ul>
          )}
        </section>

        <section className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Noter og næste skridt</h2>
          <div className="mt-3 min-h-24 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200">{overallNotes && overallNotes.trim() ? overallNotes : "Ingen noter tilføjet endnu."}</div>
        </section>

        <footer className="print-break-inside-avoid rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <BrandingLogo className="h-20 w-auto print:h-16" />
              <BrandingContactBlock />
            </div>
            <div className="max-w-xl text-xs leading-relaxed text-slate-500 md:text-right">
              <p>{BRANDING.output.decisionSupportNote}</p>
              <p className="mt-2">{BRANDING.output.confidentialityNote}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function BuviScoringPrototype() {
  const savedState = useMemo(() => loadSavedWorkshopState(), []);
  const initialWorkshopState = useMemo(() => getInitialWorkshopState(savedState), [savedState]);
  const [assessments, setAssessments] = useState(initialWorkshopState.assessments);
  const [activeAssessmentId, setActiveAssessmentId] = useState(initialWorkshopState.activeAssessmentId);
  const [anchorConfigBank, setAnchorConfigBank] = useState(savedState?.anchorConfigBank || createAnchorConfigBank());
  const [savedAt, setSavedAt] = useState(savedState?.savedAt || null);
  const [storageStatus, setStorageStatus] = useState(savedState ? "Indlæst fra denne browser" : "Ikke gemt endnu");
  const [exportStatus, setExportStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [showPortfolioPrintReport, setShowPortfolioPrintReport] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const activeAssessment = assessments.find((assessment) => assessment.id === activeAssessmentId) || assessments[0] || createAssessment();
  const updateActiveAssessment = (patch) => {
    setAssessments((prev) => prev.map((assessment) => assessment.id === activeAssessment.id ? { ...assessment, ...patch, updatedAt: new Date().toISOString() } : assessment));
  };
  const setCompanyId = (value) => updateActiveAssessment({ companyId: value });
  const setInitiativeType = (value) => updateActiveAssessment({ initiativeType: value });
  const setMaturity = (value) => updateActiveAssessment({ maturity: value });
  const setInitiativeName = (value) => updateActiveAssessment({ initiativeName: value });
  const setInitiativeLink = (value) => updateActiveAssessment({ initiativeLink: value });
  const setAnchorStyle = (value) => updateActiveAssessment({ anchorStyle: value });
  const setOverallNotes = (value) => updateActiveAssessment({ overallNotes: value });
  const setScores = (updater) => updateActiveAssessment({ scores: typeof updater === "function" ? updater(activeAssessment.scores || {}) : updater });
  const companyId = activeAssessment.companyId;
  const initiativeType = activeAssessment.initiativeType;
  const maturity = activeAssessment.maturity;
  const initiativeName = activeAssessment.initiativeName;
  const initiativeLink = activeAssessment.initiativeLink;
  const anchorStyle = activeAssessment.anchorStyle;
  const overallNotes = activeAssessment.overallNotes || "";

  const createNewAssessment = () => {
    const next = createAssessment({
      companyId,
      initiativeType,
      maturity,
      anchorStyle,
      initiativeName: `Nyt initiativ ${assessments.length + 1}`,
      scores: {},
      overallNotes: "",
    });
    setAssessments((prev) => [...prev, next]);
    setActiveAssessmentId(next.id);
  };
  const duplicateActiveAssessment = () => {
    const clone = cloneAssessment(activeAssessment);
    setAssessments((prev) => [...prev, clone]);
    setActiveAssessmentId(clone.id);
  };
  const deleteActiveAssessment = () => {
    if (assessments.length <= 1) return;
    const remaining = assessments.filter((assessment) => assessment.id !== activeAssessment.id);
    setAssessments(remaining);
    setActiveAssessmentId(remaining[0].id);
  };

  const company = companies.find((item) => item.id === companyId) || companies[0];
  const maturityOption = maturityOptions.find((item) => item.id === maturity) || maturityOptions[1];
  const directType = initiativeTypes.find((item) => item.id === initiativeType) || initiativeTypes[0];
  const activeAnchorStyle = anchorStyleOptions.find((item) => item.id === anchorStyle) || anchorStyleOptions[0];
  const factors = useMemo(() => buildFactors(company.package, initiativeType, maturityOption.factorLimit), [company.package, initiativeType, maturityOption.factorLimit, resetCounter]);
  const factorCounts = getDimensionCounts(factors);
  const initialScores = useMemo(() => defaultScores(factors), [factors]);
  const scores = activeAssessment.scores || initialScores;

  React.useEffect(() => {
    if (resetCounter > 0) {
      setScores(defaultScores(factors));
      setOverallNotes("");
      setStorageStatus("Scoring nulstillet lokalt i denne session");
      return;
    }
    setScores((prev) => ({ ...defaultScores(factors), ...prev }));
  }, [factors, resetCounter]);

  React.useEffect(() => {
    const state = {
      anchorConfigBank,
      activeAssessmentId,
      assessments,
    };
    const ok = saveWorkshopState(state);
    const timestamp = new Date().toISOString();
    if (ok) {
      setSavedAt(timestamp);
      setStorageStatus("Gemt lokalt i denne browser");
    } else {
      setStorageStatus("Kunne ikke gemme lokalt i browseren");
    }
  }, [anchorConfigBank, activeAssessmentId, assessments]);

  const getCenterConfig = (factor) => getAnchorConfigFromBank(anchorConfigBank, factor);
  const updateCenterConfig = (factorId, nextConfig) => setAnchorConfigBank((prev) => updateAnchorConfigBank(prev, factorId, nextConfig));
  const setScore = (factorId, field, nextValue) => {
    setScores((prev) => {
      const current = prev[factorId] || { low: null, high: null, confidence: 2, assumption: "", touched: false };
      const updated = field === "confidence" ? { ...current, confidence: nextValue } : field === "anchor" ? applyAnchorClick(current, nextValue) : applyBoundScore(current, field, nextValue);
      return { ...prev, [factorId]: updated };
    });
  };

  const valueBest = weightedAverage(factors, scores, "Værdi", "best");
  const feasibilityBest = weightedAverage(factors, scores, "Gennemførlighed", "best");
  const valueLow = weightedAverage(factors, scores, "Værdi", "low");
  const valueHigh = weightedAverage(factors, scores, "Værdi", "high");
  const feasibilityLow = weightedAverage(factors, scores, "Gennemførlighed", "low");
  const feasibilityHigh = weightedAverage(factors, scores, "Gennemførlighed", "high");
  const confidence = factors.length ? factors.reduce((sum, factor) => sum + ((scores[factor.id] && scores[factor.id].confidence) || 1), 0) / factors.length : 0;
  const status = scoreStatus(valueBest, feasibilityBest, confidence);
  const roiProxy = Number.isFinite(valueBest) && Number.isFinite(feasibilityBest) ? valueBest * feasibilityBest : null;
  const normalizedInitiativeLink = normalizeInitiativeLink(initiativeLink);
  const exportResult = { valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh, confidence, roiProxy, status: status.label };
  const workshopSummary = buildWorkshopSummary({ company, directType, maturityOption, initiativeName, initiativeLink, valueBest, feasibilityBest, valueLow, valueHigh, feasibilityLow, feasibilityHigh, confidence, status, roiProxy, factorCounts, overallNotes });
  const exportPayload = buildExportPayload({ company, directType, maturityOption, initiativeName, initiativeLink, defaultAnchorStyle: anchorStyle, factorCounts, factors, scores, anchorConfigBank, result: exportResult, overallNotes });
  const factorReportRows = factors.map((factor) => {
    const centerConfig = getCenterConfig(factor);
    const factorAnchorStyle = getFactorAnchorStyle(anchorConfigBank, factor, anchorStyle);
    const anchors = buildAnchors(factor, centerConfig, factorAnchorStyle);
    const score = normalizeScoreRange(scores[factor.id] || { low: null, high: null, confidence: 2, assumption: "", touched: false });
    return { factor, centerConfig, anchors, score, anchorStyle: factorAnchorStyle, anchorStyleName: anchorStyleOptions.find((item) => item.id === factorAnchorStyle)?.name || factorAnchorStyle };
  });
  const criticalUnscoredRows = factorReportRows.filter((row) => !row.score.touched && isCriticalUnscoredFactor(row.factor));
  const commentStats = getCommentStatsForFactors(factors, scores);
  const factorDescriptionGroups = groupFactorsByDimension(factors);
  const assessmentResults = useMemo(() => assessments.map((assessment) => getAssessmentResult(assessment)), [assessments]);
  const scoredAssessmentResults = assessmentResults.filter((result) => result.hasMatrixScore);
  const portfolioExportPayload = useMemo(() => buildPortfolioExportPayload({ assessments, assessmentResults, anchorConfigBank }), [assessments, assessmentResults, anchorConfigBank]);
  const portfolioSummary = useMemo(() => buildPortfolioSummary({ assessmentResults }), [assessmentResults]);

  const hasMatrixScore = Number.isFinite(valueBest) && Number.isFinite(feasibilityBest);
  const hasMatrixRange = Number.isFinite(valueLow) && Number.isFinite(valueHigh) && Number.isFinite(feasibilityLow) && Number.isFinite(feasibilityHigh);
  const pointX = hasMatrixScore ? Math.min(92, Math.max(8, (feasibilityBest / 12) * 84 + 8)) : null;
  const pointY = hasMatrixScore ? Math.min(92, Math.max(8, 100 - ((valueBest / 12) * 84 + 8))) : null;
  const rectX = hasMatrixRange ? Math.min((feasibilityLow / 12) * 84 + 8, (feasibilityHigh / 12) * 84 + 8) : null;
  const rectY = hasMatrixRange ? Math.min(100 - ((valueHigh / 12) * 84 + 8), 100 - ((valueLow / 12) * 84 + 8)) : null;
  const rectW = hasMatrixRange ? Math.abs(((feasibilityHigh - feasibilityLow) / 12) * 84) : null;
  const rectH = hasMatrixRange ? Math.abs(((valueHigh - valueLow) / 12) * 84) : null;
  const statusClass = { green: "bg-emerald-50 ring-emerald-200", amber: "bg-amber-50 ring-amber-200", red: "bg-rose-50 ring-rose-200", gray: "bg-slate-50 ring-slate-200", blue: "bg-sky-50 ring-sky-200" }[status.tone] || "bg-sky-50 ring-sky-200";
  const copyShareLink = async (url) => {
    const ok = await copyTextToClipboard(url);
    setShareStatus(ok ? "Link kopieret" : "Kunne ikke kopiere link automatisk");
  };

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } .print-report-shell { position: static !important; inset: auto !important; overflow: visible !important; padding: 0 !important; } .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; } @page { margin: 14mm; } }`}</style>
      {showPrintReport && (
        <PrintReport
          company={company}
          directType={directType}
          maturityOption={maturityOption}
          initiativeName={initiativeName}
          initiativeLink={initiativeLink}
          defaultAnchorStyleLabel={activeAnchorStyle.name}
          factorCounts={factorCounts}
          valueBest={valueBest}
          feasibilityBest={feasibilityBest}
          valueLow={valueLow}
          valueHigh={valueHigh}
          feasibilityLow={feasibilityLow}
          feasibilityHigh={feasibilityHigh}
          confidence={confidence}
          status={status}
          roiProxy={roiProxy}
          factorReportRows={factorReportRows}
          criticalUnscoredRows={criticalUnscoredRows}
          overallNotes={overallNotes}
          onClose={() => setShowPrintReport(false)}
        />
      )}
      {showPortfolioPrintReport && (
        <PortfolioPrintReport
          assessmentResults={assessmentResults}
          activeAssessmentId={activeAssessmentId}
          onClose={() => setShowPortfolioPrintReport(false)}
        />
      )}
    <div className={`min-h-screen bg-slate-50 p-6 text-slate-900 ${showPrintReport || showPortfolioPrintReport ? "no-print" : ""}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <BrandingLogo className="h-32 w-auto" />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>BUVI prototype</Badge>
                <Badge>{BRANDING.tool.name} {BRANDING.tool.version}</Badge>
                <Badge tone="green">Anchor-baseret scoring</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Vurder og sammenlign bæredygtighedsinitiativer</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">Start med initiativet, score faktorerne, fasthold drøftelserne og brug matrix/PDF som beslutningsgrundlag.</p>
              <BrandingContactBlock compact className="mt-3" />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setResetCounter((value) => value + 1)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Nulstil scoring</button>
            <button type="button" onClick={() => { const next = createAssessment(); clearSavedWorkshopState(); setAssessments([next]); setActiveAssessmentId(next.id); setAnchorConfigBank(createAnchorConfigBank()); setSavedAt(null); setStorageStatus("Lokal browserdata er slettet"); }} className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Slet lokal data</button>
          </div>
        </header>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
              <div><span className="font-semibold">Lokal lagring:</span> {storageStatus}. Dine scoringer gemmes kun i denne browser på denne computer og sendes ikke til GitHub, Business Viborg eller underviser.</div>
              <div className="text-xs text-slate-500">{savedAt ? `Senest gemt: ${new Date(savedAt).toLocaleString("da-DK")}` : "Ingen gemt tidsstempel endnu"}</div>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
              <span className="font-semibold text-slate-800">{BRANDING.organization.shortName}:</span> {BRANDING.output.decisionSupportNote}
            </div>
          </CardContent>
        </Card>

        <StartHereGuide />

        <ShareLinkQrBlock onCopy={copyShareLink} status={shareStatus} />

        <Card id="section-initiatives" className="border-l-4 border-l-emerald-500 bg-emerald-50/30">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeader label="0" title="Initiativer" theme={SECTION_THEMES.scoring}>
                <p>Opret, skift, duplikér og slet lokale initiativvurderinger. Fælles faktorbeskrivelser deles på tværs af initiativer; scoringer og kommentarer er pr. initiativ.</p>
              </SectionHeader>
              <Badge tone="green">{assessments.length} initiativ{assessments.length === 1 ? "" : "er"}</Badge>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Aktivt initiativ</label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2" value={activeAssessment.id} onChange={(event) => setActiveAssessmentId(event.target.value)}>
                  {assessments.map((assessment, index) => <option key={assessment.id} value={assessment.id}>{index + 1}. {assessment.initiativeName || "Ikke navngivet initiativ"}</option>)}
                </select>
                <p className="text-xs text-slate-500">Den valgte vurdering redigeres i sektionerne nedenfor.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={createNewAssessment} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Nyt initiativ</button>
                <button type="button" onClick={duplicateActiveAssessment} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Duplikér</button>
                <button type="button" onClick={deleteActiveAssessment} disabled={assessments.length <= 1} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Slet</button>
              </div>
            </div><BackToStartButton /></CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-4">
          <Card id="section-configuration" className={`lg:col-span-3 ${SECTION_THEMES.configuration.card}`}>
            <CardContent className="p-5">
              <SectionHeader label="1" title="Konfiguration" theme={SECTION_THEMES.configuration} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectField label="Virksomhed" value={companyId} onChange={setCompanyId} options={companies} hint={company.label} />
                <SelectField label="Initiativtype" value={initiativeType} onChange={setInitiativeType} options={initiativeTypes} hint={directType.hint} />
                <SelectField label="Hvor grundig skal vurderingen være?" value={maturity} onChange={setMaturity} options={maturityOptions} hint={maturityOption.hint} />
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Initiativtitel</label>
                  <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2" value={initiativeName} onChange={(event) => setInitiativeName(event.target.value)} />
                  <p className="text-xs text-slate-500">Bruges i resultat, eksport og print.</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Link til initiativbeskrivelse</label>
                <input type="url" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2" placeholder="https://..." value={initiativeLink} onChange={(event) => setInitiativeLink(event.target.value)} />
                <div className="text-xs text-slate-500">{normalizedInitiativeLink ? <a className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2" href={normalizedInitiativeLink} target="_blank" rel="noreferrer">Åbn initiativbeskrivelse</a> : "Indsæt fx link til PowerPoint, PDF, SharePoint eller OneDrive."}</div>
              </div><BackToStartButton /></CardContent>
          </Card>

          <Card className={SECTION_THEMES.engine.card}>
            <CardContent className="p-5">
              <SectionHeader label="M" title="Motoren vælger" theme={SECTION_THEMES.engine} />
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-slate-100 p-3"><div className="text-xs text-slate-500">Branchepakke</div><div className="font-medium">{company.package}</div></div>
                <div className="rounded-xl bg-slate-100 p-3"><div className="text-xs text-slate-500">Faktorer i skema</div><div className="font-medium">{factors.length} faktorer</div><div className="mt-1 text-xs text-slate-500">{factorCounts.value} Værdi / {factorCounts.feasibility} Gennemførlighed</div></div>
                <div className={`rounded-xl p-3 ring-1 ${factorCounts.isBalanced ? "bg-emerald-50 ring-emerald-200" : "bg-rose-50 ring-rose-200"}`}><div className="text-xs text-slate-500">Balancekrav</div><div className="font-medium">{factorCounts.isBalanced ? "Opfyldt" : "Kræver justering"}</div><div className="mt-1 text-xs text-slate-500">Maks. forskel: 1 faktor</div></div>
                <div className="rounded-xl bg-slate-100 p-3"><div className="text-xs text-slate-500">Moduler</div><div className="font-medium">Kerne + branche + initiativtype</div></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card id="section-standard-logic" className={SECTION_THEMES.standardLogic.card}>
          <CardContent className="p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <SectionHeader label="2" title="Standardforklaring, hvis faktoren ikke tilpasses" theme={SECTION_THEMES.standardLogic}>
                  <p className="max-w-3xl">Hvis I ikke ændrer en faktor, bruger værktøjet denne standardforklaring for score 0, 3, 6, 9 og 12.</p>
                </SectionHeader>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {anchorStyleOptions.map((option) => (
                <button key={option.id} type="button" onClick={() => setAnchorStyle(option.id)} className={`rounded-2xl p-4 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-sm ${anchorStyle === option.id ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-800 ring-slate-200"}`}>
                  <div className="font-semibold">{option.name}</div>
                  <div className={`mt-2 text-xs leading-relaxed ${anchorStyle === option.id ? "text-slate-100" : "text-slate-500"}`}>{option.hint}</div>
                </button>
              ))}
            </div><BackToStartButton /></CardContent>
        </Card>

        <Card id="section-factor-descriptions" className={SECTION_THEMES.factorDescriptions.card}>
          <CardContent className="p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <SectionHeader label="3" title="Fælles scoreforklaring for faktorer" theme={SECTION_THEMES.factorDescriptions}>
                  <p className="max-w-4xl">Her tilpasser I, hvad score 0, 3, 6, 9 og 12 betyder for hver faktor. Dette er ikke selve scoringen; det aktive initiativ scores i næste sektion.</p>
                </SectionHeader>
              </div>
            </div>
            <div className="mb-4 rounded-2xl bg-white p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
              <span className="font-semibold">Vigtigt:</span> Ændringer her gælder som fælles scoreforklaring for alle initiativer, der bruger faktoren. Scorevalg, kommentarer og datagrundlag registreres først i sektion 4.
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                {
                  key: "value",
                  title: "Værdifaktorer",
                  dim: "Værdi",
                  factors: factorDescriptionGroups.value,
                  badgeTone: "dark",
                  wrapperClass: "border-l-4 border-l-slate-900 bg-slate-50 ring-slate-200",
                  cardClass: "border-slate-300 bg-white",
                  note: "Fælles beskrivelser for effekt, værdi og strategisk relevans.",
                },
                {
                  key: "feasibility",
                  title: "Gennemførlighedsfaktorer",
                  dim: "Gennemførlighed",
                  factors: factorDescriptionGroups.feasibility,
                  badgeTone: "blue",
                  wrapperClass: "border-l-4 border-l-sky-500 bg-sky-50/60 ring-sky-200",
                  cardClass: "border-sky-200 bg-white",
                  note: "Fælles beskrivelser for realisme, dokumentation og praktisk gennemførelse.",
                },
              ].map((group) => (
                <section key={group.key} className={`rounded-2xl p-4 ring-1 ${group.wrapperClass}`}>
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge tone={group.badgeTone}>{group.dim}</Badge>
                        <h3 className="text-base font-semibold">{group.title}</h3>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{group.note}</p>
                    </div>
                    <Badge>{group.factors.length} faktor{group.factors.length === 1 ? "" : "er"}</Badge>
                  </div>
                  <div className="space-y-4">
                    {group.factors.map((factor) => {
                      const centerConfig = getCenterConfig(factor);
                      const factorAnchorStyle = getFactorAnchorStyle(anchorConfigBank, factor, anchorStyle);
                      const anchors = buildAnchors(factor, centerConfig, factorAnchorStyle);
                      return (
                        <article key={factor.id} className={`rounded-2xl border p-4 ${group.cardClass}`}>
                          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2"><Badge tone={group.badgeTone}>{factor.dim}</Badge><h4 className="font-semibold">{factor.name}</h4><Badge>{anchorStyleOptions.find((item) => item.id === factorAnchorStyle)?.name || factorAnchorStyle}</Badge></div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">{factor.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                            </div>
                            
                          </div>
                          <details className="rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                            <summary className="cursor-pointer font-semibold text-slate-700">Rediger fælles faktorbeskrivelse</summary>
                            <div className="mt-3">
                              <CenterConfigEditor factor={factor} config={centerConfig} anchorStyle={factorAnchorStyle} currentCenterStatement={anchors[6]} onChange={(nextConfig) => updateCenterConfig(factor.id, nextConfig)} onAnchorStyleChange={(nextStyle) => setAnchorConfigBank((prev) => updateFactorAnchorStyle(prev, factor.id, nextStyle))} />
                            </div>
                          </details>
                          <details className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                            <summary className="cursor-pointer font-semibold text-slate-700">Vis anchor-preview for 0 / 3 / 6 / 9 / 12</summary>
                            <div className="mt-3 grid gap-2 md:grid-cols-5 xl:grid-cols-1 2xl:grid-cols-5">
                              {SCORE_LEVELS.map((level) => (
                                <div key={level} className="rounded-xl bg-white p-3 text-xs leading-relaxed ring-1 ring-slate-200">
                                  <div className="mb-1 font-semibold text-slate-900">Score {level}</div>
                                  <div className="text-slate-600">{anchors[level]}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div><BackToStartButton /></CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card id="section-scoring" className={`xl:col-span-2 ${SECTION_THEMES.scoring.card}`}>
            <CardContent className="p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2"><SectionIcon label="4" theme={SECTION_THEMES.scoring} /><h2 className="text-lg font-semibold">Score det aktive initiativ</h2></div>
                  <p className="mt-2 text-sm text-slate-600">Kommentarerne er en del af workshopresultatet. Brug dem til at fastholde antagelser, uenigheder, databehov og beslutningspunkter.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="green">Scoring for aktivt initiativ</Badge>
                  <Badge tone={commentStats.missingCommentCount > 0 ? "amber" : "green"}>Kommentarer {commentStats.commentedScoreCount}/{commentStats.scoredCount || 0}</Badge>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    key: "value",
                    title: "Værdifaktorer",
                    dim: "Værdi",
                    factors: factorDescriptionGroups.value,
                    badgeTone: "dark",
                    wrapperClass: "border-l-4 border-l-slate-900 bg-slate-50 ring-slate-200",
                    cardClass: "border-slate-300 bg-white",
                    note: "Vurderer initiativets effekt, værdi og strategiske relevans.",
                  },
                  {
                    key: "feasibility",
                    title: "Gennemførlighedsfaktorer",
                    dim: "Gennemførlighed",
                    factors: factorDescriptionGroups.feasibility,
                    badgeTone: "blue",
                    wrapperClass: "border-l-4 border-l-sky-500 bg-sky-50/60 ring-sky-200",
                    cardClass: "border-sky-200 bg-white",
                    note: "Vurderer hvor realistisk, dokumenterbart og praktisk initiativet er at gennemføre.",
                  },
                ].map((group) => (
                  <section key={group.key} className={`rounded-2xl p-4 ring-1 ${group.wrapperClass}`}>
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone={group.badgeTone}>{group.dim}</Badge>
                          <h3 className="text-base font-semibold">{group.title}</h3>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{group.note}</p>
                      </div>
                      <Badge>{group.factors.length} faktor{group.factors.length === 1 ? "" : "er"}</Badge>
                    </div>

                    <div className="space-y-5">
                      {group.factors.map((factor) => {
                        const score = normalizeScoreRange(scores[factor.id] || { low: null, high: null, confidence: 2, assumption: "", touched: false });
                        const centerConfig = getCenterConfig(factor);
                        const factorAnchorStyle = getFactorAnchorStyle(anchorConfigBank, factor, anchorStyle);
                        const anchors = buildAnchors(factor, centerConfig, factorAnchorStyle);
                        const best = bestScore(score);
                        return (
                          <article key={factor.id} className={`rounded-2xl border p-4 ${group.cardClass}`}>
                            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2"><Badge tone={group.badgeTone}>{factor.dim}</Badge><h3 className="font-semibold">{factor.name}</h3><Badge>{anchorStyleOptions.find((item) => item.id === factorAnchorStyle)?.name || factorAnchorStyle}</Badge></div>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">{factor.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                              </div>
                              <div className="grid min-w-64 grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-xl bg-sky-50 p-2 ring-1 ring-sky-200"><div className="text-slate-500">Lav</div><div className="text-lg font-semibold text-sky-900">{displayRawScore(score.low)}</div></div>
                                <div className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200"><div className="text-slate-500">Bedste bud</div><div className="text-lg font-semibold">{displayRawScore(best)}</div></div>
                                <div className="rounded-xl bg-emerald-50 p-2 ring-1 ring-emerald-200"><div className="text-slate-500">Høj</div><div className="text-lg font-semibold text-emerald-900">{displayRawScore(score.high)}</div></div>
                              </div>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-5">
                              {SCORE_LEVELS.map((level) => <ScoreAnchorButton key={level} level={level} text={anchors[level]} selectedLow={score.touched && score.low === level} selectedHigh={score.touched && score.high === level} onClick={() => setScore(factor.id, "anchor", level)} />)}
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr]">
                              <div>
                                <div className="mb-1 flex justify-between text-xs"><span>Datagrundlag / sikkerhed</span><span>{score.confidence}/5</span></div>
                                <input type="range" min="1" max="5" step="1" value={score.confidence} onChange={(event) => setScore(factor.id, "confidence", Number(event.target.value))} className="w-full accent-slate-900" />
                                <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">{DATA_CONFIDENCE_DESCRIPTIONS[score.confidence]}</div>
                              </div>
                              <div className="space-y-2">
                                <textarea className={`min-h-20 w-full rounded-xl border bg-white p-3 text-sm outline-none ring-slate-300 focus:ring-2 ${score.touched && !factorCommentText({ score }) ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"}`} placeholder="Notér antagelser, uenighed, databehov eller næste afklaring for denne faktor..." value={score.assumption || ""} onChange={(event) => setScores((prev) => ({ ...prev, [factor.id]: { ...score, assumption: event.target.value } }))} />
                                {score.touched && !factorCommentText({ score }) && <div className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">{commentNudgeText(score)}</div>}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div><BackToStartButton /></CardContent>
          </Card>

          <div className="space-y-4">
            <Card id="section-result" className={SECTION_THEMES.result.card}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2"><SectionIcon label="5" theme={SECTION_THEMES.result} /><h2 className="text-lg font-semibold">Resultat</h2></div>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Initiativ</div>
                    <div className="mt-1 font-medium">{initiativeName}</div>
                    {normalizedInitiativeLink && <a className="mt-2 inline-flex text-xs font-medium text-sky-700 underline decoration-sky-300 underline-offset-2" href={normalizedInitiativeLink} target="_blank" rel="noreferrer">Åbn initiativbeskrivelse</a>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">Værdi</div><div className="text-3xl font-semibold">{displayScore(valueBest)}</div><div className="text-xs text-slate-500">Interval {displayScore(valueLow)}-{displayScore(valueHigh)}</div></div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">Gennemførlighed</div><div className="text-3xl font-semibold">{displayScore(feasibilityBest)}</div><div className="text-xs text-slate-500">Interval {displayScore(feasibilityLow)}-{displayScore(feasibilityHigh)}</div></div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="flex items-center justify-between"><div><div className="text-xs text-slate-500">Prioriteringsindikator</div><div className="text-2xl font-semibold">{Number.isFinite(roiProxy) ? roiProxy.toFixed(0) : "-"}</div></div><div><div className="text-xs text-slate-500">Datagrundlag / sikkerhed</div><div className="text-2xl font-semibold">{confidence.toFixed(1)}/5</div></div></div></div>
                  <div className={`rounded-2xl p-4 ring-1 ${commentStats.missingCommentCount > 0 ? "bg-amber-50 ring-amber-200" : "bg-emerald-50 ring-emerald-200"}`}><div className="text-xs text-slate-500">Kommentarstatus</div><div className="mt-1 font-semibold">{commentStats.commentedScoreCount}/{commentStats.scoredCount || 0} scorede faktorer har kommentarer</div><div className="mt-1 text-xs text-slate-600">{commentStats.missingCommentCount > 0 ? `${commentStats.missingCommentCount} scorede faktor(er) mangler kort note om drøftelse eller databehov.` : "Alle scorede faktorer har dokumenteret kommentar."}</div></div>
                  <div className={`rounded-2xl p-4 ring-1 ${statusClass}`}><div className="flex items-start gap-2"><Icon label={status.tone === "green" ? "OK" : "i"} /><div><div className="font-semibold">{status.label}</div><div className="text-sm text-slate-600">Scoren er et beslutningsstøtteværktøj, ikke en automatisk beslutning.</div></div></div></div>
                </div><BackToStartButton /></CardContent>
            </Card>

            <Card id="section-export" className={SECTION_THEMES.result.card}>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2"><SectionIcon label="E" theme={SECTION_THEMES.result} /><h2 className="text-lg font-semibold">Deling og eksport</h2></div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="mb-3">
                      <div className="text-sm font-semibold">Dette initiativ</div>
                      <div className="mt-1 text-xs text-slate-500">Lav PDF, kopiér tekst eller gem datafil for det aktive initiativ.</div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                      <button type="button" onClick={() => { const ok = downloadJsonFile(exportPayload, initiativeName || "buvi-vurdering"); setExportStatus(ok ? "Aktiv vurdering eksporteret som JSON" : "JSON-eksport fejlede"); }} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Gem datafil</button>
                      <button type="button" onClick={async () => { const ok = await copyTextToClipboard(workshopSummary); setExportStatus(ok ? "Opsummering kopieret" : "Kunne ikke kopiere opsummering"); }} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Kopiér tekst til mail/Word/PowerPoint</button>
                      <button type="button" onClick={() => { setShowPrintReport(true); setExportStatus("Print-/PDF-visning åbnet"); }} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Lav PDF for dette initiativ</button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="mb-3">
                      <div className="text-sm font-semibold">Alle initiativer i workshoppen</div>
                      <div className="mt-1 text-xs text-slate-500">Lav samlet workshop-PDF, kopiér tekst eller gem datafil for hele porteføljen.</div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                      <button type="button" onClick={() => { const ok = downloadJsonFile(portfolioExportPayload, "buvi-samlet-initiativliste"); setExportStatus(ok ? "Samlet initiativliste eksporteret" : "Portfolio-eksport fejlede"); }} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Gem samlet datafil</button>
                      <button type="button" onClick={async () => { const ok = await copyTextToClipboard(portfolioSummary); setExportStatus(ok ? "Samlet initiativliste kopieret" : "Kunne ikke kopiere samlet liste"); }} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Kopiér samlet tekst</button>
                      <button type="button" onClick={() => { setShowPortfolioPrintReport(true); setExportStatus("Portefølje print-/PDF-visning åbnet"); }} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">Lav samlet workshop-PDF</button>
                    </div>
                  </div>

                  {exportStatus && <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800 ring-1 ring-blue-200">{exportStatus}</div>}
                </div><BackToStartButton /></CardContent>
            </Card>

            <Card id="section-matrix" className={SECTION_THEMES.result.card}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Sammenligningsmatrix</h2>
                    <p className="mt-1 text-xs text-slate-600">Alle initiativer med både værdi- og gennemførlighedsscore vises som punkter. Det aktive initiativ er mørkt og viser usikkerhedsinterval.</p>
                  </div>
                  <Badge tone="blue">{scoredAssessmentResults.length}/{assessments.length} scoret</Badge>
                </div>
                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <ComparisonMatrixDiagram assessmentResults={assessmentResults} activeAssessmentId={activeAssessmentId} onSelect={setActiveAssessmentId} className="h-80 w-full" labelSize={5.6} />
                </div>
                <div className="mt-3 space-y-2">
                  {assessmentResults.map((result, index) => {
                    const isActive = result.assessment.id === activeAssessmentId;
                    return (
                      <button key={result.assessment.id} type="button" onClick={() => setActiveAssessmentId(result.assessment.id)} className={`w-full rounded-xl p-3 text-left text-xs ring-1 transition hover:bg-slate-50 ${isActive ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold">{index + 1}. {result.assessment.initiativeName || "Ikke navngivet initiativ"}</div>
                            <div className={isActive ? "mt-1 text-slate-200" : "mt-1 text-slate-500"}>{result.company.name} · {result.directType.name}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div>V {displayScore(result.valueBest)}</div>
                            <div>G {displayScore(result.feasibilityBest)}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div><BackToStartButton /></CardContent>
            </Card>

            <Card id="section-gates" className={SECTION_THEMES.gates.card}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2"><SectionIcon label="6" theme={SECTION_THEMES.gates} /><h2 className="text-lg font-semibold">Gates og næste skridt</h2></div>
                <div className="space-y-2 text-sm">
                  {confidence < 3 && <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">Datagrundlaget er lavt: brug resultatet til dialog og databehov, ikke ekstern kommunikation.</div>}
                  {factors.some((factor) => factor.id === "greenwashing" && ((scores[factor.id] && bestScore(scores[factor.id])) || 12) < 6) && <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200">Greenwashing-gate: grønne udsagn bør ikke publiceres før dokumentation og formulering er forbedret.</div>}
                  {Number.isFinite(valueBest) && Number.isFinite(feasibilityBest) && valueBest >= 8 && feasibilityBest < 6 && <div className="rounded-xl bg-sky-50 p-3 ring-1 ring-sky-200">Høj værdi, lav gennemførlighed: lav en afklaringsplan for investering, drift og kompetencer.</div>}
                  {Number.isFinite(valueBest) && Number.isFinite(feasibilityBest) && valueBest >= 7 && feasibilityBest >= 7 && confidence >= 3 && <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">God kandidat: gå videre med business case eller pilot.</div>}
                  <textarea className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-slate-300 focus:ring-2" placeholder="Notér samlet beslutning, manglende data eller næste beslutningspunkt..." value={overallNotes} onChange={(event) => setOverallNotes(event.target.value)} />
                </div><BackToStartButton /></CardContent>
            </Card>
          </div>
        </div>
        <footer className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <BrandingLogo className="h-20 w-auto" />
              <BrandingContactBlock />
            </div>
            <div className="max-w-2xl text-xs leading-relaxed text-slate-500 md:text-right">
              <p>{BRANDING.output.confidentialityNote}</p>
              <p className="mt-2">{BRANDING.tool.context}</p>
              <p className="mt-2"><span className="font-semibold text-slate-700">Workshoplink:</span> {SHARE_LINK.displayShortUrl}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}
