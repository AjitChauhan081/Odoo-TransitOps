# Hackathon Demo Video Script & Storyboard: TransitOps

Since hackathon judges review hundreds of projects, keep the video between **2 to 3 minutes**, fast-paced, and highly focused on the **Problem** and the **Solution** you built.

---

## 🎬 Part 1: The Explanation (The "Pitch") - 30 to 45 Seconds
*This section can feature you speaking on camera, or a voiceover playing over some high-quality B-roll footage or slides.*

**1. The Hook (5-10 sec):** 
Start with a punchy statement about the problem. 
> "Logistics companies lose millions every year to inefficient dispatching, poor maintenance tracking, and fragmented data. Managing a fleet shouldn't require five different spreadsheets."

**2. The Solution (10-15 sec):** 
Introduce your project. 
> "Enter TransitOps: A Smart Transport Operations Platform. We've built an end-to-end ecosystem that digitizes vehicle management, enforces strict safety rules, and provides real-time financial insights in a single, unified dashboard."

**3. The "Secret Sauce" / Value Proposition (10-15 sec):** 
Highlight what makes your project technically impressive.
> "Unlike basic CRUD apps, TransitOps features a strict Role-Based Access Control (RBAC) engine, automated trip lifecycle transitions, and deep integrations between maintenance and dispatching—built on a high-performance FastAPI and React architecture."

---

## 💻 Part 2: The Technical Demo (Screen Recording) - 1.5 to 2 Minutes
*This is the most important part. Don't show your code—show the UI working flawlessly. Use screen recording software like OBS Studio, Loom, or Mac/Windows built-in recorders.*

**Scene 1: The Login & RBAC (20 seconds)**
- **Visual:** Show the login screen. Log in as `fleet@transitops.com`.
- **Narration:** "TransitOps enforces strict role-based access. Here we log in as a Fleet Manager, giving us God-eye access to the entire fleet's analytics and operations."
- **Action:** Show the dashboard populating with live metrics (API fetching). Show the sidebar with all options available.

**Scene 2: Business Rules & Fleet Registry (30 seconds)**
- **Visual:** Navigate to the Vehicle Registry, then to the Trips Dispatcher.
- **Narration:** "Our backend strictly enforces business logic. A dispatcher cannot assign a trip to an overloaded vehicle, a suspended driver, or a truck currently in the shop."
- **Action:** Quickly show creating a Trip. Highlight how the UI dynamically reacts and how the backend prevents rule-breaking. Show a trip moving from "Draft" to "Dispatched."

**Scene 3: Driver Handoff (20 seconds)**
- **Visual:** Quickly log out, and log back in as `driver@transitops.com`. 
- **Narration:** "If we switch to a Driver's perspective, the interface dynamically simplifies. Drivers only see what they need to see."
- **Action:** Show that the "Add Vehicle" buttons are hidden. Show the driver completing their dispatched trip and logging the fuel consumed.

**Scene 4: Financial & Analytics Impact (20 seconds)**
- **Visual:** Log back in as `finance@transitops.com` and go to the Analytics tab.
- **Narration:** "As trips complete and fuel is logged, our Financial Analysts get real-time visibility into the fleet's ROI, cost-per-trip, and overall expenses without manual data entry."
- **Action:** Hover over the beautiful charts on the Analytics page.

---

## 🚀 Part 3: Conclusion & Tech Stack - 15 Seconds
*Wrap it up quickly and confidently.*

- **Narration:** "TransitOps was built using React, Vite, and custom CSS for a raw, modern aesthetic on the frontend. The backend is powered by FastAPI, PostgreSQL, and SQLAlchemy, ensuring lightning-fast performance and data integrity. Thank you!"

---

## 💡 Pro-Tips for a Winning Video
1. **Never type live:** Have your forms pre-filled or use copy-paste. Watching someone type an email address wastes valuable seconds.
2. **Zoom In:** When screen recording, slightly zoom in on your browser. Judges might be watching your video on a small laptop screen or phone.
3. **Audio is 50% of the video:** Do not use a laptop microphone if you can avoid it. Find a quiet room, use a decent headset or mic, and speak with energy. If you mess up a sentence, just pause and say it again—you can cut the mistake out in editing!
4. **Use CapCut or DaVinci Resolve:** Both are free, excellent video editors. You can easily cut out the boring parts (like waiting for a page to load) to keep the video snappy.
