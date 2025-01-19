"use client";

import React, {useActionState, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {sortedColleges} from "@/lib/utils";
import {UserProp} from "@/data/services/auth-service";
import {updateUserAction} from "@/data/actions/auth-actions";
import {useRouter} from "next/navigation";
import {ZodErrors} from "@/components/custom/ZodErrors";
import {Checkbox} from "@/components/ui/checkbox";

const grades = ["1학년", "2학년", "3학년", "4학년"];

const INITIAL_STATE = {
    data: null,
    zodErrors: null,
    message: null,
};

export function SettingForm({user}: UserProp) {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [formState, formAction] = useActionState(updateUserAction, INITIAL_STATE);

    React.useEffect(() => {
        if (formState?.data === "ok") {
            if (formState?.data === "ok") {
                router.push("/completion");
            }
        }
    }, [formState, router]);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [selectedMajors, setSelectedMajors] = useState<string[]>(user?.majors || []);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(grades[user?.grade - 1] || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isActive, setIsActive] = useState<boolean>(user?.isActive ?? true);
    const [tags, setTags] = useState<string[]>(user?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    const handleLogout = async () => {
        await fetch("/api/logout", {method: "POST"});
        router.push("/signin");
    };

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim();

        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags((prevTags) => {
                return [...prevTags, trimmedTag];
            });
        }

        setTagInput("");
    };


    const handleRemoveTag = (tag: string) => {
        setTags((prevTags) => prevTags.filter((t) => t !== tag));
    };

    const handleToggleMajor = (major: string) => {
        setSelectedMajors((prev) =>
            prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major]
        );
    };

    const handleSelectGrade = (grade: string) => {
        setSelectedGrade(grade);
    };

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
                    onClick={handleLogout}
                    className="bg-white hover:bg-red-600 text-black px-4 py-2 ml-auto"
                >
                    로그아웃
                </Button>
            </header>

            <main className="w-full max-w-md mx-auto">
                <form action={formAction}>
                    <input type="hidden" name="id" value={user.id}/>
                    <input type="hidden" name="majors" value={JSON.stringify(selectedMajors)}/>
                    <input type="hidden" name="grade" value={selectedGrade ? Number(selectedGrade[0]) : 1}/>
                    <input type="hidden" name="isActive" value={String(isActive)}/>
                    <input type="hidden" name="tags" value={JSON.stringify(tags)}/>
                    <Card>
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-3xl font-bold">프로필 설정</CardTitle>
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

                            <div className="space-y-2">
                                <Label htmlFor="password">새로운 비밀번호</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="4자리 이상"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.password ?? []}/>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">비밀번호 재입력</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="4자리 이상"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.confirmPassword ?? []}/>


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
                                                placeholder="학과 검색"
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
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.majors ?? []}/>
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
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.grade ?? []}/>

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
                                <ZodErrors error={formState?.zodErrors?.fieldErrors.tags ?? []}/>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="isActive">알림 수신</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        name="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) => {
                                            setIsActive(!!checked);
                                        }}
                                    />
                                    <Label htmlFor="isActive"></Label>
                                </div>
                            </div>
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.isActive ?? []}/>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button type="submit">
                                수정
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
}
