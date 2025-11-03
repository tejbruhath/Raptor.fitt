# 🧪 Complete Testing Guide - Raptor.Fitt

## ✅ **Build Status: SUCCESS**

Exit Code: 0 | Build Time: 12.9s | Total Routes: 46

---

## 🎯 **What to Test**

### Phase 1 Features (Already Completed)
1. ✅ Profile Image Upload
2. ✅ Body Measurements
3. ✅ Rest Timer
4. ✅ Plate Calculator
5. ✅ Workout Notes
6. ✅ Exercise Search
7. ✅ Analytics Tabs (5 sections)
8. ✅ Achievement Badges (18 total)
9. ✅ Streak Calendar
10. ✅ Settings Page
11. ✅ PWA Configuration

### Phase 2 Features (NEW - Intelligence Layer)
12. ✅ Recovery Score Widget
13. ✅ Predictive Analytics with EWMA
14. ✅ Confidence Intervals
15. ✅ Deload Warning Banner
16. ✅ Workout Recommendations (backend ready)

---

## 🚀 **How to Start Testing**

### 1. Start Development Server
```bash
cd c:\Users\tejbr\code\fitness-app
npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Sign In / Create Account
- Use existing account or create new one
- Complete onboarding if first time

---

## 📋 **Feature-by-Feature Testing**

### **1. Dashboard** (`/dashboard`)

#### Recovery Score Widget 🆕
- **What to Test**:
  - [ ] Widget appears on dashboard
  - [ ] Shows Ready Score (0-100)
  - [ ] Displays recommendation (Rest/Light/Moderate/Heavy)
  - [ ] Shows 3 component scores (Sleep, Intensity, Muscles)
  - [ ] Click info icon to expand details
  - [ ] Progress bar animates smoothly
  - [ ] Color changes based on score (red<60, yellow 60-80, green>80)

- **How to Test**:
  1. Go to dashboard
  2. Scroll to Recovery Score widget (below "Today's Summary")
  3. Check if score is displayed
  4. Click info icon (ℹ️) to see breakdown
  5. Log some workouts and sleep data, refresh to see changes

- **Expected Behavior**:
  - If no data: "Log sleep & workouts to see your Recovery Score"
  - With data: Shows score with color-coded recommendation
  - Detailed view shows sleep deficit, fatigued muscles, consecutive days

---

### **2. Analytics** (`/analytics`)

#### Deload Warning Banner 🆕
- **What to Test**:
  - [ ] Banner appears when SI is >10% below expected
  - [ ] Shows current vs expected SI
  - [ ] Displays deviation percentage
  - [ ] Shows 4 recommended actions
  - [ ] "Start Deload Week" button works
  - [ ] Can dismiss warning
  - [ ] Dismissal persists

- **How to Test**:
  1. Go to `/analytics`
  2. Look for warning banner (appears if SI drops significantly)
  3. Test dismiss button
  4. Test "Start Deload Week" button

- **Expected Behavior**:
  - Only shows if SI < expected by 10%+
  - Banner has yellow/red gradient
  - Striped background pattern
  - Stats shown: Current SI vs Expected SI

#### Charts with Fixed X-Axis 🆕
- **What to Test**:
  - [ ] X-axis labels are readable
  - [ ] No overcrowding of dates
  - [ ] Labels angled at -45°
  - [ ] Maximum 8 tick marks
  - [ ] Charts load smoothly

- **Tabs to Test**:
  1. **Overview**:
     - [ ] SI Growth chart (3 lines: predicted, observed, future)
     - [ ] Weekly volume bar chart
     - [ ] Muscle distribution pie chart
  
  2. **Strength**:
     - [ ] 1RM Progress bar chart
     - [ ] SI History line chart
  
  3. **Volume**:
     - [ ] Weekly training volume bar chart
     - [ ] Volume trend line chart
     - [ ] Average weekly volume stat
  
  4. **Balance**:
     - [ ] Muscle distribution pie chart with legend
     - [ ] Balance score (0-100)
     - [ ] Color-coded muscle groups
  
  5. **Trends**:
     - [ ] Workout frequency bar chart
     - [ ] Monthly comparison cards (3 stats)
     - [ ] SI progress line chart

---

### **3. Workout Log** (`/workout/log`)

#### Exercise Search 🔄
- **What to Test**:
  - [ ] Click muscle group → modal opens
  - [ ] Search input at top of modal
  - [ ] Type exercise name → filters in real-time
  - [ ] Case-insensitive search
  - [ ] Searches across 60+ exercises

- **How to Test**:
  1. Go to workout log
  2. Click any muscle group button
  3. Type "bench" in search → should show bench press variations
  4. Clear search → all exercises return

#### Rest Timer 🔄
- **What to Test**:
  - [ ] Click timer icon (top right)
  - [ ] Circular progress animation
  - [ ] Preset buttons (30s, 60s, 90s, 120s, 180s)
  - [ ] Play/pause controls
  - [ ] Reset button
  - [ ] Browser notification when complete

- **How to Test**:
  1. Click timer icon
  2. Select 30s preset
  3. Watch countdown
  4. Try pause/resume
  5. Let it complete → check notification

#### Plate Calculator 🔄
- **What to Test**:
  - [ ] Click calculator icon
  - [ ] Enter target weight
  - [ ] Quick set buttons work (60-200kg)
  - [ ] Shows plates per side
  - [ ] Color-coded by weight
  - [ ] Bar weight selection (20/15/10kg)

- **How to Test**:
  1. Click calculator icon
  2. Enter 100kg
  3. Check plate breakdown
  4. Try different bar weights
  5. Test quick sets

#### Workout Notes 🔄
- **What to Test**:
  - [ ] Notes textarea appears
  - [ ] Can type notes
  - [ ] Notes save with workout
  - [ ] Notes appear in workout history

---

### **4. Profile** (`/profile`)

#### Body Measurements 🔄
- **What to Test**:
  - [ ] Click "Edit" button
  - [ ] 6 measurement fields appear
  - [ ] Can enter numbers
  - [ ] Click "Save" → measurements stored
  - [ ] Values persist after refresh

- **How to Test**:
  1. Go to profile
  2. Scroll to body measurements
  3. Click "Edit"
  4. Enter values for chest, waist, etc.
  5. Click "Save"
  6. Refresh page → values should persist

---

### **5. Achievements** (`/achievements`)

#### Achievement Badges 🔄
- **What to Test**:
  - [ ] 18 total badges displayed
  - [ ] Color-coded by rarity (common, rare, epic, legendary)
  - [ ] Locked badges are grayscale
  - [ ] Unlocked badges are colorful
  - [ ] Hover effects work
  - [ ] Shows earned date for unlocked

- **Rarity Colors**:
  - Common: Gray
  - Rare: Blue
  - Epic: Purple
  - Legendary: Gold/Orange

#### Streak Calendar 🔄
- **What to Test**:
  - [ ] 90-day calendar displayed
  - [ ] Workout days highlighted
  - [ ] Today has ring around it
  - [ ] Current streak shown
  - [ ] Longest streak shown
  - [ ] Month labels visible

---

### **6. Settings** (`/settings`)

- **What to Test**:
  - [ ] Notifications toggle
  - [ ] Dark mode toggle
  - [ ] Units dropdown (metric/imperial)
  - [ ] Language dropdown (EN, ES, FR, DE)
  - [ ] Auto-save toggle
  - [ ] Rest timer default slider
  - [ ] Save button works
  - [ ] Settings persist

---

### **7. PWA (Progressive Web App)**

#### Desktop Testing
- **What to Test**:
  - [ ] Open Chrome DevTools (F12)
  - [ ] Go to "Application" tab
  - [ ] Check "Manifest" section
  - [ ] Verify manifest.json loads
  - [ ] Check "Service Workers"
  - [ ] Verify sw.js is registered
  - [ ] Test offline mode

#### Mobile Testing (Chrome Android)
- **What to Test**:
  - [ ] Visit site on mobile Chrome
  - [ ] Install prompt appears after 10s
  - [ ] Click "Install App"
  - [ ] App icon appears on home screen
  - [ ] Open from home screen
  - [ ] Launches in standalone mode (no browser UI)
  - [ ] Splash screen with Raptor logo
  - [ ] Theme color matches (#14F1C0)

---

## 🐛 **Known Issues to Watch For**

### Potential Issues
1. **Recovery Score Widget**: May show "no data" until you log sleep and workouts
2. **Deload Warning**: Only appears if SI drops >10% - you may need historical data
3. **PWA Icons**: Using SVG (raptor-logo.svg) - works on most browsers
4. **Charts**: Need at least 3 data points for predictions

### How to Generate Test Data
```bash
# Quick way to test:
1. Log 3-5 workouts (different dates)
2. Log sleep data for 7 days via /recovery/log
3. Refresh dashboard → Recovery Score appears
4. Go to analytics → Charts populate
```

---

## 📊 **Performance Checklist**

- [ ] Dashboard loads in < 2s
- [ ] Charts render smoothly
- [ ] No console errors
- [ ] All images load
- [ ] Animations are smooth (60fps)
- [ ] Mobile responsive works
- [ ] PWA install prompt appears
- [ ] Service worker registers

---

## 🎨 **Visual Checklist**

- [ ] All colors match Raptor.Fitt theme
- [ ] Primary color: #14F1C0 (cyan)
- [ ] Background: #0A0A0A (dark)
- [ ] Cards have glass effect
- [ ] Icons are Lucide React
- [ ] Fonts: Urbanist (headings), Inter (body), Space Mono (numbers)
- [ ] Smooth transitions on hover
- [ ] Responsive on mobile (test on real device if possible)

---

## 🔬 **API Endpoint Testing**

### Test Recovery Score API
```bash
# In browser console or Postman:
GET /api/recovery-score?userId=YOUR_USER_ID

