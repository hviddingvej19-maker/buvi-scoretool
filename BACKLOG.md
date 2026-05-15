# BUVI/OxF scoringsværktøj - backlog og udviklingslog

Senest opdateret: 2026-05-15  
Aktuel workshopversion: `v0.3.19-clean-blank-pdf`  
Repository: `hviddingvej19-maker/buvi-scoretool`  
Public app: `https://hviddingvej19-maker.github.io/buvi-scoretool/`

Dette dokument er projektets fælles backlog, udviklingslog og handover-note. Det er lavet, så både ChatGPT-tråden, Codex og fremtidige udviklingssessioner kan se:

- hvad der allerede er gennemført
- hvorfor ændringerne blev lavet
- hvad der stadig er åbent
- hvad der bevidst er parkeret til efter workshoppen
- hvordan workshopversionen bør fryses og videreudvikles senere

## 1. Projektformål

BUVI/OxF scoringsværktøjet er et React/Vite-baseret workshopværktøj til vurdering og prioritering af bæredygtighedsinitiativer.

Værktøjet bruges i en workshop, hvor virksomheder eller organisationer vurderer egne initiativer ud fra to hoveddimensioner:

1. **Værdi**
2. **Gennemførlighed**

Scoren skal ikke forstås som en automatisk beslutningsmaskine. Den skal fungere som beslutningsstøtte og dialogværktøj. Det vigtigste workshopoutput er derfor både:

- score
- scoreinterval/usikkerhed
- datagrundlag/sikkerhed
- kommentarer
- antagelser
- uenigheder
- databehov
- næste afklaring
- sammenligning af flere initiativer

## 2. Aktuel workshopstatus

Aktuel version: `v0.3.19-clean-blank-pdf`

Denne version betragtes som en workshopkandidat, ikke som en endelig produktversion.

### Klar til workshopbrug

- ProBalance-branding
- lokal browserlagring
- flere initiativer
- fælles scoreforklaring pr. faktor
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
- sikkerhedsadvarsel før sletning og nulstilling

### Kendte begrænsninger i workshopversionen

- Data gemmes kun lokalt i brugerens browser.
- Der findes ingen central facilitator-database.
- Der findes ingen fælles opsamling på tværs af deltagere.
- Faktorbank og standarddata ændres stadig i kode.
- QR/redirect er ikke endeligt løst.
- PDF-layout er funktionelt, men ikke designmæssigt færdigpoleret.
- Der er ikke et egentligt admin-interface.
- Der er ikke tests i et formaliseret testframework endnu.
- Lint er ikke grønt pr. 2026-05-15, selv om production build virker.

### Release-note om versioner

Der skal kun være én aktiv versionstreng i releasekandidaten. Backlog, UI, PDF/eksport og interne prototype-tests skal bruge samme versionsnavn inden release-freeze.

Aktuel beslutning for workshopkandidaten:

```text
v0.3.19-clean-blank-pdf
```

Foreslået endeligt release-tag efter sidste stabilitetstest:

```text
v0.3.20-workshop-release
```

## 3. Centrale designbeslutninger

### 3.1 Lokal lagring

Værktøjet gemmer scoringer i browserens `localStorage`.

Begrundelse:

- lav kompleksitet
- ingen login
- ingen GDPR-opsamling
- nem pilot/workshopbrug

Konsekvens:

- data deles ikke automatisk med facilitator
- bruger skal selv eksportere PDF/tekst/JSON
- data er lokal pr. browser og computer

### 3.2 Fælles scoreforklaring vs. initiativscoring

Der er bevidst skelnet mellem:

- **Fælles scoreforklaring for faktorer**: hvad score 0, 3, 6, 9 og 12 betyder for en faktor
- **Score det aktive initiativ**: den konkrete vurdering af et bestemt initiativ

Denne opdeling er vigtig, fordi flere initiativer kan bruge samme faktorlogik, mens scoring og kommentarer skal være forskellige pr. initiativ.

### 3.3 Kommentarer er workshopoutput

Kommentarer er ikke kun hjælpetekst. De er en central del af beslutningsgrundlaget.

Derfor skal kommentarer:

- vises under hver faktor
- gemmes pr. initiativ
- indgå i aktiv PDF
- indgå i samlet workshop-PDF
- kunne bruges til at forklare antagelser, uenighed og databehov

### 3.4 Matrix som prioriteringsstøtte

Matrixen viser initiativer ud fra Værdi og Gennemførlighed.

Vigtigt princip:

> Øverst til højre er mest attraktivt, men matrixen er prioriteringsstøtte - ikke en endelig beslutning.

## 4. Gennemførte kort

### v0.3.1 - Sammenligning af flere initiativer i samme matrix

**Status:** gennemført  
**Prioritet:** P0  
**Workshopværdi:** høj

Deltagerne kan sammenligne flere initiativer visuelt i samme matrix.

Gennemført:

- flere lokale initiativer i samme browser
- aktivt initiativ kan vælges
- initiativer vises i matrix, når de har både værdi- og gennemførlighedsscore
- aktivt initiativ markeres tydeligere
- initiativliste under matrix

### v0.3.2 - Eksportér samlet initiativliste

**Status:** gennemført  
**Prioritet:** P1

Gennemført:

- samlet JSON/datafil
- kopieret samlet initiativliste
- samlet workshop-PDF
- matrix med flere initiativer
- initiativliste med score, status og datagrundlag

### v0.3.4 - Genindfør print-/PDF-knap og ryd op i eksporthandlinger

**Status:** gennemført  
**Prioritet:** P0/P1

Gennemført:

- aktiv PDF-knap genindført
- samlet workshop-PDF tilføjet
- eksport samlet under "Deling og eksport"
- aktiv vurdering og samlet portefølje adskilt

### v0.3.5 - Portefølje-PDF med sammenligning

**Status:** gennemført  
**Prioritet:** P0/P1

Gennemført:

- portefølje-PDF
- samlet matrix
- initiativliste
- kommentarer pr. initiativ
- aktivt initiativ markeret

### v0.3.6 - Kommentarer med i portefølje-PDF

**Status:** gennemført  
**Prioritet:** P0

Gennemført:

- faktorkommentarer inkluderes i samlet workshop-PDF
- kommentarer vises pr. initiativ
- antagelser og databehov bevares i porteføljeoutput

### v0.3.7 - Comment nudges

**Status:** gennemført  
**Prioritet:** P1

Gennemført:

- kommentarstatus i resultatkort
- nudge når scorede faktorer mangler kommentar
- tekst der forklarer hvorfor kommentarer er vigtige

### v0.3.8 - Onboarding clarity

**Status:** gennemført  
**Prioritet:** P0

Gennemført:

- ny "Start her"-boks
- trins-flow
- mere workshop-nær hovedtitel
- tydeligere forklaring af score, kommentarer og beslutningsstøtte
- bedre skelnen mellem scoreforklaring og scoring

### v0.3.9 - Start her-links

**Status:** gennemført  
**Prioritet:** P1

Gennemført:

- klikbare trin
- navigation til relevante sektioner
- knapper under Start her fjernet

### v0.3.10 - Section navigation

**Status:** gennemført  
**Prioritet:** P1

Gennemført:

- `Card` understøtter `id` og props
- sektioner fik stabile id'er
- "Tilbage til Start her"-knapper tilføjet
- tilbageknapper skjules i print

### v0.3.11 - Fjern navigation artifacts

**Status:** gennemført  
**Prioritet:** P0 bugfix

Gennemført:

- `$1`-artefakter fjernet

### v0.3.12 - Kommentar-eksempler og kommentar-chips

**Status:** gennemført  
**Prioritet:** P1

Gennemført kommentar-chips:

- Antagelse
- Uenighed
- Databehov
- Næste afklaring

### v0.3.13 - Fix comment template build

**Status:** gennemført  
**Prioritet:** P0 bugfix

Gennemført:

- build-fejl pga. linjeskift i JavaScript-string rettet
- intern test for append af kommentar-template

### v0.3.14 - Reviewed bugfix

**Status:** gennemført  
**Prioritet:** P0 bugfix/stabilisering

Gennemført:

- samlet kode omskrevet og stabiliseret
- versionsstyring samlet i `APP_VERSION`
- printkomponenter samlet
- interne prototype-tests udbygget
- mere robust datamodel for reset, scoring og export

### v0.3.15 - Workshop safety polish

**Status:** gennemført  
**Prioritet:** P0/P1

Gennemført:

- bekræftelse før slet initiativ
- bekræftelse før slet lokal data
- bedre forklaring af duplikér
- tydeligere matrixforklaring
- PDF-note om matrix som prioriteringsstøtte

### v0.3.16 - Reset and switch fix

**Status:** gennemført  
**Prioritet:** P0 bugfix

Gennemført:

- `resetCounter` fjernet
- nulstilling sker direkte på aktivt initiativ
- skift mellem initiativer sletter ikke score
- nulstilling kræver bekræftelse

