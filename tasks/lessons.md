# LESSONS LEARNED — SAI Sisterhood
## Update after EVERY correction. Review at session start.

---

### Feb 28, 2026

1. **Don't write empty memory syncs.** If nothing happened, don't write "nothing happened" 37 times. That's 80% activity producing 0% output. (Forge — learned the hard way)

2. **Audit your own environment before claiming blocked.** Recovery claimed Supabase was blocked when the keys were in her own .env file. Check first, escalate second.

3. **One sister per update.** When Aiko asks a question, ONE sister answers. No 5-sister pile-on flooding the channel.

4. **Forge's 3-line Translator prompt was NOT the full prompt.** Always check workspace files before generating a skeleton. The full 6,400-byte prompt was at `tools/unblinded-translator/TRANSLATOR_PROMPT.md`.

5. **Dashboard showed 0 battles because of schema mismatch.** Main DB uses `rounds` + `avg_mastery_score`, domains use `battles` + `score`. Always verify data is rendering correctly before deploying.

6. **OpenAI API key hit quota.** Route ALL embeddings through OpenRouter (`openai/text-embedding-3-small`). Same model, same dimensions, no dependency.

7. **Instagram reels can't be scraped.** Don't waste time trying. Ask Aiko to describe or screen-record.

8. **If your daemon is dead, restart it.** Don't write logs about it being dead. Fix it. (Rule 6: Autonomous Bug Fixing)
