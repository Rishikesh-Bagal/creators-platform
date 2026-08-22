# Viva Implementation Guide

This guide details exactly where and how each required concept is implemented in the project, providing a clear reference for the viva demonstration.

| Topic | File | Exact Function/Code | What It Demonstrates |
| :--- | :--- | :--- | :--- |
| **Async/Await** | `client/src/pages/Dashboard.jsx` | `fetchPosts()` | API request using async/await and try/catch/finally. |
| **Promises vs Callbacks** | `server/routes/upload.js` | `uploadToCloudinary()` | Converts the callback-based `cloudinary.uploader.upload_stream` API to a modern Promise. |
| **JWT Authentication** | `server/middleware/auth.js` | `jwt.verify()` | Server-side synchronous token verification, token decoding, and invalidation handling (401). |
| **SQL JOIN / PostgreSQL** | `server/controllers/sqlController.js` | `getPostsWithAuthors()` | A relational SQL query `SELECT ... JOIN` combining data from the PostgreSQL `users` and `posts` tables. |
| **Closures** | `client/src/pages/CreatePost.jsx` | `createAutosaver()` / `saveDraft()` | A factory function where the returned inner function retains lexical access to `lastSavedTime` and `saveCount`. |
| **Event Loop** | `client/src/pages/Dashboard.jsx` | `fetchPosts()` | `console.log` trace demonstrating Call Stack (sync), Web APIs (await), and Microtask Queue (promise continuation). |
| **Hoisting** | `server/utils/textFormatter.js` | `capitalizeTitle()` declaration | Demonstrates safe function declaration hoisting vs Temporal Dead Zone errors for `let` and `const`. |
| **Environment Variables** | `server/verify-upload.js` | `process.env.TEST_TOKEN` | Securely reads the `TEST_TOKEN` from the environment instead of hard-coding the sensitive data. |

## How to Verify
1. **Async/Await**: View the `fetchPosts()` function in `Dashboard.jsx`.
2. **Promises**: Open `upload.js` to see the explicit Promise wrapper implementation.
3. **JWT**: Check the `auth.js` middleware comments.
4. **SQL JOIN**: Run `node server/scripts/seed-pg.js` to create tables and seed data, then test the endpoint `GET /api/sql/posts`.
5. **Closures**: Observe the `createAutosaver` factory function in `CreatePost.jsx` and its usage in the `useEffect` hook.
6. **Event Loop**: Open the frontend console in `Dashboard.jsx` to view the labeled execution logs A, B, C, D in order.
7. **Hoisting**: Review the `textFormatter.js` explicit hoisting examples and try uncommenting the `let` example to see the ReferenceError.
8. **Environment Variables**: View `verify-upload.js` and `.env.example`.
