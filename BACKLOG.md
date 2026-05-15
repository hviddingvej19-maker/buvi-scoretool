# BUVI/OxF scoringsvaerktoej - backlog og udviklingslog

Senest opdateret: 2026-05-15  
Aktuel workshopversion: `v0.3.19-clean-blank-pdf`  
Repository: `hviddingvej19-maker/buvi-scoretool`  
Public app: `https://hviddingvej19-maker.github.io/buvi-scoretool/`

Dette dokument er projektets faelles backlog, udviklingslog og handover-note. Det er lavet, saa baade ChatGPT-traaden, Codex og fremtidige udviklingssessioner kan se:

- hvad der allerede er gennemfoert
- hvorfor aendringerne blev lavet
- hvad der stadig er aabent
- hvad der bevidst er parkeret til efter workshoppen
- hvordan workshopversionen boer fryses og videreudvikles senere

## 1. Projektformaal

BUVI/OxF scoringsvaerktoejet er et React/Vite-baseret workshopvaerktoej til vurdering og prioritering af baeredygtighedsinitiativer.

Vaerktoejet bruges i en workshop, hvor virksomheder eller organisationer vurderer egne initiativer ud fra to hoveddimensioner:

1. **Vaerdi**
2. **Gennemfoerlighed**

Scoren skal ikke forstaas som en automatisk beslutningsmaskine. Den skal fungere som beslutningsstoette og dialogvaerktoej. Det vigtigste workshopoutput er derfor baade:

- score
- scoreinterval/usikkerhed
- datagrundlag/sikkerhed
- kommentarer
- antagelser
- uenigheder
- databehov
- naeste afklaring
- sammenligning af flere initiativer

## 2. Aktuel workshopstatus

Aktuel version: `v0.3.19-clean-blank-pdf`

Denne version betragtes som en workshopkandidat, ikke som en endelig produktversion.

### Klar til workshopbrug

- ProBalance-branding
- lokal browserlagring
- flere initiativer
- faelles scoreforklaring pr. faktor
- initiativspecifik scoring
- scoreintervaller med 0 / 3 / 6 / 9 / 12
- datagrundlag 1-5
- kommentarfelter pr. faktor
- kommentar-chips
- sammenligningsmatrix
- aktiv initiativ-PDF
- samlet workshop-PDF
- nulstilling af scoring og kommentarer
- ren PDF efter nulstilling
- sikkerhedsadvarsel foer sletning og nulstilling

### Kendte begraensninger i workshopversionen

- Data gemmes kun lokalt i brugerens browser.
- Der findes ingen central facilitator-database.
- Der findes ingen faelles opsamling paa tvaers af deltagere.
- Faktorbank og standarddata aendres stadig i kode.
- QR/redirect er ikke endeligt loest.
- PDF-layout er funktionelt, men ikke designmaessigt faerdigpoleret.
- Der er ikke et egentlig admin-interface.
- Der er ikke tests i et formaliseret testframework endnu.
- Lint er ikke groent pr. 2026-05-15, selv om production build virker.

### Release-note om versioner

Der skal kun vaere en aktiv versionstreng i releasekandidaten. Backlog, UI, PDF/eksport og interne prototype-tests skal bruge samme versionsnavn inden release-freeze.

Aktuel beslutning for workshopkandidaten:

```text
v0.3.19-clean-blank-pdf
```

Foreslaaet endeligt release-tag efter sidste stabilitetstest:

```text
v0.3.20-workshop-release
```

## 3. Centrale designbeslutninger

### 3.1 Lokal lagring

Vaerktoejet gemmer scoringer i browserens `localStorage`.

Begrundelse:

- lav kompleksitet
- ingen login
- ingen GDPR-opsamling
- nem pilot/workshopbrug

Konsekvens:

- data deles ikke automatisk med facilitator
- bruger skal selv eksportere PDF/tekst/JSON
- data er lokal pr. browser og computer

### 3.2 Faelles scoreforklaring vs. initiativscoring

Der er bevidst skelnet mellem:

- **Faelles scoreforklaring for faktorer**: hvad score 0, 3, 6, 9 og 12 betyder for en faktor
- **Score det aktive initiativ**: den konkrete vurdering af et bestemt initiativ

