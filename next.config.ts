import {NextConfig} from "next";

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: "/((?!register|completion).*)",
                destination: "/register",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
