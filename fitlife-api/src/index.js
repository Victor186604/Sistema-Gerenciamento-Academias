import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FitLife API — porta ${PORT} — modo ${process.env.NODE_ENV || 'development'}`);
});
