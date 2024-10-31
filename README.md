# Neon Hub Configuration Tool

## Management UI for Hub configuration

- Views for managing Hub configuration, Node services, and system updates
- Documentation for all

### Tasks

a) Develop a user interface for Hub management
b) Implement views for:

- [x] Managing Hub configuration (API keys, Hana configuration)
  - [Claude-generated samples](https://claude.ai/chat/41a0de8d-01ee-4c62-9f88-214afadb71d2)
  - [x] All Hana configuration items, obscuring secrets, with a refresh button to pull any updates from file.
    - [x] Consider an option to show last refresh time
  - [x] Do we make the RMQ configuration editable? Or leave that as an advanced user topic?
    - We'll leave RMQ as an advanced user topic
  - [x] All Iris configs
  - [x] Websocket
  - [x] API keys for external services
  - [ ] OPTIONAL: JSON editing for skills
    - Anything more would require settingsmeta.yml to be in all Neon skills
  - [ ] OPTIONAL: Disabling skills
    - This would add skills to the blacklist, and you'd create the skill list by pulling from pip in the Neon-skills container and concatenating with the config
  - [ ] OPTIONAL: Adding skills
    - This might be a little tricky, but we can have a shortlist of non-default skills users can install via config
- [x] Enabling/modifying Node services
  - Completed with Yacht
- [ ] Viewing connected Node devices (optional)
- [ ] Updating/restarting running containers (optional)

c) Test and validate all UI functions
d) Create user documentation for the management system
e) (Not in SOW but important) Basic auth to get the page, so we don't just have an open page on the home network

- [x] Done in the UI
- [ ] Done in the backend

## Developing the UI

The UI is built using React and Material-UI. The project is bootstrapped with Vite. To build the UI, run the following commands in the `frontend/neon-hub-config` folder:

```bash
pnpm install
pnpm dev
```

## Building the UI

The UI is found in the `frontend/neon-hub-config` folder and is built using React and Material-UI. The project is bootstrapped with Vite. To build the UI, run the following commands in the `frontend/neon-hub-config` folder:

```bash
pnpm install
pnpm build
```

To package the UI into the backend, run the following command in the `frontend/neon-hub-config` folder:

```bash
pnpm build:py
```

## Running the UI

To run the UI, run the following command in the root of the repository:

```bash
poetry run python neon_hub_config/main.py
```

The UI will be available at `http://localhost:8000`.
