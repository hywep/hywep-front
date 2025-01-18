import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {getUserMeLoader} from "@/data/services/user-service";

export async function middleware(request: NextRequest) {
    const user = await getUserMeLoader();
    const currentPath = request.nextUrl.pathname;

    if (currentPath.startsWith("/setting") && !user.ok) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    if (user.ok && user.data) {
        if (currentPath.startsWith("/signin") || currentPath.startsWith("/register")) {
            return NextResponse.redirect(new URL("/setting", request.url));
        }
    }

    return NextResponse.next();
}