### v0.3.17 - Matrix and reset cleanup

**Status:** gennemført  
**Prioritet:** P0 bugfix

Gennemført:

- matrix bruger oprindeligt initiativnummer
- aktivt interval vises kun for aktivt scoret initiativ
- nulstilling lukker PDF-visninger
- nulstilling rydder scores, kommentarer og noter for aktivt initiativ
- slet lokal data rydder BUVI-localStorage-nøgler

### v0.3.18 - Hard reset comments

**Status:** gennemført  
**Prioritet:** P0 bugfix

Gennemført:

- reset fjerner hele `scores`-objektet for aktivt initiativ
- reset fjerner gamle `assumption`-kommentarer
- reset gemmer direkte i localStorage
- slet lokal data opretter ren state
- intern test for at gammel kommentar ikke bliver hængende

### v0.3.19 - Clean blank PDF

**Status:** gennemført  
**Prioritet:** P0 bugfix/workshop polish

Gennemført:

- kritiske ikke-scorede faktorer vises ikke på tom/nulstillet vurdering
- sektionen vises kun, når vurderingen er påbegyndt
- titel ændret til "Automatiske metodeadvarsler"
- forklaring tilføjet, så sektionen ikke forveksles med brugerkommentarer

## 5. Åben backlog før workshop

### P0 - Release freeze og stabilitetstest

**Status:** åben  
**Foreslået version:** `v0.3.20-workshop-release-freeze`

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
- kopiér tekst virker
- gem datafil virker
- test udført i workshop-browser/laptop
- versionstreng er synkroniseret mellem `src/App.jsx`, `BACKLOG.md`, UI, PDF/eksport og interne prototype-tests

Anbefalet commitnavn:

```text
Freeze BUVI workshop release v0.3.20
```

### P1 - Gem referencefiler for workshopversion

**Status:** åben  
**Foreslået version:** samme release som freeze

Formål:

Sikre at der findes dokumentation og testmateriale til senere videreudvikling, så fremtidige ændringer kan sammenlignes med den version, der faktisk blev brugt i workshoppen.

Acceptance criteria:

Gem følgende lokalt eller i en dokumentationsmappe i repoet:

- aktiv initiativ-PDF
- samlet workshop-PDF
- samlet JSON/datafil
- screenshot af forsiden
- screenshot af sammenligningsmatrix
- screenshot af kommentarflow
- public link med cache-busting, fx `?v=workshop-release-0320`
- kort note om hvilken browser/laptop der er testet på

### P1 - GitHub tag/release

**Status:** åben  
**Foreslået tag:** `v0.3.20-workshop-release`

Formål:

Sikre at workshopversionen kan findes igen præcist, selv om `main` senere bruges til videreudvikling.

Acceptance criteria:

- tag er oprettet i GitHub
- GitHub release note er skrevet
- public link er verificeret efter deploy
- release note nævner kendte begrænsninger
- release note linker til eller omtaler `BACKLOG.md`

Foreslået release note:

```text
BUVI/OxF workshop release v0.3.20

Stabil workshopversion med:
- ProBalance-branding
- lokal browserlagring
- flere initiativer
- fælles scoreforklaringer
- initiativspecifik scoring
- kommentar-chips
- sammenligningsmatrix
- aktiv initiativ-PDF
- samlet workshop-PDF
- nulstilling af scoring og kommentarer
- ren PDF efter nulstilling

Kendte begrænsninger:
- data gemmes kun lokalt i browseren
- ingen fælles facilitator-database
- ingen central opsamling på tværs af deltagere
- faktorbank ændres stadig i kode
```

## 6. Nye backlogkort fra kodekvalitetsgennemgang

Gennemgang udført: 2026-05-15  
Udgangspunkt: lokal klon af `hviddingvej19-maker/buvi-scoretool` på `main`  
Seneste lokale commit ved gennemgang: `5891783 BUVI-workshop-release-v0.3.19`

Checks udført:

- `npm ci`: gennemført uden kendte sårbarheder
- `npm.cmd run build`: gennemført og production build virker
- `npm.cmd run lint`: fejler med 5 errors og 1 warning i `src/App.jsx`

### P0 - Gør lint grøn før workshop-release

**Status:** åben  
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
- ingen lint-disable tilføjes uden kort begrundelse i kode
- score-initialisering bevarer eksisterende scores ved skift mellem initiativer
- lokal gemmestatus vises fortsat korrekt
- `npm.cmd run build` er stadig grønt bagefter

