import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/checkout",
    "/api/orders/:path*",
    "/api/recipients/:path*",
    "/api/organization/:path*",
  ],
};
