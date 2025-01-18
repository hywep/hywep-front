import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {jwtVerify} from "jose"; // Install with: npm install jose
import {SettingForm} from "@/components/forms/settingForm";
import {getUserById} from "@/data/services/auth-service";

export default async function SettingPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) {
        redirect("/signin");
    }

    try {
        const {payload} = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        const userId = payload.id as string;

        if (!userId) {
            redirect("/signin");
        }

        const result = await getUserById(Number(userId));

        if (!result.success || !result.user) {
            redirect("/signin");
        }
        
        return <SettingForm user={result.user}/>;
    } catch (error) {
        console.error("Error verifying token:", error);
        redirect("/signin");
    }
}

