import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6", // light gray
  },
  content: {
    textAlign: "center",
  },
  heading: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  subText: {
    fontSize: "1.25rem",
    color: "#4b5563", // gray-600
    marginBottom: "1rem",
  },
  link: {
    color: "#3b82f6", // blue-500
    textDecoration: "underline",
    cursor: "pointer",
  },
  linkHover: {
    color: "#1d4ed8", // blue-700
  },
};

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>404</h1>
        <p style={styles.subText}>Oops! Page not found</p>
        <a
          href="/"
          style={styles.link}
          onMouseOver={(e) => (e.currentTarget.style.color = styles.linkHover.color as string)}
          onMouseOut={(e) => (e.currentTarget.style.color = styles.link.color as string)}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
