# FlowList Todo Management System

A role-based Todo Management System built on Next.js App Router, MongoDB Atlas, and Mongoose. This is the upgraded V2 app, not the original public single-user todo demo.

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

2. Create `.env` in the project root:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/todo-app?appName=flowlist
MONGODB_DB_NAME=todo-app
JWT_SECRET=replace-with-a-long-random-secret
```

Replace `USERNAME` and `PASSWORD` with your Atlas database user credentials.

If your password contains special characters like `@`, `:`, `/`, or `?`, URL-encode them first.

3. Seed the first admin account:

```bash
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="Admin12345!"
npm run seed:admin
```

4. Start the development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

The app now redirects unauthenticated visitors to `/login`.

## MongoDB setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your current public IP address in Atlas Network Access.
4. Copy the SRV connection string from Atlas.
5. Replace the placeholder credentials in `.env`.
6. Set `MONGODB_DB_NAME=todo-app`.
7. Set a real `JWT_SECRET`.

## Atlas troubleshooting

This project now supports Atlas SRV connections on machines where Node's default DNS resolver fails. The app resolves SRV/TXT records itself before connecting Mongoose.

Run this to verify the connection:

```bash
npm run check:db
```

Interpret the result correctly:

- `querySrv ECONNREFUSED`: the standalone script is still using a broken DNS path, or your environment is blocking the configured public resolvers.
- `IP that isn't whitelisted`: Atlas is blocking your network path. Add your current public IP in Atlas `Network Access`.
- Authentication errors: your database username/password is wrong, or the password was not URL-encoded.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run check:db
npm run seed:admin
```

## Features included

- JWT authentication with HTTP-only cookies
- No public registration flow
- Admin and user roles
- Admin dashboard with user management
- Personal todos scoped to the owner
- Global todos visible to all authenticated users
- Role-based todo permissions
- Protected pages with login redirect
- Responsive dashboard layout
- Dark and light mode toggle

## Important note

This project will not run correctly until `MONGODB_URI` and `JWT_SECRET` are set. That is intentional, because shipping auth without secrets would be idiotic.

## Verification

- `npm install`
- `npm run seed:admin`
- `npm run check:db`
- `npm run build`

The production build completes successfully on the verified stack above.
