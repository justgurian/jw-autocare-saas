# JW Auto Care AI - Full Feature Implementation Plan

## Overview

This document outlines the complete implementation plan to bring all features from the demo application into our production SaaS platform. We will maintain our current frontend structure while adding all the demo's capabilities.

---

## Current State Analysis

### What We Have (Production SaaS)
- ✅ Multi-tenant authentication (JWT + Google OAuth)
- ✅ Onboarding wizard (6 steps)
- ✅ Brand kit management
- ✅ Promo Flyer generator (basic)
- ✅ Push to Start button
- ✅ Instant Pack batch generation
- ✅ Meme Generator (10 styles)
- ✅ Marketing Calendar
- ✅ Analytics dashboard
- ✅ Social media integration
- ✅ Campaigns module
- ✅ 8 brand styles + 10 legacy themes
- ✅ Gemini AI integration (text + image)

### What We Need to Add (From Demo)
- ❌ Check-In To Win (4-step gamified flow)
- ❌ Car of the Day (4 asset types)
- ❌ Video Creator (Sora 2 integration)
- ❌ Review Reply AI
- ❌ Category-based theme filtering (10+ categories, 45+ themes)
- ❌ Image Editor (Repair Bay)
- ❌ Jargon Buster (estimate translator)
- ❌ SEO Blog Creator
- ❌ SMS Blast
- ❌ Personal Cards (Thank You, Birthday)
- ❌ Photo Tuner
- ❌ Prize wheel / gamification
- ❌ Car identification from photos
- ❌ Logo background removal (on upload)
- ❌ Voice input for forms
- ❌ QR code generation on flyers

---

## Implementation Phases

### Phase 1: Check-In To Win Feature

**Priority: HIGH**
**Estimated Files: ~15 new files**

This is a 4-step gamified customer engagement tool that generates "Action Figure" style memes.

#### Backend Implementation

**New Files:**
```
apps/api/src/modules/check-in/
├── check-in.routes.ts       # API endpoints
├── check-in.controller.ts   # Request handlers
├── check-in.service.ts      # Business logic
├── check-in.types.ts        # TypeScript interfaces
└── prizes.ts                # Prize configuration
```

**New API Endpoints:**
```
POST /api/v1/tools/check-in/submit      # Submit check-in data
POST /api/v1/tools/check-in/spin        # Spin prize wheel
POST /api/v1/tools/check-in/generate    # Generate action figure meme
GET  /api/v1/tools/check-in/prizes      # Get prize configuration
PUT  /api/v1/tools/check-in/prizes      # Update prize configuration (admin)
```

**Prize Configuration (from demo):**
```typescript
interface Prize {
  id: string;
  label: string;
  probability: number; // 0 to 1
}

// Default prizes
const DEFAULT_PRIZES: Prize[] = [
  { id: 'free-oil', label: 'FREE Oil Change', probability: 0.05 },
  { id: '20-off', label: '20% Off Service', probability: 0.15 },
  { id: '10-off', label: '10% Off Service', probability: 0.25 },
  { id: 'free-check', label: 'FREE Multi-Point Inspection', probability: 0.20 },
  { id: 'air-filter', label: 'FREE Air Filter', probability: 0.15 },
  { id: 'car-wash', label: 'FREE Car Wash', probability: 0.10 },
  { id: 'better-luck', label: 'Better Luck Next Time!', probability: 0.10 },
];
```

**Check-In Form Data (from demo):**
```typescript
interface CheckInFormData {
  name: string;
  phone: string;
  carYear: string;
  carMake: string;
  carModel: string;
  carColor: string;
  mileage: string;
  issue: string;
}
```

#### Frontend Implementation

**New Files:**
```
apps/web/src/pages/tools/check-in/
├── CheckInPage.tsx          # Main page with step navigation
├── Step1_Data.tsx           # Repair order form
├── Step2_Photo.tsx          # Camera/upload photo
├── Step3_Winner.tsx         # Prize wheel spinner
├── Step4_Meme.tsx           # Generate action figure
└── components/
    ├── PrizeWheel.tsx       # Animated prize wheel
    ├── RepairOrderForm.tsx  # Styled form component
    └── ActionFigureResult.tsx # Result display
```

**Key UI Components:**
1. **Repair Order Form** - Styled like vintage carbon copy receipt
2. **Photo Capture** - Camera integration with upload fallback
3. **Prize Wheel** - Animated spinner with configurable prizes
4. **Action Figure Generator** - Creates toy-box style images