Relevant kode:

- `src/App.jsx:1`
- `src/App.jsx:282`
- `src/App.jsx:1087`
- `src/App.jsx:1383`
- `src/App.jsx:1387`

### P0 - Synk versionlabel, backlog og interne prototype-tests

**Status:** åben  
**Type:** releasekvalitet  
**Rationale:** Backloggen beskriver aktuel version som `v0.3.19-clean-blank-pdf`, mens GitHub-koden tidligere har brugt `APP_VERSION = "BUVI-workshop-release-v0.3.19"`. Canvas-versionen og den interne prototype-test bruger `clean-blank-pdf`. Det gør versionsstatus uklar, hvis det ikke er ryddet op før release-freeze.

Acceptance criteria:

- UI-version, backlog og release-commit bruger samme versionsnavn
- intern prototype-test matcher det faktiske versionsnavn eller flyttes til formaliseret test
- versionsnavnet fremgår tydeligt i appens eksport/PDF, hvis det skal bruges som workshop-dokumentation
- anbefalet endeligt release-navn er valgt og dokumenteret, fx `v0.3.20-workshop-release`

Relevant kode:

- `src/App.jsx:5`
- `src/App.jsx:913`

### P1 - Flyt prototype-tests til et rigtigt testframework

**Status:** åben  
**Type:** test/fastholdelse af funktionalitet  
**Rationale:** Der findes interne `console.assert`-tests, men de køres i browserens runtime og fejler ikke CI eller build på en kontrolleret måde. Kritisk workshoplogik bør testes automatisk.

Foreslået løsning:

- tilføj Vitest som unit-testframework
- flyt rene funktioner ud af `App.jsx`, så de kan importeres i tests
- opret testscript i `package.json`
- kør tests i GitHub Actions før deploy

Acceptance criteria:

- `npm.cmd test` findes og kører i CI
- tests dækker faktorvalg og dimensionbalance
- tests dækker scoreinterval og bedste bud
- tests dækker reset af scores, kommentarer og noter
- tests dækker link-normalisering
- tests dækker eksportpayload for aktiv vurdering og samlet portefølje
- tests dækker matrixflag for scorede/ikke-scorede initiativer

Relevant kode:

- `src/App.jsx:905`
- `src/App.jsx:921`
- `package.json:6`
- `.github/workflows/deploy.yml:31`

### P1 - Split `App.jsx` i data, domænelogik og UI-komponenter

**Status:** åben  
**Type:** vedligeholdelse  
**Rationale:** `src/App.jsx` er ca. 1.600 linjer og indeholder samtidig data, scorelogik, localStorage, eksport, printkomponenter og UI. Det øger risikoen for regressionsfejl, fordi små ændringer i UI kan påvirke kerneberegninger.

Foreslået opdeling:

- `src/data/factors.js` til virksomheder, initiativtyper, faktorbank og anchor-konfiguration
- `src/domain/scoring.js` til scoreintervaller, vægtede gennemsnit, status og matrixgeometri
- `src/domain/storage.js` til localStorage-load/save/reset og migrering
- `src/domain/export.js` til JSON- og tekstpayloads
- `src/components/*` til kort, matrix, scoring, print og eksport

Acceptance criteria:

- ingen funktionel ændring i workshopflowet
- `npm.cmd run build` er grønt
- `npm.cmd run lint` er grønt
- eksisterende localStorage-data fra `STORAGE_KEY` kan stadig indlæses
- aktiv PDF og samlet workshop-PDF viser samme indhold som før refaktoreringen

Relevant kode:

- `src/App.jsx:95`
- `src/App.jsx:214`
- `src/App.jsx:530`
- `src/App.jsx:819`
- `src/App.jsx:1183`
- `src/App.jsx:1336`

### P1 - Gør deployment reproducerbar med `npm ci` og predeploy-checks

**Status:** åben  
**Type:** CI/CD  
**Rationale:** GitHub Pages-workflowet bruger `npm install`, selv om projektet har `package-lock.json`. Det kan give små forskelle mellem lokale builds og GitHub Pages. Deployment bør bruge lockfile deterministisk og stoppe før deploy, hvis lint/test/build fejler.

Acceptance criteria:

- `.github/workflows/deploy.yml` bruger `npm ci`
- workflowet kører lint
- workflowet kører tests, når testscript findes
- workflowet kører build
- Pages deploy kører kun efter grønne checks
- Node-version er dokumenteret i backlog eller `.nvmrc`/`.node-version`

