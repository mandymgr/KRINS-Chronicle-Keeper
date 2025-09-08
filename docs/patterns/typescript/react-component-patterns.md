# React Component Patterns

## Overview
Common patterns for React components in TypeScript, focusing on clean, maintainable, and type-safe implementations.

## Pattern: Functional Component with Props Interface

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## Pattern: Custom Hook for State Management

```typescript
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounter = (initialValue = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
};
```

## Pattern: Context Provider with TypeScript

```typescript
interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = useMemo(() => ({
    user,
    theme,
    setUser,
    toggleTheme
  }), [user, theme, toggleTheme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

## Anti-Patterns

### ❌ Avoid: Any types
```typescript
// Bad
const MyComponent: React.FC<any> = ({ props }) => { ... }

// Good
interface MyComponentProps {
  title: string;
  onAction: (id: string) => void;
}
const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => { ... }
```

### ❌ Avoid: Inline object creation in JSX
```typescript
// Bad - creates new object on every render
<MyComponent config={{ theme: 'dark' }} />

// Good - memoized or static
const config = { theme: 'dark' };
<MyComponent config={config} />
```

## Best Practices

1. **Always define prop interfaces** - Provides type safety and documentation
2. **Use useCallback for functions** - Prevents unnecessary re-renders
3. **Memoize expensive computations** - Use useMemo for derived data
4. **Extract custom hooks** - Reusable stateful logic
5. **Prefer composition over inheritance** - Use children prop and render props

## Related ADRs
- ADR-001: TypeScript Configuration Standards
- ADR-015: Component Architecture Decisions

## Last Updated
2025-09-07