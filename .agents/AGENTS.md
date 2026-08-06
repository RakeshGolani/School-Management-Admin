# AGENTS.md - Antigravity Agent & Workflow Guidelines

## General Behavioral Rules
1. **Design Excellence**: Ensure all UI implementations use modern, rich aesthetics, clear typography, and subtle micro-interactions.
2. **Quality & Stability**: Never patch symptoms superficially. Always verify underlying component contracts and layout boundary behaviors.
3. **Execution Verification**: Always run compilation/build verification to confirm changes work seamlessly.
4. **Environment Configuration**: Always use environment variables (e.g., `process.env.NEXT_PUBLIC_API_URL`) for endpoint URLs. Avoid hardcoding ports and domains like `http://localhost:5000` inside action files or components.
5. **Namespace Controller Segregation**: Maintain strict segregation between user roles. Admin-specific CRUD actions and listings should have dedicated controllers in the backend `Admin` namespace folder and route through `/api/admin/...`.
