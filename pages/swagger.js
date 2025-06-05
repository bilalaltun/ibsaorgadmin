// pages/swagger.js

export default function SwaggerPage() {
  return (
    <iframe
      src="/swagger-ui.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
    />
  );
}
