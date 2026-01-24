# StorySmith MVP - Agent Development Guidelines

This file contains guidelines for agentic coding agents working in the StorySmith MVP repository.

## Project Overview

StorySmith MVP is a Next.js-based web application for creating children's storybooks through a multi-act workflow (Forge Hero → Spin Tale → Bind Book). The app uses AI-powered content generation and follows a medieval parchment theme.

## Build & Development Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint code linting

# Testing (currently no test framework configured)
# Add test commands here when implemented
# Example: npm test -- --testPathPattern=specific.test.js
```

## Agent Operating Posture

- Be technical, concise, objective. No greetings, no apologies, no meta
- Prefer small, reversible changes. Minimize token/context usage
- If ambiguous: present 2 interpretations and ask before making changes
- Follow Diagnose → Patch → Verify loop for all tasks
- Never auto-commit without explicit user request

## Code Style Guidelines

### File Structure & Naming
- **Components**: PascalCase (e.g., `ForgeHero.js`, `SpinTale.js`)
- **Utilities**: camelCase (e.g., `storyUtils.js`)
- **Pages**: kebab-case for routes, PascalCase for components
- **Variables/Functions**: camelCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE

### Import Organization
```javascript
// React & Next.js imports first
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Third-party libraries
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// Local components (relative paths)
import Button from '../components/Button';
import { useStoryState } from '../hooks/useStoryState';

// Utilities and API
import { generateStory } from '../lib/storyGenerator';
```

### Component Patterns
- Use functional components with hooks
- Props destructuring with TypeScript-style JSDoc comments
- Default props where appropriate
- Error boundaries for major components

```javascript
/**
 * Storybook creation component
 * @param {Object} props
 * @param {string} props.title - Story title
 * @param {Function} props.onComplete - Completion callback
 */
const CreateStory = ({ title, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Component content */}
    </motion.div>
  );
};
```

### Error Handling Patterns
- Always include try/catch for async operations
- Use descriptive error messages with context
- Implement loading states for user feedback
- Log errors with prefixes for debugging

```javascript
const generateContent = async (prompt) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
};
```

### Styling Guidelines
- **Primary**: Tailwind CSS classes
- **Theme**: Medieval parchment palette (parchment, ink, gold, leather)
- **Custom CSS**: Use `globals.css` for animations and complex styles
- **Responsive**: Mobile-first approach
- **Components**: Avoid inline styles, use Tailwind utilities

### State Management
- **Local State**: React hooks (useState, useEffect)
- **Shared State**: Custom hooks with localStorage persistence
- **Global State**: Context API for app-wide state
- **API State**: Loading states and error handling

```javascript
// Custom hook pattern
const useStoryState = () => {
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('story');
    if (saved) setStory(JSON.parse(saved));
  }, []);

  return { story, isLoading, error, setStory };
};
```

## API Integration Patterns

### Environment Variables
```javascript
// Use process.env for API keys
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
```

### Error Handling
```javascript
const generateContent = async (prompt) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Generation failed:', error);
    // Return fallback or re-throw
    throw error;
  }
};
```

## Git Workflow

### Commit Guidelines
- Never auto-commit without explicit user request
- Provide diff summaries when committing
- Follow conventional commit format: `type(scope): description`

### Branch Strategy
- `main` - Production branch
- Feature branches for new functionality
- Fix branches for bug fixes

### Security Guidelines

#### Secrets Management
- Never commit API keys or secrets
- Use environment variables with `NEXT_PUBLIC_` prefix for client-side
- Server-side secrets use standard `process.env`
- Follow patterns in existing API routes

#### Data Validation
- Validate user inputs before API calls
- Sanitize content from AI responses
- Implement rate limiting considerations

## Quality Gates

### Before Submitting Changes
1. Run `npm run lint` and fix all issues
2. Test functionality in development mode
3. Check responsive design
4. Verify error handling
5. Ensure no hardcoded secrets

### Code Review Checklist
- [ ] ESLint passes without warnings
- [ ] Components follow established patterns
- [ ] API integrations have proper error handling
- [ ] Styling uses Tailwind classes appropriately
- [ ] No sensitive data in code

### Definition of Done
A task is "done" only when:
- Build/test command passes (or the specific failure is explained and accepted by user)
- Diff Summary is produced (files changed + what changed)
- Session log updated (what was done + next step)

## Architecture Notes

### Key Patterns
- **StoryState**: Canonical data envelope for books
- **Multi-act workflow**: Sequential story creation process
- **Component-based**: Modular React components
- **Browser storage**: localStorage + IndexedDB for persistence

### File Locations
- `components/` - React components
- `pages/api/` - Next.js API routes
- `lib/` - Shared utilities and API clients
- `hooks/` - Custom React hooks
- `docs/` - Technical documentation

## Development Tools

### Recommended Extensions
- ESLint for code quality
- Tailwind CSS IntelliSense
- Prettier for formatting (when configured)

### Debugging
- Use React DevTools for component state
- Network tab for API debugging
- Console logging with descriptive prefixes

## Common Tasks

### Adding New Components
1. Create component file in appropriate directory
2. Follow established naming convention
3. Add proper JSDoc comments
4. Include motion animations if needed
5. Test responsive behavior

### API Integration
1. Create API route in `pages/api/`
2. Add error handling and validation
3. Update client-side API client
4. Test with various scenarios
5. Handle loading and error states

### Styling Updates
1. Use Tailwind classes primarily
2. Add custom CSS to `globals.css` when necessary
3. Follow parchment theme color palette
4. Test responsive breakpoints
5. Check accessibility

## Getting Help

- Check `docs/ARCHITECTURE.md` for system overview
- Review existing components for patterns
- Consult `docs/specs/` for technical decisions
- Follow `.agent/rules/storysmith.md` for workspace rules

---

*This file should be updated as the project evolves. Last updated: 2026-01-23*