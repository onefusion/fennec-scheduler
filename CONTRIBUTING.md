# Contributing to Fennec Scheduler 🦊

Thank you for your interest in contributing to **Fennec Scheduler**! We welcome all contributions from bug fixes, documentation improvements, feature requests, to UI enhancements.

## How to Contribute

1. **Fork the Repository**: Create a fork of `fennec-scheduler` on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
3. **Make Your Changes**: Ensure your code follows TypeScript strict mode and passes type checking:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
4. **Commit & Push**:
   ```bash
   git commit -m "feat: add your awesome feature"
   git push origin feature/your-awesome-feature
   ```
5. **Open a Pull Request**: Submit a Pull Request targeting the `main` branch with a description of your changes.

## Code Style Guidelines
- Use React Functional Components with TypeScript.
- Follow Tailwind CSS utility patterns.
- Keep edge runtime performance in mind for Cloudflare Pages compatibility.