**Image Generation Prompt (from demo):**
```
Create an "ACTION FIGURE COLLECTIBLE BOX" style promotional image.

PACKAGING STYLE:
- 1980s-1990s action figure toy packaging aesthetic
- Clear plastic bubble window showing the "figure"
- Bold colorful cardboard backing
- "LIMITED EDITION" badge
- "COLLECT THEM ALL!" text
- Barcode and toy company branding area

FIGURE CONTENTS:
- Transform the provided person photo into a stylized action figure pose
- Include miniature car accessory (their vehicle)
- Include prize ticket accessory showing their won prize

TEXT ELEMENTS:
- Customer name as figure name
- Prize won prominently displayed
- JW Auto Care branding
- Validation code
```

#### Database Schema Addition
```sql
-- Prize wheel spins (for tracking/analytics)
CREATE TABLE check_in_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  car_year INTEGER,
  car_make VARCHAR(100),
  car_model VARCHAR(100),
  car_color VARCHAR(50),
  mileage INTEGER,
  issue_description TEXT,
  prize_won VARCHAR(100),
  validation_code VARCHAR(20) UNIQUE,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  content_id UUID REFERENCES content(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant-specific prize configuration
CREATE TABLE prize_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  prizes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 2: Car of the Day Multi-Asset Generator

**Priority: HIGH**
**Estimated Files: ~8 new files**

Generates 4 unique assets from one car photo: Official, Comic, Action Figure, Movie Poster.

#### Backend Implementation

**New Files:**
```
apps/api/src/modules/car-of-day/
├── car-of-day.routes.ts
├── car-of-day.service.ts
└── car-of-day.types.ts
```

**New API Endpoints:**
```
POST /api/v1/tools/car-of-day/generate   # Generate all 4 assets
POST /api/v1/tools/car-of-day/single     # Generate single asset type
GET  /api/v1/tools/car-of-day/templates  # Get available templates
```

**Asset Types:**
1. **Official** - Clean professional "Car of the Day" graphic
2. **Comic** - Vintage comic book cover style
3. **Action Figure** - Toy collectible packaging
4. **Movie Poster** - Hollywood blockbuster poster style

#### Image Generation Prompts

**1. Official Car of the Day:**
```
Create a pristine "CAR OF THE DAY" social media graphic.
Background: High-end, clean, blurred auto shop service bay. Professional lighting.
Foreground: Place the provided car prominently in center.
Text: "CAR OF THE DAY" in bold gold letters at top.
Subtext: Car name/description.
Style: Clean, professional, dealership quality.
Include JW Auto Care logo in corner.
```

**2. Comic Book Cover:**
```
Vintage Comic Book Cover style.
Genre: Adventure/Action.
Style: Bold halftone dots, dramatic action lines, CMYK color separation aesthetic.
Title: Car name as the comic title in dynamic 3D font.
Elements: Action burst effects, dramatic poses, vintage comic border.
Text: "THE ADVENTURES OF [CAR NAME]" with "FEATURING JW AUTO CARE!"
```

**3. Action Figure (shared with Check-In):**
```
1980s-1990s action figure toy packaging.
Clear plastic bubble window.
Car as the main "collectible".
Owner as action figure if provided.
"LIMITED EDITION" badge.
```

**4. Movie Poster:**
```
HOLLYWOOD BLOCKBUSTER MOVIE POSTER.
Genre: High-Octane Action / Racing.
Style: Orange and Teal cinematic color grading. Lens flares. Debris.
Title: Car nickname as movie title in 3D metallic font.
The car is the hero vehicle in dramatic chase scene.
Tagline: "COMING SOON TO [LOCATION]"
Credits: "Directed by JW Auto Care"
```

#### Frontend Implementation

**New Files:**
```
apps/web/src/pages/tools/car-of-day/
├── CarOfDayPage.tsx
└── components/
    ├── CarUploader.tsx
    ├── AssetPreview.tsx
    └── AssetTypeSelector.tsx
```

---

### Phase 3: Video Creator with Sora 2 Integration

**Priority: HIGH**
**Estimated Files: ~10 new files**

UGC-style video generation using OpenAI's Sora 2 API.

#### Backend Implementation

**New Files:**
```
apps/api/src/modules/video-creator/
├── video-creator.routes.ts
├── video-creator.service.ts
├── video-creator.types.ts
└── sora.service.ts          # Sora 2 API integration
```

**New Service: Sora 2 Integration**
```typescript
// apps/api/src/services/sora.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.SORA_API_KEY,
});

