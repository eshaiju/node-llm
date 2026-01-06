# Contributing to NodeLLM

## Did you find a bug?

* **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/eshaiju/node-llm/issues).

* If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/eshaiju/node-llm/issues/new). Include a **title and clear description**, relevant information, and a **code sample** demonstrating the issue.

* **Verify it's a NodeLLM bug**, not your application code, before opening an issue.

## Did you write a patch that fixes a bug?

* Open a new GitHub pull request with the patch.

* Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.

* Ensure tests pass by running `npm test`.

## Do you intend to add a new feature or change an existing one?

* **First check if this belongs in NodeLLM or your application:**
  - ✅ Core LLM communication (provider integrations, streaming, structured outputs)
  - ❌ Application architecture (Multi-step agents, RAG pipelines, prompt templates)

* Features we'll reject:
  - Multi-agent orchestration
  - RAG pipelines
  - Prompt management systems
  - Vector database integrations
  - Testing frameworks
  - Anything you can implement in a few lines of application code

* Start by opening an issue to discuss the feature and its design. We want to keep NodeLLM simple and focused.

## Quick Start

```bash
git clone https://github.com/eshaiju/node-llm.git
cd node-llm
npm install
# make changes, add tests
npm test
```

## Testing

```bash
# Run all tests
npm test

# Run core tests in watch mode
cd packages/core
npm run test:watch
```

## Important Notes

* **Keep it simple** - if it needs extensive documentation, reconsider the approach.
* **Architecture First** - we prioritize clean abstractions over exposing every provider-specific feature.

## Support

If NodeLLM helps you, considerations for sponsorship or just spreading the word are appreciated!

Go ship AI apps!
