# Measurement & Monitoring Framework (Marketing Sprint)
**Owner:** SAI Memory
**Directive:** 500 Visioneer Programs in 90 Days ($25M-$50M)

## 1. The Macro Scoreboard (Step 3 Process Mastery)
To hit 500 completed programs at $50k-$100k, we must rigorously monitor the conversion gates from "Hello to Yes."
*   **Total Gross Sales Collected vs Contracted Pipeline:** Defining the reality of a "sale" (deposit/paid/financed).
*   **Cost of Acquisition (CAC):** Total ad/data spend divided by signed Visioneer agreements.
*   **Summit Pipeline Velocity:** Number of attorneys registered for the mid-May ACT-I legal summit, segmented by domain.

## 2. Micro Outcomes (Curve of Possibility Split-Testing)
We are running split tests within split tests (videos vs quizzes vs being chats). We must track:
*   **Volume of Meaningful Dialogues (VMD):** The number of attorneys actively interacting with an ACT-I being for more than 5 chat turns.
*   **Engagement Drop-off:** The exact step in a 3-min, 5-min, or 10-min competition where the user abandons the portal.
*   **Call-to-Action (CTA) Friction:** The conversion rate of attorneys moving from the Colosseum Leaderboard directly to scheduling an Athena/Human call.
*   **Channel Viability:** Email click-through rates (Seamless vs Apollo vs BookYourData) mapped against actual scheduled appointments.

## 3. Data Injection & Dashboard Architecture
*   **Human Checkpoint:** We cannot fly blind. The live UI must display the 5 split-test dimensions (geo, models, lengths, public vs private, incentives) mapping their direct ROI.
*   **The Cadence:** The master `colosseum-dashboard.vercel.app/marketing` page must refresh hourly pulling from Supabase logs and Vercel analytics.
*   **Contamination Safety:** We monitor for statistical bleed. If the $47K Email hook proves mathematically superior in NJ, the system automatically triggers an alert to test it in TX before blowing the budget.