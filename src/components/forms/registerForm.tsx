"use client";

import React, { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Card, CardTitle, CardDescription, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { sortedColleges } from "@/lib/utils";
import { registerUserAction } from "@/data/actions/auth-actions";
import { ZodErrors } from "@/components/custom/ZodErrors";

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

    console.log(formState, "client");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

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

    const handleToggleMajor = (major: string) => {
        setSelectedMajors((prev) =>
            prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major]
        );
    };

    const handleSelectGrade = (grade: string) => {
        setSelectedGrade(grade);
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
            <form action={formAction}>
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold">한양대학교 현장실습 알림 등록</CardTitle>
                        <CardDescription>
                            실시간 최신 공고를 이메일로 보내드립니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="이름"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <ZodErrors error={formState?.zodErrors?.fieldErrors.name ?? []} />
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
                        <ZodErrors error={formState?.zodErrors?.fieldErrors.email ?? []} />
                        {formState?.message === "이미 존재하는 이메일입니다." && (
                            <Alert className="mt-4" variant="destructive">
                                <AlertTitle>중복된 이메일</AlertTitle>
                                <AlertDescription>
                                    입력하신 이메일은 이미 등록되어 있습니다. 다른 이메일을 입력해주세요.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label>학과</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 truncate">
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
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.majors ?? []} />
                        </div>
                        <div className="space-y-2">
                            <Label>학년</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100">
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
                                value={selectedGrade ? parseInt(selectedGrade[0]).toString() : ""}
                            />
                            <ZodErrors error={formState?.zodErrors?.fieldErrors.grade ?? []} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <Button type="submit">등록</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
