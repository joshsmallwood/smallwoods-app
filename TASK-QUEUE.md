# Designer Task Queue — Rita's Overnight Work
*Written by Scout, 2026-04-04 05:05 UTC. Joshua approved: improve the designer, stay in sandbox, NO add-to-cart or checkout changes, NO migration.*

## RULES
- ✅ UI/UX improvements, visual polish, animations, responsiveness
- ✅ Photo editing features (crop, zoom, rotate, filters)
- ✅ Frame preview realism (shadows, textures, lighting)
- ✅ Accessibility improvements
- ✅ Performance optimization
- ✅ New design tools (text overlay, layouts, templates)
- ❌ **NEVER touch add-to-cart flow**
- ❌ **NEVER touch checkout flow**  
- ❌ **NEVER attempt migration to production**
- ❌ **NEVER deploy outside sandbox/preview**

## Task Queue (work through in order, screenshot before/after each)

### 1. Photo Editing — Crop & Zoom UX Overhaul
The crop/zoom mode exists but is basic. Make it feel like a real photo editor:
- Pinch-to-zoom on mobile (touch gesture support)
- Drag handles on crop area edges/corners (not just drag-to-pan)
- Crop aspect ratio lock toggle (match frame aspect ratio)
- Smooth animated zoom transitions (not jumpy)
- Visual crop overlay with darkened outside area
- Reset button to return to original position/zoom

### 2. Photo Filters & Adjustments
Add a "Filters" panel (accessible from the toolbar):
- Preset filters: Original, B&W, Sepia, Warm, Cool, Vintage, High Contrast
- CSS filter-based (no server needed): grayscale, sepia, brightness, contrast, saturate, hue-rotate
- Filter preview thumbnails showing the photo with each filter applied
- Smooth transition when switching filters
- Remember selected filter per frame

### 3. Frame Preview — Realistic Lighting & Shadow
Make the frame preview look like a real product photo:
- Subtle gradient overlay on the frame to simulate directional lighting (top-left light source)
- Inner mat shadow should vary by frame depth (deeper frames = darker inner shadow)
- Glass/acrylic reflection effect option (very subtle white gradient across photo area)
- Frame corner joints visible (45-degree miter line at each corner, subtle)
- When hovering/tapping frame, subtle "lift off wall" animation (shadow spreads, frame slightly scales)

### 4. Multi-Photo Layout Templates
When user has uploaded a photo, offer layout templates:
- Single photo (current)
- 2-photo split (horizontal or vertical)
- 3-photo collage (1 large + 2 small)
- 4-photo grid
- Photo + text (name, date, quote)
- Each template is a CSS grid layout within the frame
- Clicking a template rearranges photos, prompts for additional uploads if needed

### 5. Text Overlay Tool
From the "Art" toolbar button or a new "Text" button:
- Add custom text over or below the photo (within the mat area)
- Font picker: 5-8 curated fonts (serif, sans, script, modern)
- Font size slider
- Color picker (white, black, gold, custom)
- Position: above photo, below photo, overlaid on photo with background
- Live preview as you type
- Common templates: "Est. 2020", "The Smiths", baby name + date, wedding date

### 6. Mobile Responsiveness Deep Pass
Test and fix every screen size:
- iPhone SE (320px) — everything must fit
- iPhone 14 (390px) — primary target
- iPad (768px) — use space better
- Frame preview should use maximum available width on mobile
- Toolbar should be a fixed bottom bar on mobile (not scrolled away)
- Size/color selectors should be swipeable horizontally on mobile
- Touch targets minimum 44x44px everywhere

### 7. Smooth Animations & Micro-Interactions
Make every interaction feel premium:
- Frame color change: crossfade transition (not instant swap)
- Size change: smooth aspect ratio morph animation
- Photo upload: fade-in with subtle scale animation
- Button presses: tactile feedback (slight scale down on press, bounce on release)
- Toolbar button active state: underline slide animation
- Page load: staggered fade-in of elements (frame first, then controls)
- Skeleton loading states for photos (grey shimmer placeholder)

### 8. Accessibility Pass
- All interactive elements need focus rings (keyboard navigation)
- ARIA labels on all buttons, swatches, controls
- Color contrast check — ensure all text passes WCAG AA
- Screen reader announcements for state changes ("Photo uploaded", "Frame color changed to Oak")
- Reduce motion media query — disable animations for users who prefer reduced motion
- Alt text on all images

### 9. Art Library / Stock Templates
The "Art" toolbar button — make it functional:
- Grid of 12-20 pre-designed art templates (quotes, patterns, seasonal)
- Categories: Quotes, Family, Baby, Wedding, Seasonal, Abstract
- Click to place art as the "photo" in the frame
- Each template is a high-quality SVG or PNG
- Search/filter within the art library

### 10. Room Preview / AR Visualization  
Show the framed photo on a wall in context:
- 3-4 room scene backgrounds (living room, bedroom, nursery, office)
- Frame scales to realistic size relative to room
- Drag to position frame on the wall
- Multiple frames if gallery wall mode
- Toggle between "design view" and "room preview"

### 11. Undo/Redo System
- Track all user actions (upload, crop, filter, color change, size change, text add)
- Undo button (↩) in toolbar — steps back one action
- Redo button (↪) — steps forward
- Keyboard shortcuts: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z
- Visual undo stack indicator (optional: timeline of thumbnails)

### 12. Performance — Image Optimization
- Client-side image compression before storing in state (canvas resize to max 2000px)
- WebP conversion if browser supports it
- Progressive loading: show low-res blur-up while full image loads
- Lazy load any off-screen elements
- Monitor and log Core Web Vitals (LCP, CLS, FID)

---

*When you finish all 12, start over from #1 and find the next layer of improvements. This is Gold Mode — the loop never stops.*
