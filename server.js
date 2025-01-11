const PORT = process.env.PORT || 4000;
// ...existing code...

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