# Expected response:
{
  "recoveryScore": {
    "overall": 82,
    "sleep": 85,
    "intensity": 78,
    "muscleFatigue": 83,
    "recommendation": "moderate",
    "details": {
      "sleepDeficit": 2.5,
      "fatiguedMuscleGroups": ["chest"],
      "daysWithoutRest": 2
    }
  },
  "advice": [...]
}
```

---

## ✅ **Testing Checklist Summary**

### Must Test (Critical)
- [ ] Dashboard loads without errors
- [ ] Recovery Score widget displays
- [ ] Analytics charts render
- [ ] Workout log functions
- [ ] PWA installs on mobile

### Should Test (Important)
- [ ] All 5 analytics tabs
- [ ] Achievement badges
- [ ] Settings save
- [ ] Exercise search
- [ ] Rest timer & plate calculator

### Nice to Test (Optional)
- [ ] Deload warning (needs specific conditions)
- [ ] Streak calendar with real data
- [ ] Body measurements
- [ ] Workout notes

---

## 🚨 **If Something Doesn't Work**

### Troubleshooting Steps
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Check browser console** (F12) for errors
4. **Verify you're logged in**
5. **Check if data exists** (workouts, sleep logs)
6. **Try incognito mode**
7. **Restart dev server**

### Common Fixes
```bash
# If nothing loads:
rm -rf .next
npm run dev