Denne opdeling er vigtig, fordi flere initiativer kan bruge samme faktorlogik, mens scoring og kommentarer skal vaere forskellige pr. initiativ.

### 3.3 Kommentarer er workshopoutput

Kommentarer er ikke kun hjaelpetekst. De er en central del af beslutningsgrundlaget.

Derfor skal kommentarer:

- vises under hver faktor
- gemmes pr. initiativ
- indgaa i aktiv PDF
- indgaa i samlet workshop-PDF
- kunne bruges til at forklare antagelser, uenighed og databehov

### 3.4 Matrix som prioriteringsstoette

Matrixen viser initiativer ud fra Vaerdi og Gennemfoerlighed.

Vigtigt princip:

> Oeverst til hoejre er mest attraktivt, men matrixen er prioriteringsstoette - ikke en endelig beslutning.

## 4. Gennemfoerte kort

### v0.3.1 - Sammenligning af flere initiativer i samme matrix

**Status:** gennemfoert  
**Prioritet:** P0  
**Workshopvaerdi:** hoej

Deltagerne kan sammenligne flere initiativer visuelt i samme matrix.

Gennemfoert:

- flere lokale initiativer i samme browser
- aktivt initiativ kan vaelges
- initiativer vises i matrix, naar de har baade vaerdi- og gennemfoerlighedsscore
- aktivt initiativ markeres tydeligere
- initiativliste under matrix

### v0.3.2 - Eksporter samlet initiativliste

**Status:** gennemfoert  
**Prioritet:** P1

Gennemfoert:

- samlet JSON/datafil
- kopieret samlet initiativliste
- samlet workshop-PDF
- matrix med flere initiativer
- initiativliste med score, status og datagrundlag

### v0.3.4 - Genindfoer print-/PDF-knap og ryd op i eksporthandlinger

**Status:** gennemfoert  
**Prioritet:** P0/P1

Gennemfoert:

- aktiv PDF-knap genindfoert
- samlet workshop-PDF tilfoejet
- eksport samlet under "Deling og eksport"
- aktiv vurdering og samlet portefoelje adskilt

### v0.3.5 - Portefoelje-PDF med sammenligning

**Status:** gennemfoert  
**Prioritet:** P0/P1

Gennemfoert:

- portefoelje-PDF
- samlet matrix
- initiativliste
- kommentarer pr. initiativ
- aktivt initiativ markeret

### v0.3.6 - Kommentarer med i portefoelje-PDF

**Status:** gennemfoert  
**Prioritet:** P0

Gennemfoert:

- faktorkommentarer inkluderes i samlet workshop-PDF
- kommentarer vises pr. initiativ
- antagelser og databehov bevares i portefoeljeoutput

### v0.3.7 - Comment nudges

**Status:** gennemfoert  
**Prioritet:** P1

Gennemfoert:

- kommentarstatus i resultatkort
- nudge naar scorede faktorer mangler kommentar
- tekst der forklarer hvorfor kommentarer er vigtige

### v0.3.8 - Onboarding clarity

**Status:** gennemfoert  
**Prioritet:** P0

Gennemfoert:

- ny "Start her"-boks
- trins-flow
- mere workshop-naer hovedtitel
- tydeligere forklaring af score, kommentarer og beslutningsstoette
- bedre skelnen mellem scoreforklaring og scoring

### v0.3.9 - Start her-links

**Status:** gennemfoert  
**Prioritet:** P1

Gennemfoert:

- klikbare trin
- navigation til relevante sektioner
- knapper under Start her fjernet

### v0.3.10 - Section navigation

**Status:** gennemfoert  
**Prioritet:** P1

Gennemfoert:

- `Card` understoetter `id` og props
- sektioner fik stabile id'er
- "Tilbage til Start her"-knapper tilfoejet
- tilbageknapper skjules i print

### v0.3.11 - Fjern navigation artifacts

**Status:** gennemfoert  
**Prioritet:** P0 bugfix

Gennemfoert:

- `$1`-artefakter fjernet

### v0.3.12 - Kommentar-eksempler og kommentar-chips

