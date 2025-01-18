import {NextResponse} from "next/server";

export async function POST() {
    const response = NextResponse.json({success: true});

    response.cookies.set("jwt", "", {
        path: "/",
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.Stage === "production",
    });

    return response;
}
