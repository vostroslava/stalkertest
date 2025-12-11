# Формула успешной команды - Landing Page

Production-ready B2B HR landing page with interactive diagnostic test for team assessment. Built with React, TypeScript, and TailwindCSS.

## 🚀 Features

- **Interactive Diagnostic Test**: Mini-quiz (3-5 questions) + Full test (12-20 questions)
- **Lead Generation Forms**: Contact collection with validation
- **Scoring Algorithm**: 4-dimension team assessment (Результатность, Процессность, Статусность, Системность)
- **Google Sheets Integration**: Automatic data submission via webhook
- **Telegram Integration**: Direct links to channel with engaging CTAs
- **Responsive Design**: Mobile-first approach, works on all devices
- **Modern UI/UX**: Smooth animations, glassmorphism, premium aesthetics

## 📋 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4
- **Backend**: Google Apps Script (webhook endpoint)

## 🛠 Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vostroslava/formulatest.git
   cd formula
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values:
   ```env
   VITE_SUBMIT_ENDPOINT=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   VITE_TELEGRAM_CHANNEL=https://t.me/testtesttest12332221
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```
   
   The optimized files will be in the `dist/` directory.

## 🔗 Google Sheets Integration

To collect leads and test results, you need to set up a Google Apps Script webhook.

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Формула команды - Лиды"
3. Rename the first sheet to "Leads"
4. Add the following column headers in row 1:
   ```
   Timestamp | Type | Name | Role | Company | Team Size | Phone/Telegram | Concerns | UTM Source | UTM Medium | UTM Campaign | Answers | Scores | Dominant Dimension
   ```

### Step 2: Deploy Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code
3. Paste the following script:

```javascript
function doPost(e) {
  try {
    // Parse incoming JSON
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
    
    // Prepare row data
    const row = [
      data.timestamp || new Date().toISOString(),
      data.type || 'UNKNOWN',
      data.name || data.contact?.name || '',
      data.role || data.contact?.role || '',
      data.company || data.contact?.company || '',
      data.teamSize || data.contact?.teamSize || '',
      data.phoneOrTelegram || data.contact?.phoneOrTelegram || '',
      data.concerns || data.contact?.concerns || '',
      data.utmSource || '',
      data.utmMedium || '',
      data.utmCampaign || '',
      JSON.stringify(data.answers || []),
      JSON.stringify(data.scores || {}),
      data.dominantDimension || ''
    ];
    
    // Append to sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ message: 'Endpoint is working. Use POST to submit data.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (name it "Formula Webhook")
5. Click **Deploy > New deployment**
6. Select **Web app**
7. Settings:
   - **Execute as**: Me
   - **Who has access**: Anyone
8. Click **Deploy**
9. **Copy the Web app URL** (it will look like: `https://script.google.com/macros/s/ABC...XYZ/exec`)
10. Paste this URL into your `.env` file as `VITE_SUBMIT_ENDPOINT`

### step 3: Test the Integration

1. Run your dev server: `npm run dev`
2. Open the site and fill out the consultation form
3. Submit the form
4. Check your Google Sheet - you should see a new row with the data

## 📱 Telegram Integration

The landing page includes prominent links to the Telegram channel: **@testtesttest12332221**

Links appear in:
- Hero section (benefits)
- Results page (after completing test)
- Footer (with visual CTA)

## 📁 Project Structure

```
formula/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Accordion.tsx
│   │   ├── forms/           # Form components
│   │   │   ├── ContactForm.tsx
│   │   │   ├── MiniQuiz.tsx (TODO)
│   │   │   └── FullTest.tsx (TODO)
│   │   └── results/
│   │       └── TestResults.tsx (TODO)
│   ├── sections/            # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   ├── lib/                 # Business logic
│   │   ├── scoring.ts       # Test scoring algorithm
│   │   ├── api.ts           # Google Sheets integration
│   │   └── validation.ts    # Form validation
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎯 Scoring Logic

The diagnostic test measures 4 dimensions:

1. **Результатность (Result-orientation)**: Focus on outcomes, goals, winning
2. **Процессность (Process-orientation)**: Focus on procedures, quality, following rules
3. **Статусность (Status-orientation)**: Focus on hierarchy, prestige, recognition
4. **Системность (System-orientation)**: Focus on planning, structure, analytics

Each question contributes points to one or more dimensions. Final scores are normalized to 0-100 scale, and the dominant dimension determines the team profile and recommendations.

The scoring module (`src/lib/scoring.ts`) is designed to be reusable for future Telegram bot integration.

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables in Vercel dashboard

### Netlify

1. Build the project: `npm run build`
2. Drag & drop the `dist` folder to Netlify
3. Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

## 🔧 Customization

### Modify Questions

Edit `src/lib/scoring.ts`:
- `MINI_QUIZ_QUESTIONS` for the mini-quiz
- `FULL_TEST_QUESTIONS` for the full diagnostic test

### Change Colors

Edit `tailwind.config.js` to customize the color palette.

### Add Sections

Create new components in `src/sections/` and import them in `App.tsx`.

## 📈 Next Steps (TODO)

Current version is an MVP with core infrastructure. To complete:

1. **Implement MiniQuiz component** (`src/components/forms/MiniQuiz.tsx`)
2. **Implement FullTest component** (`src/components/forms/FullTest.tsx`)
3. **Implement TestResults component** (`src/components/results/TestResults.tsx`)
4. **Add TargetAudience section** with detailed persona cards
5. **Add CaseStudies section** with before/after examples
6. **Add WorkFormats section** with service offerings
7. **Integrate all components into App.tsx**

## 📄 License

ISC

## 👥 Author

Developed for "Формула успешной команды" B2B HR methodology.

---

**Questions or issues?** Contact via Telegram: [@testtesttest12332221](https://t.me/testtesttest12332221)
