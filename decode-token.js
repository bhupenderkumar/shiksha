const token = "eyJpZCI6IjUxIiwiZXhwIjoxNzQ4MzM4NjI1ODIzfQ==";
try {
  const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
  console.log("Decoded token:", decoded);
} catch (error) {
  console.error("Error decoding token:", error);
}
