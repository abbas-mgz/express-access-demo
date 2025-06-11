const express = require('express');
const expressAccess = require('express-access');

const app = express();
app.use(express.json());

// Patch the app with express-access
expressAccess(app);

// Configure access control
app.access.config({
  authMiddleware: (req, res, next) => {
    // Read role from header, default to 'reader'
    const role = req.header('x-user-role') || 'reader';
    // Define permissions for each role
    const rolePermissions = {
      reader: ['post:read'],
      editor: ['post:read', 'post:create', 'post:update'],
      admin: ['post:read', 'post:create', 'post:update', 'post:delete']
    };
    req.user = { role, permissions: rolePermissions[role] || [] };
    next();
  },
  checkPermission: async (user, permission) => {
    return user && user.permissions && user.permissions.includes(permission);
  }
});

// Public route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Protected routes
app.access.get('/posts', 'post:read', (req, res) => {
  res.json({ message: 'List of posts' });
});

app.access.post('/posts', 'post:create', (req, res) => {
  res.json({ message: 'Post created' });
});

app.access.delete('/posts/:id', 'post:delete', (req, res) => {
  res.json({ message: `Post ${req.params.id} deleted` });
});

app.listen(3000, () => console.log('Server running on port 3000'));