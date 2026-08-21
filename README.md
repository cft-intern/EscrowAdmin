# 🚀 Admin Template - Production-Ready React Template

A comprehensive, scalable, and production-ready React admin template built for 100+ person engineering teams. This template enforces clean code practices, provides reusable components, and includes advanced features for large-scale applications.

## ✨ Features

### 🏗️ Core Stack
- **React 18** with latest features and concurrent rendering
- **TypeScript** in strict mode for type safety
- **Vite** for lightning-fast development and building
- **TailwindCSS** with shadcn/ui for consistent, beautiful UI
- **Redux Toolkit + RTK Query** for state management and API caching
- **React Hook Form** with Zod validation for forms
- **Axios** with interceptors for robust API communication

### 🎨 Advanced Theme System
- **Multi-theme support**: Light, Dark, Corporate Blue, Playful Purple
- **Persistent theme preferences** stored in localStorage
- **System preference detection** with `prefers-color-scheme`
- **Hot-swappable themes** without page reload
- **CSS variables** mapped to Tailwind classes
- **Theme switcher UI** with dropdown selection

### 🏛️ Architecture & Reusability
```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui primitives
│   └── common/    # Shared components
├── features/      # Domain-driven feature modules
├── hooks/         # Custom React hooks
├── layouts/       # Page layout components
├── pages/         # Page-level components
├── store/         # Redux slices + RTK Query
│   ├── slices/    # Redux Toolkit slices
│   └── api/       # RTK Query endpoints
├── theme/         # Theme configuration
├── utils/         # Helper functions
├── tests/         # Test utilities
└── types/         # TypeScript type definitions
```

### 🔐 Authentication & Authorization
- **JWT + Refresh Token** flow with automatic renewal
- **Role-based routing** (ProtectedRoute, AdminRoute)
- **Persistent authentication** state across sessions
- **Automatic token cleanup** on expiration
- **Secure token storage** with localStorage

### 🛡️ Error Handling
- **Global ErrorBoundary** with styled fallback UI
- **Axios interceptors** for API error handling
- **Exponential backoff** retry mechanism
- **Inline error banners** for user feedback
- **Development error details** with production-safe logging

### 🌍 Internationalization
- **react-i18next** integration
- **Language detection** from browser/localStorage
- **English + Spanish** example translations
- **Language switcher** component

### 🚩 Feature Flags
- **Runtime feature toggles** for A/B testing
- **localStorage persistence** for user preferences
- **TypeScript-safe** feature flag hooks
- **Easy configuration** for beta features

### 📝 Forms & Validation
- **Multi-step wizard forms** with progress tracking
- **Schema validation** using Zod
- **Field arrays** and nested object support
- **Conditional field** rendering
- **Form state persistence** across steps

### 📊 Data Tables
- **Advanced DataTable** with full CRUD operations
- **Sorting, filtering, pagination** out of the box
- **Row selection** with bulk actions
- **Editable cells** for inline editing
- **TypeScript-safe** column definitions

### 🧪 Testing & Quality
- **Jest + React Testing Library** for comprehensive testing
- **ESLint + Prettier** with Airbnb configuration
- **Stylelint** for CSS best practices
- **Husky** pre-commit hooks for code quality
- **Conventional Commits** with commitlint
- **TypeScript strict mode** enabled

### 🔧 Development Experience
- **Hot Module Replacement** for instant feedback
- **Absolute imports** with path mapping
- **Environment configuration** with .env support
- **Redux DevTools** integration
- **Source maps** for debugging
- **Fast refresh** for React components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git for version control

### Installation

1. **Clone and setup**
   ```bash
   git clone <your-repo>
   cd admin-template
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Type-check with TypeScript |

## 📁 Project Structure

### Key Files & Folders

#### Core Configuration
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.js` - Tailwind + shadcn/ui setup
- `vite.config.ts` - Vite configuration with path aliases
- `.eslintrc.json` - ESLint rules for code quality

#### Theme System
- `src/theme/config.ts` - Theme definitions and utilities
- `src/theme/ThemeProvider.tsx` - Theme context and persistence
- `src/styles/globals.css` - CSS variables and theme classes

#### State Management
- `src/store/index.ts` - Redux store configuration
- `src/store/slices/` - Redux Toolkit slices
- `src/store/api/` - RTK Query API endpoints

#### Reusable Hooks
- `src/hooks/useDebounce.ts` - Debounce values and callbacks
- `src/hooks/useThrottle.ts` - Throttle function calls
- `src/hooks/useClipboard.ts` - Clipboard operations
- `src/hooks/useOutsideClick.ts` - Outside click detection
- `src/hooks/useLocalStorage.ts` - localStorage sync

## 🎯 Usage Examples

### Theme Switching
```tsx
import { useTheme } from '@/theme/ThemeProvider';

function MyComponent() {
  const { theme, themeMode, setTheme, setThemeMode } = useTheme();
  
  return (
    <button onClick={() => setThemeMode('dark')}>
      Switch to Dark Mode
    </button>
  );
}
```

### Feature Flags
```tsx
import { useFeatureFlag } from '@/hooks/redux';

function BetaFeature() {
  const betaEnabled = useFeatureFlag('betaFeatures');
  
  if (!betaEnabled) return null;
  
  return <div>Beta feature content</div>;
}
```

### Form with Validation
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### API Calls with RTK Query
```tsx
import { useGetUsersQuery, useCreateUserMutation } from '@/store/api/usersApi';

function UsersList() {
  const { data: users, isLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {users?.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## 🧪 Testing

### Test Structure
```
src/tests/
├── __mocks__/          # Mock implementations
├── utils/              # Test utilities
├── setup.ts            # Test environment setup
└── components/         # Component tests
```

### Writing Tests
```tsx
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@/tests/utils';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  render(
    <TestWrapper>
      <MyComponent />
    </TestWrapper>
  );
  
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

## 🚢 Deployment

### Environment Variables
```bash
# Production .env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME="Your App Name"
VITE_FEATURE_ANALYTICS_ENABLED=true
```

### Build Optimization
The template includes:
- **Tree shaking** for smaller bundles
- **Code splitting** with lazy loading
- **Asset optimization** with Vite
- **Source maps** for debugging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

### Code Style
- Follow ESLint/Prettier configuration
- Use TypeScript strict mode
- Write tests for new features
- Follow conventional commit messages

### Pull Request Process
1. Fork and create feature branch
2. Write/update tests
3. Ensure all checks pass
4. Submit PR with clear description

## 📚 Learning Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Best Practices
- Component composition over inheritance
- Custom hooks for reusable logic
- Type-first development
- Accessibility considerations
- Performance optimization

## 📄 License

This template is available under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

Built with these amazing technologies:
- React & TypeScript ecosystem
- TailwindCSS & shadcn/ui
- Redux Toolkit & RTK Query
- Vite & modern tooling
- Testing ecosystem

---

**Ready to build something amazing?** 🚀

This template provides everything you need for a production-ready React application. From authentication to theming, from forms to data tables, it's all here and ready to scale with your team.

Happy coding! 💻