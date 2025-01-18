import {headers} from "next/headers";

export default async function CompletionPage() {
    const headersList = await headers();
    const referer = headersList.get("referer");

    const from = referer?.includes("/setting")
        ? "setting"
        : referer?.includes("/register")
            ? "register"
            : null;

    const getDynamicHeadingText = () => {
        switch (from) {
            case "setting":
                return "설정 완료";
            case "register":
                return "하이웹 알림 등록이 완료되었습니다";
            default:
                return "완료";
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-10 text-center">
            <h1 className="text-2xl font-bold">{getDynamicHeadingText()}</h1>
            <a
                href="/setting"
                className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                설정 페이지로 이동
            </a>
        </div>
    );
}
