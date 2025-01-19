"use client";

import React, {useActionState, useState} from "react";
import {useRouter} from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {sortedColleges} from "@/lib/utils";
import {registerUserAction} from "@/data/actions/auth-actions";
import {ZodErrors} from "@/components/custom/ZodErrors";

const INITIAL_STATE = {
    data: null,
    zodErrors: null,
    message: null,
};

export function RegisterForm() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [formState, formAction] = useActionState(registerUserAction, INITIAL_STATE);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    React.useEffect(() => {
        if (formState?.data === "ok") {
            router.push("/completion");
        }
    }, [formState, router]);

    const filteredColleges = Object.entries(sortedColleges).reduce(
        (acc, [college, majors]) => {
            const filteredMajors = majors.filter((major) =>
                major.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredMajors.length > 0) {
                acc[college] = filteredMajors;
            }
            return acc;
        },
        {} as Record<string, string[]>
    );

    const handleLogin = () => {
        router.push("/signin");
    };

    const handleToggleMajor = (major: string) => {
        setSelectedMajors((prev) =>
            prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major]
        );
    };

    const handleSelectGrade = (grade: string) => {
        setSelectedGrade(grade);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags((prev) => [...prev, tagInput.trim()]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (keyword: string) => {
        setTags((prev) => prev.filter((k) => k !== keyword));
    };

    const grades = ["1학년", "2학년", "3학년", "4학년"];

    const getDisplayText = () => {
        if (selectedMajors.length === 0) {
            return "선택";
        }
        if (selectedMajors.length <= 2) {
            return selectedMajors.join(", ");
        }
        return `${selectedMajors.slice(0, 2).join(", ")} 외 ${selectedMajors.length - 2}개`;
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <header className="w-full bg-black text-white p-4 flex justify-start items-center">
                <Button
                    onClick={handleLogin}
                    className="bg-white hover:bg-gray-200 text-black px-4 py-2 ml-auto"
                >
                    로그인
                </Button>
            </header>
            <div className="w-full max-w-md mx-auto">
                <form action={formAction}>
                    <Card>
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-3xl font-bold">하이웹 알림 등록</CardTitle>
                            <CardDescription>
                                실시간으로 추가되는 현장실습 공고를 이메일로 보내드립니다
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">닉네임</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="닉네임"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.name ?? []}/>
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="hanyang@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.email ?? []}/>
                            {formState?.message === "이미 존재하는 이메일입니다." && (
                                <Alert className="mt-4" variant="destructive">
                                    <AlertTitle>중복된 이메일</AlertTitle>
                                    <AlertDescription>
                                        입력하신 이메일은 이미 등록되어 있습니다. 다른 이메일을 입력해주세요.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="4자리 이상"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>학과 (복수선택 가능)</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 truncate">
                                            {getDisplayText()}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64 max-h-96 overflow-auto">
                                        <div className="p-2">
                                            <Input
                                                type="text"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        {Object.entries(filteredColleges).map(([college, majors]) => (
                                            <DropdownMenuGroup key={college}>
                                                <DropdownMenuLabel className="font-bold">{college}</DropdownMenuLabel>
                                                {majors.map((major) => (
                                                    <DropdownMenuItem
                                                        key={major}
                                                        onClick={() => handleToggleMajor(major)}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMajors.includes(major)}
                                                                readOnly
                                                                className="form-checkbox h-4 w-4"
                                                            />
                                                            <span>{major}</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <input
                                    type="hidden"
                                    name="majors"
                                    value={JSON.stringify(selectedMajors)}
                                />
                                <ZodErrors error={formState?.zodErrors?.fieldErrors.majors ?? []}/>
                            </div>
                            <div className="space-y-2">
                                <Label>학년</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100">
                                            {selectedGrade || "선택"}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        {grades.map((grade) => (
                                            <DropdownMenuItem
                                                key={grade}
                                                onClick={() => handleSelectGrade(grade)}
                                            >
                                                {grade}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <input
                                    type="hidden"
                                    name="grade"
                                    value={selectedGrade ? Number(selectedGrade[0]) : 1}
                                />
                                <ZodErrors error={formState?.zodErrors?.fieldErrors.grade ?? []}/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="tags" className="inline-block">
                                        희망 키워드
                                    </Label>
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            className="w-5 h-5 bg-gray-300 text-black font-bold rounded-full flex items-center justify-center hover:bg-gray-400"
                                        >
                                            ?
                                        </button>
                                        <div
                                            className="absolute top-0 left-6 transform -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                            공고에 포함되길 원하는 키워드를 추가해주세요.<br/>
                                            예: 삼성, VC, 백엔드, 기획자
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="text"
                                        placeholder="키워드 입력"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddTag}>
                                        추가
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center space-x-2 px-2 py-1 bg-gray-200 rounded"
                                        >
                                            <span className="text-sm">{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-red-500 hover:text-red-700 text-xs flex items-center justify-center h-4 w-4 rounded-full bg-gray-300"
                                                aria-label={`Remove ${tag}`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="hidden"
                                    name="tags"
                                    value={JSON.stringify(tags)}
                                />
                                <ZodErrors error={formState?.zodErrors?.fieldErrors.tags ?? []}/>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button type="submit">등록</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    );
}
