# Scenes

The source project currently includes these initial Cocos Creator scenes:

- `Boot.scene`: initializes the app shell and routes to Home.
- `Home.scene`: renders the minimal Home shell without migration placeholder copy.

Controllers for the complete flow live in `../scripts/scenes/`: Boot, Home, Bank, Study, co-op selection, Room, PK, shared co-op, spell co-op, Result, History, Feedback, and Help.

`Home.scene` keeps a serialized shell component that builds every post-Boot route at runtime and mounts these controllers. Additional `.scene` files are not required for the first functional preview. Follow `../../../COCOS_RELEASE_QA.md` for Creator import and visual verification.
