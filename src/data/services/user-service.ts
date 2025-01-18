import {getAuthToken} from "./token-service";
import {jwtVerify} from "jose";


export async function getUserMeLoader() {
    try {
        const authToken = await getAuthToken();

        if (!authToken) return {ok: false, data: null, error: null};

        const {payload} = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET!));

        if (!payload || typeof payload !== "object") {
            return {ok: false, data: null, error: "Invalid token structure"};
        }

        return {
            ok: true,
            data: {
                id: payload.id,
                name: payload.name,
                email: payload.email,
            },
            error: null,
        };

    } catch (error) {
        console.log(error);
        return {ok: false, data: null, error: error};
    }
}


