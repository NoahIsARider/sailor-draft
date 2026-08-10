# projects

This is a full-stack application built with [Next.js 16](https://nextjs.org) + [shadcn/ui](https://ui.shadcn.com). Its default workflow has been switched to the standard Next.js workflow, so it can be connected to GitHub and deployed to Vercel as a showcase site.

## Quick Start

### Start the Development Server

```bash
pnpm dev
```

After startup, open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

The development server supports hot reload — pages refresh automatically when you modify code.

### Build for Production

```bash
pnpm build
```

### Start the Production Server

```bash
pnpm start
```

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the GitHub repository in Vercel
3. Keep the default Next.js settings and the build and deployment will complete

No custom Vercel build command is required; the default `pnpm build` works fine.

### Retained Coze Workflows

If you still need the original scripts in the Coze environment, you can continue to use:

```bash
pnpm dev:coze
pnpm build:coze
pnpm start:coze
```

## Project Structure

```
src/
├── app/                      # Next.js App Router directory
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles (includes shadcn theme variables)
│   └── [route]/             # Other route pages
├── components/              # React components directory
│   └── ui/                  # shadcn/ui base components (preferred)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                     # Utility functions library
│   └── utils.ts            # Utility functions such as cn()
├── hooks/                   # Custom React Hooks (optional)
└── server.ts                # Retained custom server entry (for the Coze workflow)
```

## Core Development Guidelines

### 1. Component Development

**Prefer shadcn/ui base components**

This project ships with a complete shadcn/ui component library in the `src/components/ui/` directory. You should prefer these components as the foundation during development:

```tsx
// ✅ Recommended: use shadcn base components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>标题</CardHeader>
      <CardContent>
        <Input placeholder="输入内容" />
        <Button>提交</Button>
      </CardContent>
    </Card>
  );
}
```

**Available shadcn Components**

- Forms: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- Layout: `card`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`
- Feedback: `alert`, `alert-dialog`, `dialog`, `toast`, `sonner`, `progress`
- Navigation: `dropdown-menu`, `menubar`, `navigation-menu`, `context-menu`
- Data display: `table`, `avatar`, `badge`, `hover-card`, `tooltip`, `popover`
- Other: `calendar`, `command`, `carousel`, `resizable`, `sidebar`

See the component implementations under `src/components/ui/` for details.

### 2. Routing Development

Next.js uses file-system routing; create a folder under `src/app/` to add a route:

```bash
# Create a new route /about
src/app/about/page.tsx

# Create a dynamic route /posts/[id]
src/app/posts/[id]/page.tsx

# Create a route group (does not affect the URL)
src/app/(marketing)/about/page.tsx

# Create an API route
src/app/api/users/route.ts
```

**Page Component Example**

```tsx
// src/app/about/page.tsx
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '关于我们',
  description: '关于页面描述',
};

export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <Button>了解更多</Button>
    </div>
  );
}
```

**Dynamic Route Example**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>文章 ID: {id}</div>;
}
```

**API Route Example**

```tsx
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### 3. Dependency Management

**pnpm must be used for dependency management**

```bash
# ✅ Install dependencies
pnpm install

# ✅ Add a new dependency
pnpm add package-name

# ✅ Add a development dependency
pnpm add -D package-name

# ❌ Do not use npm or yarn
# npm install  # Wrong!
# yarn add     # Wrong!
```

The project has a `preinstall` script configured; using other package managers will result in an error.

### 4. Styling Development

**Using Tailwind CSS v4**

This project uses Tailwind CSS v4 for styling and comes with shadcn theme variables configured.

```tsx
// Using Tailwind classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  <Button className="bg-primary text-primary-foreground">
    主要按钮
  </Button>
</div>

// Merge class names with the cn() utility
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}>
  内容
</div>
```

**Theme Variables**

Theme variables are defined in `src/app/globals.css` and support light/dark mode:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

### 5. Form Development

We recommend `react-hook-form` + `zod` for form development:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱'),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('username')} />
      <Input {...form.register('email')} />
      <Button type="submit">提交</Button>
    </form>
  );
}
```

### 6. Data Fetching

**Server Components (Recommended)**

```tsx
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // or 'force-cache'
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**Client Components**

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

## Common Development Scenarios

### Adding a New Page

1. Create a folder and `page.tsx` under `src/app/`
2. Build the UI with shadcn components
3. Add `layout.tsx` and `loading.tsx` as needed

### Creating Business Components

1. Create the component file under `src/components/` (non-UI components)
2. Prefer composing from the base components in `src/components/ui/`
3. Define prop types with TypeScript

### Adding Global State

Use React Context or Zustand:

```tsx
// src/lib/store.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Integrating a Database

Use Prisma or Drizzle ORM, configured in `src/lib/db.ts`.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **UI components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Fonts**: Courier Prime
- **Package manager**: pnpm 9+
- **TypeScript**: 5.x

## References

- [Next.js Official Documentation](https://nextjs.org/docs)
- [shadcn/ui Component Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)

## Important Notes

1. **pnpm must be used** as the package manager
2. **Prefer shadcn/ui components** over building base components from scratch
3. **Follow Next.js App Router conventions** and correctly distinguish server/client components
4. **Use TypeScript** for type-safe development
5. **Use the `@/` path alias** to import modules (already configured)
