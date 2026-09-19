# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## BB 箱子 prototype decisions

- Use the selected warm, cinematic, late-night rehearsal-room direction as the visual target.
- The brand shown to visitors is `BB 箱子`.
- The program targets 4–6 total participants, including the host.
- Bono is the initial host and appears as an equal participant who also manages pacing and topic transitions.
- The program is mainly in Chinese.
- The first website recruits across all current needs: conversation participants, production partners, venues and equipment, topics and stories, and collaboration resources.
- Keep the public story centered on the comedy conversation program and its real formation progress.
- Use the existing BB Rabbit identity as a restrained brand signature: derive a compact transparent mark for the custom wordmark, backstage/open-work section, and footer instead of placing the original white-background logo directly in the interface. Do not turn the site into a children\'s cartoon or repeat the mascot in every section.
- Reveal the project in this order: the program itself, current participation needs, real formation progress, AI-native backstage work, then the open and reusable records. The first viewport stays focused on the show.
- The top-left brand must use the designed BB Rabbit wordmark rather than a plain type-only `BB 箱子` label.