**Status:** gennemfoert  
**Prioritet:** P1

Gennemfoert kommentar-chips:

- Antagelse
- Uenighed
- Databehov
- Naeste afklaring

### v0.3.13 - Fix comment template build

**Status:** gennemfoert  
**Prioritet:** P0 bugfix

Gennemfoert:

- build-fejl pga. linjeskift i JavaScript-string rettet
- intern test for append af kommentar-template

### v0.3.14 - Reviewed bugfix

**Status:** gennemfoert  
**Prioritet:** P0 bugfix/stabilisering

Gennemfoert:

- samlet kode omskrevet og stabiliseret
- versionsstyring samlet i `APP_VERSION`
- printkomponenter samlet
- interne prototype-tests udbygget
- mere robust datamodel for reset, scoring og export

### v0.3.15 - Workshop safety polish

**Status:** gennemfoert  
**Prioritet:** P0/P1

Gennemfoert:

- bekraeftelse foer slet initiativ
- bekraeftelse foer slet lokal data
- bedre forklaring af dupliker
- tydeligere matrixforklaring
- PDF-note om matrix som prioriteringsstoette

### v0.3.16 - Reset and switch fix

**Status:** gennemfoert  
**Prioritet:** P0 bugfix

Gennemfoert:

- `resetCounter` fjernet
- nulstilling sker direkte paa aktivt initiativ
- skift mellem initiativer sletter ikke score
- nulstilling kraever bekraeftelse

### v0.3.17 - Matrix and reset cleanup

**Status:** gennemfoert  
**Prioritet:** P0 bugfix

Gennemfoert:

- matrix bruger oprindeligt initiativnummer
- aktivt interval vises kun for aktivt scoret initiativ
- nulstilling lukker PDF-visninger
- nulstilling rydder scores, kommentarer og noter for aktivt initiativ
- slet lokal data rydder BUVI-localStorage-noegler

### v0.3.18 - Hard reset comments

**Status:** gennemfoert  
**Prioritet:** P0 bugfix

Gennemfoert:

- reset fjerner hele `scores`-objektet for aktivt initiativ
- reset fjerner gamle `assumption`-kommentarer
- reset gemmer direkte i localStorage
- slet lokal data opretter ren state
- intern test for at gammel kommentar ikke bliver haengende

### v0.3.19 - Clean blank PDF

**Status:** gennemfoert  
**Prioritet:** P0 bugfix/workshop polish

Gennemfoert:

- kritiske ikke-scorede faktorer vises ikke paa tom/nulstillet vurdering
- sektionen vises kun, naar vurderingen er paabegyndt
- titel aendret til "Automatiske metodeadvarsler"
- forklaring tilfoejet, saa sektionen ikke forveksles med brugerkommentarer

## 5. Aaben backlog foer workshop

### P0 - Release freeze og stabilitetstest

**Status:** aaben  
**Foreslaaet version:** `v0.3.20-workshop-release-freeze`

Acceptance criteria:

- `npm.cmd run build` virker
- `npm.cmd run preview` virker
- public GitHub Pages viser nyeste version
- Start her-links virker
- Tilbageknapper virker
- Slet lokal data virker
- Nulstil scoring virker
- kommentarer forsvinder efter nulstilling
- matrix virker med to initiativer
- aktiv PDF virker
- samlet workshop-PDF virker
- kopier tekst virker
- gem datafil virker
- test udfoert i workshop-browser/laptop
- versionstreng er synkroniseret mellem `src/App.jsx`, `BACKLOG.md`, UI, PDF/eksport og interne prototype-tests

Anbefalet commitnavn:

```text
Freeze BUVI workshop release v0.3.20
```

### P1 - Gem referencefiler for workshopversion

**Status:** aaben  
**Foreslaaet version:** samme release som freeze

Formaal:

Sikre at der findes dokumentation og testmateriale til senere videreudvikling, saa fremtidige aendringer kan sammenlignes med den version, der faktisk blev brugt i workshoppen.

Acceptance criteria:

Gem foelgende lokalt eller i en dokumentationsmappe i repoet:

- aktiv initiativ-PDF
- samlet workshop-PDF
- samlet JSON/datafil
- screenshot af forsiden
- screenshot af sammenligningsmatrix
- screenshot af kommentarflow
- public link med cache-busting, fx `?v=workshop-release-0320`
- kort note om hvilken browser/laptop der er testet paa

### P1 - GitHub tag/release

**Status:** aaben  
**Foreslaaet tag:** `v0.3.20-workshop-release`

Formaal:

Sikre at workshopversionen kan findes igen praecist, selv om `main` senere bruges til videreudvikling.

Acceptance criteria:

- tag er oprettet i GitHub
- GitHub release note er skrevet
- public link er verificeret efter deploy
- release note naevner kendte begraensninger
- release note linker til eller omtaler `BACKLOG.md`

Foreslaaet release note:

```text
BUVI/OxF workshop release v0.3.20

Stabil workshopversion med:
- ProBalance-branding
- lokal browserlagring
- flere initiativer
- faelles scoreforklaringer
- initiativspecifik scoring
- kommentar-chips
- sammenligningsmatrix
- aktiv initiativ-PDF
- samlet workshop-PDF
- nulstilling af scoring og kommentarer
- ren PDF efter nulstilling

Kendte begraensninger:
- data gemmes kun lokalt i browseren
- ingen faelles facilitator-database
- ingen central opsamling paa tvaers af deltagere
- faktorbank aendres stadig i kode
```

## 6. Nye backlogkort fra kodekvalitetsgennemgang

Gennemgang udfoert: 2026-05-15  
Udgangspunkt: lokal klon af `hviddingvej19-maker/buvi-scoretool` paa `main`  
Seneste lokale commit ved gennemgang: `5891783 BUVI-workshop-release-v0.3.19`

Checks udfoert:

- `npm ci`: gennemfoert uden kendte sårbarheder
- `npm.cmd run build`: gennemfoert og production build virker
- `npm.cmd run lint`: fejler med 5 errors og 1 warning i `src/App.jsx`

### P0 - Gør lint grøn før workshop-release

**Status:** aaben  
**Type:** kvalitet/stabilisering  
**Rationale:** Production build virker, men lint fejler. Det betyder, at release-freeze ikke har et grønt baseline-check, og senere ændringer bliver sværere at kvalitetssikre.

Fund:

- ubrugt `React` import i `src/App.jsx`
- ubrugt `clearSavedWorkshopState`
- ubrugt `factor` prop i `CenterConfigEditor`
- React hooks-regel klager over synkron `setState` i effects omkring score-initialisering og localStorage-status
- manglende dependency-warning i effecten, der initialiserer scores

Acceptance criteria:

- `npm.cmd run lint` returnerer exit code 0
- ingen lint-disable tilfoejes uden kort begrundelse i kode
- score-initialisering bevarer eksisterende scores ved skift mellem initiativer
- lokal gemmestatus vises fortsat korrekt
- `npm.cmd run build` er stadig groent bagefter

Relevant kode:

- `src/App.jsx:1`
- `src/App.jsx:282`
- `src/App.jsx:1087`
- `src/App.jsx:1383`
- `src/App.jsx:1387`

### P0 - Synk versionlabel, backlog og interne prototype-tests

**Status:** aaben  
**Type:** releasekvalitet  
**Rationale:** Backloggen beskriver aktuel version som `v0.3.19-clean-blank-pdf`, mens GitHub-koden tidligere har brugt `APP_VERSION = "BUVI-workshop-release-v0.3.19"`. Canvas-versionen og den interne prototype-test bruger `clean-blank-pdf`. Det goer versionsstatus uklar, hvis det ikke er ryddet op foer release-freeze.

Acceptance criteria:

- UI-version, backlog og release-commit bruger samme versionsnavn
- intern prototype-test matcher det faktiske versionsnavn eller flyttes til formaliseret test
- versionsnavnet fremgaar tydeligt i appens eksport/PDF, hvis det skal bruges som workshop-dokumentation
- anbefalet endeligt release-navn er valgt og dokumenteret, fx `v0.3.20-workshop-release`

Relevant kode:

- `src/App.jsx:5`
- `src/App.jsx:913`