export const soraService = {
  async generateVideo(options: {
    prompt: string;
    duration: '5s' | '10s' | '15s' | '20s';
    aspectRatio: '16:9' | '9:16' | '1:1';
    imageUrl?: string; // For image-to-video
  }): Promise<{ videoUrl: string; jobId: string }> {
    // Sora 2 API implementation
    // Note: Exact API structure depends on Sora 2 release
  },

  async getVideoStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
  }> {
    // Check job status
  },
};
```

**API Endpoints:**
```
POST /api/v1/tools/video-creator/generate   # Start video generation
GET  /api/v1/tools/video-creator/job/:id    # Check job status
GET  /api/v1/tools/video-creator/scenes     # Get scene templates
POST /api/v1/tools/video-creator/script     # Generate script with AI
```

**Scene Templates (from demo):**
```typescript
interface UGCScene {
  id: string;
  label: string;
  description: string;
  category: 'comedy' | 'pov' | 'asmr' | 'commercial';
  prompt: string;
}

const UGC_SCENES: UGCScene[] = [
  // COMEDY
  {
    id: 'tony-classic',
    label: "Tony's Classic Bits",
    description: 'Classic Tony the Mechanic comedy sketches',
    category: 'comedy',
    prompt: 'A friendly mechanic character named Tony doing comedic sketches about car problems...',
  },
  // POV
  {
    id: 'pov-car-talk',
    label: 'POV: Your Car Could Talk',
    description: 'First-person view as if you are the car',
    category: 'pov',
    prompt: 'Point-of-view shot from inside a car, as if the car itself is speaking to its owner...',
  },
  // ASMR
  {
    id: 'asmr-detail',
    label: 'ASMR Detailing',
    description: 'Satisfying car detailing sounds and visuals',
    category: 'asmr',
    prompt: 'Satisfying ASMR-style video of car detailing, polishing, cleaning sounds...',
  },
  // COMMERCIAL
  {
    id: 'commercial-hero',
    label: 'Hero Commercial',
    description: 'Cinematic commercial style',
    category: 'commercial',
    prompt: 'Cinematic commercial-quality video showcasing auto repair excellence...',
  },
];
```

#### Frontend Implementation

**New Files:**
```
apps/web/src/pages/tools/video-creator/
├── VideoCreatorPage.tsx
└── components/
    ├── SceneSelector.tsx
    ├── ScriptGenerator.tsx
    ├── VideoPreview.tsx
    └── RenderProgress.tsx
```

---

### Phase 4: Review Reply AI Tool

**Priority: MEDIUM**
**Estimated Files: ~6 new files**

Fetches reviews from URLs and generates AI-powered responses.

#### Backend Implementation

**New Files:**
```
apps/api/src/modules/review-reply/
├── review-reply.routes.ts
├── review-reply.service.ts
└── review-scraper.service.ts  # Web scraping for reviews
```

**API Endpoints:**
```
POST /api/v1/tools/review-reply/fetch      # Fetch reviews from URL
POST /api/v1/tools/review-reply/respond    # Generate AI response
POST /api/v1/tools/review-reply/analyze    # Analyze sentiment
GET  /api/v1/tools/review-reply/templates  # Get response templates
```

**Review Fetching Logic (from demo):**
```typescript
interface Review {
  author: string;
  text: string;
  rating: number;
  source?: string;
  date?: string;
}

// Uses Gemini to extract reviews from page content
async function fetchReviews(url: string): Promise<{
  reviews: Review[];
  sources: string[];
}> {
  // 1. Fetch page content
  // 2. Use Gemini to extract structured review data
  // 3. Filter to 5-star reviews
  // 4. Return with source URLs
}
```

**Response Generation:**
```typescript
async function generateReplyResponse(review: Review, options: {
  tone: 'professional' | 'friendly' | 'grateful';
  includeOffer?: boolean;
  businessName: string;
}): Promise<string> {
  // AI-powered response generation
}
```

#### Frontend Implementation

**New Files:**
```
apps/web/src/pages/tools/review-reply/
├── ReviewReplyPage.tsx
└── components/
    ├── ReviewFetcher.tsx
    ├── ReviewCard.tsx
    ├── ResponseGenerator.tsx
    └── ResponseEditor.tsx
