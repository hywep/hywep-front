import {NextConfig} from "next";

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/signin",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
