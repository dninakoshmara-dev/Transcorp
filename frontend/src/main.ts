app.enableCors({
  origin: [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