```

---

### Phase 5: Category-Based Theme System Enhancement

**Priority: MEDIUM**
**Estimated Files: ~5 modified files**

Expand theme system from 18 to 45+ themes with category filtering.

#### Theme Categories (from demo)

```typescript
type ThemeCategory =
  | 'All'
  | 'Typography'        // Text-only designs, no car
  | 'Arizona Local'     // Regional desert themes
  | 'Master Mechanic'   // Professional/expert themes
  | 'Commercial Art'    // Classic advertising styles
  | 'Pop Culture'       // 80s, movies, games
  | 'The Era Collection'// Historical periods
  | 'Cinematic Settings'// Movie-inspired
  | 'Artistic Vision'   // Fine art styles
  | 'Fun & Games'       // Playful, casual
  | 'The Newsstand'     // Magazine/newspaper styles
  | 'Social Proof';     // Review/testimonial focused
```

#### New Theme Definitions to Add

**Typography Category (Text-Only):**
- `bold-statement` - Minimalist bold text focus
- `retro-type` - Vintage typography
- `modern-sans` - Clean modern fonts
- `script-elegant` - Elegant script fonts
- `stencil-industrial` - Industrial stencil style

**Arizona Local:**
- `phoenix-heat` - Summer heat focused
- `scottsdale-luxury` - Upscale local
- `route-66-classic` - Highway nostalgia
- `sonoran-sunset` - Desert sunset vibes

**Master Mechanic:**
- `certified-pro` - ASE certified look
- `old-school-wrench` - Traditional mechanic
- `diagnostic-tech` - Modern diagnostic focus
- `fleet-service` - Commercial/fleet focused

**Pop Culture:**
- `arcade-80s` - Retro gaming
- `vhs-era` - VHS tape aesthetic
- `superhero-comic` - Comic book hero
- `movie-poster` - Cinematic poster

**Cinematic Settings:**
- `noir-detective` - Film noir style
- `action-blockbuster` - Michael Bay style
- `vintage-hollywood` - Golden age cinema
- `indie-film` - Artistic indie look

**And more... (full list to be implemented)**

#### Implementation

```typescript
// Extended theme definition with category
interface ExtendedTemplate {
  id: string;
  name: string;
  description: string;
  era: string;
  category: ThemeCategory;
  prompt: string;
  thumbnail?: string;
  suppressCar?: boolean; // For Typography category
}
```

---

### Phase 6: Image Editor (Repair Bay)

**Priority: MEDIUM**
**Estimated Files: ~5 new files**

Modal-based image editing using Gemini for AI-powered fixes.

#### Backend Implementation

**New API Endpoints:**
```
POST /api/v1/tools/image-editor/fix-text    # Fix text in image
POST /api/v1/tools/image-editor/adjust      # General adjustments
POST /api/v1/tools/image-editor/regenerate  # Regenerate with edits
POST /api/v1/tools/image-editor/upscale     # Upscale image
```

**Edit Operations:**
- Fix misspelled text
- Adjust colors/contrast
- Remove unwanted elements
- Regenerate portions
- Upscale for print

#### Frontend Implementation

**New Files:**
```
apps/web/src/components/features/
├── ImageEditorModal.tsx
└── ImageEditor/
    ├── EditToolbar.tsx
    ├── SelectionOverlay.tsx
    ├── HistoryPanel.tsx
    └── ExportOptions.tsx
