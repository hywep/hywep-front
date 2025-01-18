"use client";

import Link from "next/link";

import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {loginUserAction} from "@/data/actions/auth-actions";
import {Button} from "@/components/ui/button";
import React, {useActionState} from "react";
import {useRouter} from "next/navigation";
import {ZodErrors} from "@/components/custom/ZodErrors";

const INITIAL_STATE = {
    data: null,
    zodErrors: null,
    message: null,
};

export function SigninForm() {
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [formState, formAction] = useActionState(loginUserAction, INITIAL_STATE);

    React.useEffect(() => {
        console.log(formState);
        if (formState?.data === "ok") {
            router.push("/setting");
        }
    }, [formState, router]);

    return (
        <div className="w-full max-w-md">
            <form action={formAction}>
                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold">로그인</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                name="email"
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="비밀번호">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                            />
                        </div>
                        <ZodErrors error={formState?.zodErrors?.fieldErrors.email ?? []}/>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <Button type="submit">로그인</Button>
                    </CardFooter>
                </Card>
                <div className="mt-4 text-center text-sm">
                    계정이 없으신가요?
                    <Link className="underline ml-2" href="register">
                        회원가입
                    </Link>
                </div>
            </form>
        </div>
    );
}