Relevant kode:

- `.github/workflows/deploy.yml:28`
- `.github/workflows/deploy.yml:31`
- `.github/workflows/deploy.yml:34`

### P1 - Lav regressionsscenarier for workshopfunktionalitet

**Status:** åben  
**Type:** test/fastholdelse af funktionalitet  
**Rationale:** De vigtigste risici handler ikke kun om beregninger, men om at workshoppen ikke mister data eller PDF-output under brug. Der bør være faste scenarier, der gentages før release.

Acceptance criteria:

- opret nyt initiativ, score to faktorer og gem lokalt
- skift mellem to initiativer uden at score eller kommentarer forsvinder
- duplikér et initiativ og verificer at kopien kan ændres uafhængigt
- nulstil aktiv scoring og verificér at kommentarer, noter og metodeadvarsler er væk
- slet lokal data og verificér ren starttilstand
- lav aktiv PDF med kommentarer
- lav samlet workshop-PDF med matrix og kommentarer pr. initiativ
- eksportér aktiv JSON og samlet JSON
- kopiér aktiv tekst og samlet tekst
- genindlæs siden og verificér at localStorage-data bevares

Foreslået automatisering:

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

### P1 - Versionér localStorage-schema og migrationsregler

**Status:** åben  
**Type:** datakvalitet/fastholdelse af funktionalitet  
**Rationale:** Appen understøtter ældre state-former via fallback, men der er ikke en tydelig schema-version eller migreringsstrategi. Det er vigtigt, fordi workshopdata ligger lokalt i browseren og ikke må gå tabt ved fremtidige ændringer.

Acceptance criteria:

- gemt state indeholder `schemaVersion`
- migrering fra tidligere `activeAssessment`-format er eksplicit testet
- manglende eller defekte felter normaliseres uden at slette brugerdata
- fejl ved korrupt localStorage giver ren fallback og synlig status
- release-noter beskriver, hvis en version ændrer lokal datamodel

Relevant kode:

- `src/App.jsx:247`
- `src/App.jsx:258`
- `src/App.jsx:271`

### P2 - Ryd op i ubrugte template-filer, CSS og assets

**Status:** åben  
**Type:** oprydning  
**Rationale:** Repoet indeholder Vite/React-template-rester, som ikke ser ud til at være del af BUVI-værktøjet. Det gør projektet mere støjende og kan forvirre fremtidig vedligeholdelse.

Mulige oprydninger:

- fjern eller verificér `src/App.css`, som ikke importeres i `main.jsx`
- fjern `src/assets/vite.svg`, hvis den ikke bruges
- fjern `src/assets/react.svg`, hvis den ikke bruges
- opdatér `README.md` fra Vite-template til faktisk projektbeskrivelse

Acceptance criteria:

- ingen ubrugte template-assets ligger tilbage
- README forklarer lokal udvikling, build, deploy og workshop-release
- `npm.cmd run build` er grønt efter oprydning

Relevant kode:

- `src/main.jsx:3`
- `src/App.css:1`
- `README.md:1`

### P2 - Tilføj tilgængeligheds- og responsivitetssmoke-test

**Status:** åben  
**Type:** UX/test  
**Rationale:** Værktøjet bruges live i workshop og til PDF-output. Det bør testes på de skærmstørrelser og browsere, der bruges i praksis, så layout, knapper og matrix ikke bryder.

Acceptance criteria:

- desktop smoke-test ved typisk facilitator-skærm
- laptop smoke-test ved workshop-laptop
- mobil/tablet sanity check for læsbarhed
- tastaturfokus kan bruges på primære handlinger
- tekst i knapper og kort overlapper ikke
- printvisning skjuler normal app og viser korrekt PDF-rapport
- matrixlabels og punkter er læsbare i print

Foreslået automatisering:

- Playwright screenshots for desktop og mobil
- manuel PDF-sammenligning ved release-freeze

## 7. Releaseprincip for workshopversion

Før workshop bør der laves en bevidst release-freeze, hvor der kun rettes P0-fejl.

Minimum før push til public workshopversion:

- build er grønt
- lint er enten grønt eller kendte lint-fejl er eksplicit accepteret
- aktivt workshopflow er manuelt testet
- PDF-output er visuelt tjekket
- GitHub Pages viser forventet version
- facilitator har testet på den faktiske workshopmaskine/browser
- referencefiler er gemt
- GitHub tag/release er oprettet

Efter freeze bør nye funktioner parkeres som backlogkort, medmindre de retter en konkret workshopblokering.