```

---

### Phase 7: Additional Tools

#### 7.1 Jargon Buster (Estimate Translator)

**Purpose:** Translate technical mechanic jargon into plain English explanations.

**API Endpoints:**
```
POST /api/v1/tools/jargon-buster/translate  # Translate text
POST /api/v1/tools/jargon-buster/analyze-image  # Analyze estimate photo
```

**Input Options:**
- Paste mechanic notes/estimate text
- Upload photo of estimate
- Voice input (transcribed)

**Output:**
- Plain English explanation
- Suggested questions for customer
- Trust-building talking points

#### 7.2 SEO Blog Creator

**Purpose:** Generate SEO-optimized blog posts and email newsletters.

**API Endpoints:**
```
POST /api/v1/tools/blog-creator/generate    # Generate blog/email
POST /api/v1/tools/blog-creator/refine      # Refine content
GET  /api/v1/tools/blog-creator/topics      # Get topic suggestions
```

**Content Types:**
- SEO blog article (800-1200 words)
- Email newsletter
- Social media series

**Refinement Options (from demo):**
- Make shorter
- More professional
- More friendly
- Fix grammar

#### 7.3 SMS Blast

**Purpose:** Generate SMS campaign messages.

**API Endpoints:**
```
POST /api/v1/tools/sms-blast/generate       # Generate variations
POST /api/v1/tools/sms-blast/schedule       # Schedule via Twilio
```

**Features:**
- Generate 5 variations per topic
- Character count optimization
- Link shortening
- Scheduling integration

#### 7.4 Personal Cards

**Purpose:** Generate personalized thank-you and birthday cards.

**API Endpoints:**
```
POST /api/v1/tools/personal-cards/generate  # Generate card
GET  /api/v1/tools/personal-cards/templates # Get templates
```

**Card Types:**
- Thank You cards (post-service)
- Birthday cards (customer birthdays)
- Anniversary cards (customer anniversary)
- Holiday cards (seasonal)

#### 7.5 Photo Tuner

**Purpose:** Enhance photos to professional quality.

**API Endpoints:**
```
POST /api/v1/tools/photo-tuner/enhance      # Enhance photo
```

**Enhancement Modes:**
- `authentic` - Pro iPhone look (natural enhancement)
- `magazine` - Editorial/magazine quality

---

## Shared Components to Create

### 1. Car Make/Model/Year Constants
```typescript
// apps/api/src/constants/vehicles.ts
export const CAR_MAKES = ['Acura', 'Audi', 'BMW', 'Buick', ...];
export const CAR_MODELS: Record<string, string[]> = { ... };
export const CAR_YEARS = [2025, 2024, 2023, ...];
export const CAR_COLORS = ['Black', 'White', 'Silver', ...];
```

### 2. Specials/Promotions Constants
```typescript
// apps/api/src/constants/specials.ts
export const RECURRING_SPECIALS = [...]; // Weekly/monthly specials
export const SERVICE_SPECIALS = [...];   // Service-specific promos
```

### 3. Dropzone Component Enhancement
```typescript
// apps/web/src/components/ui/Dropzone.tsx
// Add camera integration
// Add drag-and-drop styling
// Add multi-file support
```

### 4. Prize Wheel Component
```typescript
// apps/web/src/components/features/PrizeWheel.tsx
// Animated spinning wheel
// Configurable prizes
// Win announcement animation
```

### 5. Background Removal Service
```typescript
// apps/api/src/services/background-removal.service.ts
// Using Gemini for logo background removal
async function removeBackground(imageData: Buffer): Promise<Buffer>;
```

---

## Database Migrations Required

```sql
-- Migration: Add check-in tables
CREATE TABLE check_in_submissions (...);
CREATE TABLE prize_configurations (...);

-- Migration: Add video jobs table
CREATE TABLE video_jobs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  status VARCHAR(20),
  sora_job_id VARCHAR(255),
  input_prompt TEXT,
  scene_id VARCHAR(100),
  video_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Migration: Add reviews table for caching
CREATE TABLE fetched_reviews (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  source_url VARCHAR(500),
  author VARCHAR(255),
  text TEXT,
  rating INTEGER,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables Required

```env
# Existing
GEMINI_API_KEY=...

# New
SORA_API_KEY=...            # OpenAI Sora 2 API key
TWILIO_ACCOUNT_SID=...      # For SMS Blast
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

---

## Testing Strategy

### Unit Tests
- Test each service function
- Test prompt builders
- Test utility functions

### Integration Tests
- Test API endpoints
- Test database operations
- Test external API integrations (mock)

### E2E Tests
1. Check-In To Win flow (submit → spin → generate)
2. Car of Day generation (all 4 assets)
3. Video generation (submit → poll → complete)
4. Review fetch and respond
5. Theme category filtering

---

## Rollout Order

1. **Week 1:** Check-In To Win (highest engagement feature)
2. **Week 2:** Car of the Day
3. **Week 3:** Category-based themes + Image Editor
4. **Week 4:** Video Creator (Sora 2)
5. **Week 5:** Review Reply AI
6. **Week 6:** Additional tools (Jargon, Blog, SMS, Cards, Photo Tuner)

---

## Questions Before Implementation

1. **Prize Configuration:** Should prizes be configurable per-tenant in the admin panel, or use defaults?

2. **Video Storage:** Where should generated videos be stored? GCS with CDN?

3. **Review Scraping:** Any specific review platforms to prioritize (Google, Yelp, Facebook)?

4. **Sora 2 API:** Once you have the API key, I'll need the exact API documentation to implement correctly.

5. **Theme Expansion:** Should all 45+ themes be implemented at once, or start with ~20 and expand?

6. **Voice Input:** Browser-native Speech Recognition API, or a third-party service?

---

## Ready to Proceed

Once you approve this plan and answer the questions above, I will begin implementation starting with Phase 1: Check-In To Win.

Each phase will be implemented with:
1. Backend routes and services
2. Frontend pages and components
3. Database migrations
4. Tests
5. Integration verification

I will check my work at each step before moving to the next feature.