# If modules missing:
npm install

# If build fails:
npm run build
# (check for TypeScript errors)
```

---

## 📈 **Expected Test Results**

### With No Data
- Dashboard shows empty states
- Recovery Score: "Log sleep & workouts"
- Charts: "No data yet"
- Achievements: All locked

### With Some Data (5+ workouts)
- Dashboard shows statistics
- Recovery Score: 60-80 range
- Charts populate with data
- Some achievements unlocked

### With Lots of Data (30+ workouts)
- Dashboard fully populated
- Recovery Score: accurate readings
- Charts show trends
- Multiple achievements unlocked
- Deload warning may appear

---

## 🎉 **Success Criteria**

You've successfully tested everything when:
- ✅ No console errors on any page
- ✅ All features load and work
- ✅ PWA installs on mobile
- ✅ Charts display data correctly
- ✅ Recovery Score calculates properly
- ✅ Deload warning appears when needed
- ✅ All animations are smooth
- ✅ Mobile responsive works

---

## 📞 **Need Help?**

### Check These First
1. **/docs/FEATURE_IMPLEMENTATION_COMPLETE.md** - Feature list
2. **/docs/INTELLIGENCE_LAYER_PHASE2.md** - Intelligence features
3. **/docs/PWA_SETUP_COMPLETE.md** - PWA setup
4. **/docs/WARNINGS_FIXED.md** - Bug fixes

### Debug Mode
```bash
# Run with debug logging:
npm run dev

# Check specific API:
curl http://localhost:3000/api/recovery-score?userId=xxx
```

---

## 🦖 **Ready to Test!**

**Start Command**:
```bash
npm run dev
```

**Open**: http://localhost:3000

**Test Order**:
1. Dashboard → Recovery Score
2. Analytics → Charts + Deload Warning
3. Workout Log → All features
4. Profile → Measurements
5. Achievements → Badges + Calendar
6. Settings → Save preferences
7. Mobile → PWA Install

**Happy Testing!** 🚀

---

🦖 **Raptor.Fitt - Hunt Your Potential**

All features implemented and ready for testing!