### P1 - Flyt prototype-tests til et rigtigt testframework

**Status:** aaben  
**Type:** test/fastholdelse af funktionalitet  
**Rationale:** Der findes interne `console.assert`-tests, men de koeres i browserens runtime og fejler ikke CI eller build paa en kontrolleret maade. Kritisk workshoplogik boer testes automatisk.

Foreslaaet loesning:

- tilfoej Vitest som unit-testframework
- flyt rene funktioner ud af `App.jsx`, saa de kan importeres i tests
- opret testscript i `package.json`
- koer tests i GitHub Actions foer deploy

Acceptance criteria:

- `npm.cmd test` findes og koerer i CI
- tests daekker faktorvalg og dimensionbalance
- tests daekker scoreinterval og bedste bud
- tests daekker reset af scores, kommentarer og noter
- tests daekker link-normalisering
- tests daekker eksportpayload for aktiv vurdering og samlet portefoelje
- tests daekker matrixflag for scorede/ikke-scorede initiativer

Relevant kode:

- `src/App.jsx:905`
- `src/App.jsx:921`
- `package.json:6`
- `.github/workflows/deploy.yml:31`

### P1 - Split `App.jsx` i data, domaenelogik og UI-komponenter

**Status:** aaben  
**Type:** vedligeholdelse  
**Rationale:** `src/App.jsx` er ca. 1.600 linjer og indeholder samtidig data, scorelogik, localStorage, eksport, printkomponenter og UI. Det oeger risikoen for regressionsfejl, fordi smaa aendringer i UI kan paavirke kerneberegninger.

Foreslaaet opdeling:

- `src/data/factors.js` til virksomheder, initiativtyper, faktorbank og anchor-konfiguration
- `src/domain/scoring.js` til scoreintervaller, vaegtede gennemsnit, status og matrixgeometri
- `src/domain/storage.js` til localStorage-load/save/reset og migrering
- `src/domain/export.js` til JSON- og tekstpayloads
- `src/components/*` til kort, matrix, scoring, print og eksport

Acceptance criteria:

- ingen funktionel aendring i workshopflowet
- `npm.cmd run build` er groent
- `npm.cmd run lint` er groent
- eksisterende localStorage-data fra `STORAGE_KEY` kan stadig indlaeses
- aktiv PDF og samlet workshop-PDF viser samme indhold som foer refaktoreringen

Relevant kode:

- `src/App.jsx:95`
- `src/App.jsx:214`
- `src/App.jsx:530`
- `src/App.jsx:819`
- `src/App.jsx:1183`
- `src/App.jsx:1336`

### P1 - Goer deployment reproducerbar med `npm ci` og predeploy-checks

**Status:** aaben  
**Type:** CI/CD  
**Rationale:** GitHub Pages-workflowet bruger `npm install`, selv om projektet har `package-lock.json`. Det kan give smaa forskelle mellem lokale builds og GitHub Pages. Deployment boer bruge lockfile deterministisk og stoppe foer deploy, hvis lint/test/build fejler.

Acceptance criteria:

- `.github/workflows/deploy.yml` bruger `npm ci`
- workflowet koerer lint
- workflowet koerer tests, naar testscript findes
- workflowet koerer build
- Pages deploy koerer kun efter groenne checks
- Node-version er dokumenteret i backlog eller `.nvmrc`/`.node-version`

Relevant kode:

- `.github/workflows/deploy.yml:28`
- `.github/workflows/deploy.yml:31`
- `.github/workflows/deploy.yml:34`

### P1 - Lav regressionsscenarier for workshopfunktionalitet

**Status:** aaben  
**Type:** test/fastholdelse af funktionalitet  
**Rationale:** De vigtigste risici handler ikke kun om beregninger, men om at workshoppen ikke mister data eller PDF-output under brug. Der boer vaere faste scenarier, der gentages foer release.

Acceptance criteria:

- opret nyt initiativ, score to faktorer og gem lokalt
- skift mellem to initiativer uden at score eller kommentarer forsvinder
- dupliker et initiativ og verificer at kopien kan aendres uafhaengigt
- nulstil aktiv scoring og verificer at kommentarer, noter og metodeadvarsler er vaek
- slet lokal data og verificer ren starttilstand
- lav aktiv PDF med kommentarer
- lav samlet workshop-PDF med matrix og kommentarer pr. initiativ
- eksporter aktiv JSON og samlet JSON
- kopier aktiv tekst og samlet tekst
- genindlaes siden og verificer at localStorage-data bevares

Foreslaaet automatisering:

- Playwright smoke-test for browserflow
- manuel workshop-checkliste i `BACKLOG.md` eller `docs/release-checklist.md`

Relevant kode:

- `src/App.jsx:258`
- `src/App.jsx:271`
- `src/App.jsx:293`
- `src/App.jsx:819`
- `src/App.jsx:1183`
- `src/App.jsx:1252`
- `src/App.jsx:1572`

### P1 - Versioner localStorage-schema og migrationsregler

**Status:** aaben  
**Type:** datakvalitet/fastholdelse af funktionalitet  
**Rationale:** Appen understoetter aeldre state-former via fallback, men der er ikke en tydelig schema-version eller migreringsstrategi. Det er vigtigt, fordi workshopdata ligger lokalt i browseren og ikke maa gaa tabt ved fremtidige aendringer.

Acceptance criteria:

- gemt state indeholder `schemaVersion`
- migrering fra tidligere `activeAssessment`-format er eksplicit testet
- manglende eller defekte felter normaliseres uden at slette brugerdata
- fejl ved korrupt localStorage giver ren fallback og synlig status
- release-noter beskriver, hvis en version aendrer lokal datamodel

Relevant kode:

- `src/App.jsx:247`
- `src/App.jsx:258`
- `src/App.jsx:271`

### P2 - Ryd op i ubrugte template-filer, CSS og assets

**Status:** aaben  
**Type:** oprydning  
**Rationale:** Repoet indeholder Vite/React-template-rester, som ikke ser ud til at vaere del af BUVI-vaerktoejet. Det goer projektet mere stoejende og kan forvirre fremtidig vedligeholdelse.

Mulige oprydninger:

- fjern eller verificer `src/App.css`, som ikke importeres i `main.jsx`
- fjern `src/assets/vite.svg`, hvis den ikke bruges
- fjern `src/assets/react.svg`, hvis den ikke bruges
- opdater `README.md` fra Vite-template til faktisk projektbeskrivelse

Acceptance criteria:

- ingen ubrugte template-assets ligger tilbage
- README forklarer lokal udvikling, build, deploy og workshop-release
- `npm.cmd run build` er groent efter oprydning

Relevant kode:

- `src/main.jsx:3`
- `src/App.css:1`
- `README.md:1`

### P2 - Tilfoej tilgaengeligheds- og responsivitetssmoke-test

**Status:** aaben  
**Type:** UX/test  
**Rationale:** Vaerktoejet bruges live i workshop og til PDF-output. Det boer testes paa de skaermstoerrelser og browsere, der bruges i praksis, saa layout, knapper og matrix ikke bryder.

Acceptance criteria:

- desktop smoke-test ved typisk facilitator-skaerm
- laptop smoke-test ved workshop-laptop
- mobil/tablet sanity check for laesbarhed
- tastaturfokus kan bruges paa primaere handlinger
- tekst i knapper og kort overlapper ikke
- printvisning skjuler normal app og viser korrekt PDF-rapport
- matrixlabels og punkter er laesbare i print

Foreslaaet automatisering:

- Playwright screenshots for desktop og mobil
- manuel PDF-sammenligning ved release-freeze

## 7. Releaseprincip for workshopversion

Foer workshop boer der laves en bevidst release-freeze, hvor der kun rettes P0-fejl.

Minimum foer push til public workshopversion:

- build er groent
- lint er enten groent eller kendte lint-fejl er eksplicit accepteret
- aktivt workshopflow er manuelt testet
- PDF-output er visuelt tjekket
- GitHub Pages viser forventet version
- facilitator har testet paa den faktiske workshopmaskine/browser
- referencefiler er gemt
- GitHub tag/release er oprettet

Efter freeze boer nye funktioner parkeres som backlogkort, medmindre de retter en konkret workshopblokering.
