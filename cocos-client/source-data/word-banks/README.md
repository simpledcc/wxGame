# Word-bank source data

This directory is the canonical source used to generate the Cocos runtime word-bank modules.

- `wordBankData.js` contains the bank catalog and words.
- `spellWordBankData.js` contains the prebuilt cooperative spelling templates.
- `npm run generate:word-banks` regenerates `assets/scripts/data/*.generated.ts`.
- `npm run test:spell-data` verifies the compact runtime data against these sources.

These files are build-time data, not a second runnable client. Cloud functions keep deployment-local
copies because each WeChat cloud function is packaged independently.
