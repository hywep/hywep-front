"use server";
import {z} from "zod";
import {loginUserService, registerUserService, updateUserById} from "@/data/services/auth-service";
import {cookies} from "next/headers";
import {hashPassword} from "@/data/services/encrypt-service";

const config = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: true,
    secure: process.env.STAGE === "prod",
    sameSite: (process.env.STAGE === "prod" ? "None" : "Lax") as "none" | "lax" | "strict",
}

const schemaRegister = z.object({
    name: z
        .string()
        .min(1, {message: "사용자 이름은 최소 1자 이상이어야 합니다."})
        .max(20, {message: "사용자 이름은 최대 20자 이하여야 합니다."}),
    email: z
        .string()
        .email({message: "올바른 이메일 주소를 입력해주세요."}),
    password: z
        .string()
        .min(1, {message: "비밀번호는 최소 4자 이상이어야 합니다."})
        .max(20, {message: "비밀번호은 최대 15자 이하여야 합니다."}),
    majors: z
        .array(z.string())
        .min(1, {message: "최소 하나의 학과를 선택해야 합니다."}),
    grade: z
        .number().min(1, {message: "학년은 필수 입력 항목입니다."}),
    tags: z
        .array(z.string())
        .optional(),
});

const schemaLogin = z.object({
    email: z
        .string()
        .email({message: "올바른 이메일 주소를 입력해주세요."}),
    password: z
        .string()
        .min(1, {message: "비밀번호는 최소 1자 이상이어야 합니다."})
});

const schemaUpdate = z.object({
    name: z
        .string()
        .min(1, {message: "사용자 이름은 최소 1자 이상이어야 합니다."})
        .max(20, {message: "사용자 이름은 최대 20자 이하여야 합니다."}),
    password: z
        .union([
            z.string().min(4, {message: "비밀번호는 최소 4자 이상이어야 합니다."}).max(15, {message: "비밀번호는 최대 15자 이하여야 합니다."}),
            z.literal(""), // Allow empty strings
        ])
        .optional(),
    confirmPassword: z
        .union([
            z.string().min(4, {message: "비밀번호는 최소 4자 이상이어야 합니다."}).max(15, {message: "비밀번호는 최대 15자 이하여야 합니다."}),
            z.literal(""),
        ])
        .optional(),
    email: z
        .string()
        .email({message: "올바른 이메일 주소를 입력해주세요."}),
    majors: z
        .array(z.string())
        .min(1, {message: "최소 하나의 학과를 선택해야 합니다."}),
    grade: z.number().min(1, {message: "학년은 필수 입력 항목입니다."}),
    isActive: z
        .boolean(),
    tags: z
        .array(z.string())
        .optional(),

}).refine((data) => {
    if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
});

export async function registerUserAction(prevState: never, formData: FormData) {

    const validatedFields = schemaRegister.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        majors: formData.get("majors") ? JSON.parse(formData.get("majors") as string) : [],
        grade: Number(formData.get("grade")),
        tags: formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [],
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten());
        return {
            prevState,
            zodErrors: validatedFields.error.flatten(),
            message: "유효성 검사 실패",
        };
    }

    const responseData = await registerUserService(validatedFields.data);

    if (!responseData.success) {
        return {
            prevState,
            message: responseData.message,
        };
    }

    (await cookies()).set("jwt", responseData.token!, config);

    return {
        prevState,
        data: "ok",
        message: "성공적으로 등록되었습니다.",
    };
}

export async function loginUserAction(prevState: never, formData: FormData) {

    const validatedFields = schemaLogin.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten());
        return {
            prevState,
            zodErrors: validatedFields.error.flatten(),
            message: "유효성 검사 실패",
        };
    }

    const responseData = await loginUserService(validatedFields.data);

    if (!responseData.success) {
        return {
            prevState,
            zodErrors: {
                formErrors: [],
                fieldErrors: {
                    email: ["이메일 혹은 비밀번호를 재입력하세요."]
                },
            },
            message: responseData.message,
        };
    }

    (await cookies()).set("jwt", responseData.token!, config);

    return {
        prevState,
        data: "ok",
        message: "성공적으로 로그인되었습니다.",
    };
}

export async function updateUserAction(prevState: never, formData: FormData) {

    const userId = Number(formData.get("id"));

    if (!userId) {
        return {
            prevState,
            message: "유저 아이디가 없습니다.",
        };
    }

    const validatedFields = schemaUpdate.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        majors: formData.get("majors") ? JSON.parse(formData.get("majors") as string) : [],
        grade: Number(formData.get("grade")!.toString()[0]),
        isActive: formData.get("isActive") === 'true',
        tags: formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [],
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten());
        return {
            prevState,
            zodErrors: validatedFields.error.flatten(),
            message: "유효성 검사 실패",
        };
    }

    const filteredData = Object.entries(validatedFields.data).reduce((acc, [key, value]) => {
        if (key !== "confirmPassword" && value !== undefined && value !== null && value !== "") {
            (acc as Record<string, any>)[key] = value;
        }
        return acc;
    }, {} as Partial<typeof validatedFields.data>);


    if (filteredData.password) {
        filteredData.password = await hashPassword(filteredData.password);
    }


    const responseData = await updateUserById(userId, filteredData);

    if (!responseData.success) {
        return {
            prevState,
            message: responseData.message,
        };
    }

    return {
        prevState,
        data: "ok",
        message: "성공적으로 등록되었습니다.",
    };
}
