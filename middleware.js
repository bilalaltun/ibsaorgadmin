import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api", "/swagger"]; // Public paths like /login and /api should not be blocked

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Check if the path is public or should be excluded from authentication
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next(); // Skip authentication check for public paths
  }

  // Function to extract role from the token (assuming the role is stored in the token)
  const getUserRole = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decoding JWT token
      return payload.role || null; // Assuming role is in the token
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAllowedPathForRole = (role) => {
    // If role is null or a regular user, allow access only to `/blog` and `/events`
    if (role === null || role !== "superadmin") {
      return pathname.startsWith("/blog") || pathname.startsWith("/events");
    }
    // Superadmin can access all paths
    return true;
  };

  // If no token and the path is not public, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the token is present but the role does not allow access to the requested path, redirect to a 403 page or login
  if (token && !isAllowedPathForRole(userRole)) {
    const loginUrl = new URL("/events", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
