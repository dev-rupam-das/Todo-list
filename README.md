# FlowList Todo Dashboard

A full-stack Todo List application built with Next.js App Router, JavaScript only, MongoDB, and Mongoose.

## Tech stack

- Next.js `16.2.6`
- React `19.2.6`
- Mongoose `9.6.3`
- JavaScript only (`.js` and `.jsx`)
- CSS Modules + global CSS

## Project structure

```text
app/
  api/todos/
    [id]/route.js
    route.js
  todos/
    page.js
    page.module.css
  error.js
  globals.css
  layout.js
  loading.js
  page.js
  page.module.css
components/
  ConfirmDialog.jsx
  EmptyState.jsx
  SkeletonList.jsx
  ThemeToggle.jsx
  ToastStack.jsx
  TodoFilters.jsx
  TodoForm.jsx
  TodoItem.jsx
  TodoList.jsx
  TodoShell.jsx
models/
  Todo.js
lib/
  mongodb.js
  todo-service.js
public/
```

## File placement

- Put route UI files inside `app/`.
- Put reusable UI pieces inside `components/`.
- Put the Mongoose model inside `models/Todo.js`.
- Put the MongoDB connection utility inside `lib/mongodb.js`.
- Put server-side dashboard helpers inside `lib/todo-service.js`.
- Put all Todo API endpoints inside `app/api/todos/`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root:

```env
MONGODB_URI=
```

3. Start the development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## MongoDB setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your current IP address in Atlas Network Access.
4. Copy the connection string from Atlas.
5. Replace the placeholder credentials in `.env.local`.
6. Keep the database name in the URI, for example `todo-app`.

## Available scripts

```bash
npm run dev
npm run build
npm run start
```

## Features included

- Create, read, update, and delete todos
- Mark todos as completed
- Filter by all, active, or completed
- Search by title or description
- Show creation date
- Delete confirmation modal
- Empty state UI
- Toast notifications
- Skeleton loaders
- Responsive dashboard layout
- Dark and light mode toggle

## Important note

This project will not run until `MONGODB_URI` is set correctly in `.env.local`. That is intentional, because pretending the database is optional would be sloppy.

## Verification

- `npm install`
- `npm run build`

The production build completes successfully on the verified stack above.
