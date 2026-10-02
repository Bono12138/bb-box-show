# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## BB 箱子 prototype decisions

- Use the selected warm, cinematic, late-night rehearsal-room direction for the existing program pages. Assess the umbrella website and other businesses against their actual content; their detailed visual direction is not yet final.
- The brand shown to visitors is `BB 箱子`.
- The program targets 4–6 total participants, including the host.
- Bono is the initial host and appears as an equal participant who also manages pacing and topic transitions.
- The program is mainly in Chinese.
- Retain the program's recruitment paths for conversation participants, production partners, venues and equipment, topics and stories, and collaboration resources.
- Read `docs/business/overview.md` and `docs/business/decisions.md` before changing public content. BB 箱子 includes courses, activities, the Q&A group, the comedy conversation program and public production records. The current business priority is the AI/Codex course.
- Consult the local Kimi Code CLI with `kimi-code/k3-256k` on substantive copy, strategy, aesthetic judgment and creative direction, following the global guidance and `direct-creative-work` skill. Assess its advice against the actual brief; it does not establish business facts or replace reviewing the rendered site.
- Use the existing BB Rabbit identity as a restrained brand signature: derive a compact transparent mark for the custom wordmark, backstage/open-work section, and footer instead of placing the original white-background logo directly in the interface. Do not turn the site into a children\'s cartoon or repeat the mascot in every section.
- Use progressive disclosure for the visitor's current need: relevant activity or product, real work, participation, progress, then deeper methods and open records. Course pages can directly explain AI; program pages explain the program.
- The top-left brand must use the designed BB Rabbit wordmark rather than a plain type-only `BB 箱子` label.
- Use the dedicated public GitHub repository `Bono12138/bb-box-show`. GitHub Pages is the existing public host; keep its working links and deployment intact unless a replacement is authorized and verified.
- Display Bono's supplied WeChat QR code directly in the lower contact section, alongside a copyable WeChat ID; participation links should lead to that visible section. Contact assets are still needed.
