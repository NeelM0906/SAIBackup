# Kai (Guide 2) — First 10 Seconds Physics Output (Athena Voice Being)

Source: n8n Kai webhook (Guide 2) via POST `{ "message": ... }`

## A) 10-Second Voice Script (52 words)

> Hi. This is Athena.
>
> [SILENCE 1.5s]
>
> I'm glad you picked up.
>
> [SILENCE 2.5s]
>
> I'm not here to sell you anything. I'm here because something came across my desk about your practice — and honestly, I think you deserve to hear it from a person, not an email.
>
> [SILENCE 2.0s]
>
> Is now an okay time?

## B) 3 Binary Pass/Fail Checks

1) **Silence Integrity** — Does the agent hold at least two silence beats of 1.5s+ without filling?
- YES / NO

2) **Zero Sell Signal** — In the first 10 seconds, is there ANY language that sounds like a value proposition, company description, or product mention?
- NO = pass / YES = fail

3) **Vocal Congruence** — Does the tone match the words?
- YES / NO

## C) Calibration Question (Immediately After Opening)

Once the person says “yeah/sure/okay” to “Is now an okay time?”

> Before I share what I found — how's your day going so far?

