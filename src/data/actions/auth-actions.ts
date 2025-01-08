"use server";
import { z } from "zod";
import {
    DynamoDBClient,
    PutItemCommand,
    QueryCommand,
    ConditionalCheckFailedException,
} from "@aws-sdk/client-dynamodb";

const schemaRegister = z.object({
    name: z
        .string()
        .min(1, { message: "사용자 이름은 최소 1자 이상이어야 합니다." })
        .max(20, { message: "사용자 이름은 최대 20자 이하여야 합니다." }),
    email: z
        .string()
        .email({ message: "올바른 이메일 주소를 입력해주세요." }),
    majors: z
        .array(z.string())
        .min(1, { message: "최소 하나의 학과를 선택해야 합니다." }),
    grade: z.string().min(1, { message: "학년은 필수 입력 항목입니다." }),
});

const dynamoDBClient = new DynamoDBClient({region: "ap-northeast-2"});

const TABLE_NAME = "hywep-users-prod";
const EMAIL_INDEX_NAME = "email-index";

export async function registerUserAction(prevState: never, formData: FormData) {

    const validatedFields = schemaRegister.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        majors: formData.get("majors") ? JSON.parse(formData.get("majors") as string) : [],
        grade: formData.get("grade"),
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten());
        return {
            prevState,
            zodErrors: validatedFields.error.flatten(),
            message: "유효성 검사 실패",
        };
    }

    console.log("성공");

    const { name, email, majors, grade } = validatedFields.data;

    try {
        const emailCheckResponse = await dynamoDBClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: EMAIL_INDEX_NAME,
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": { S: email },
                },
            })
        );

        if (emailCheckResponse.Count && emailCheckResponse.Count > 0) {
            console.error("Email already exists:", email);
            return {
                prevState,
                message: "이미 존재하는 이메일입니다.",
            };
        }

        const id = `${(new Date().getTime()-Math.floor(Math.random() * 1000))}`;

        const dynamoDBResponse = await dynamoDBClient.send(
            new PutItemCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: { N: id },
                    name: { S: name },
                    email: { S: email },
                    majors: {
                        L: majors.map((major: string) => ({ S: major })),
                    },
                    grade: { N: grade },
                },
            })
        );

        console.log("DynamoDB Response:", dynamoDBResponse);
    } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
            console.error("DynamoDB Conditional Check Failed:", error);
            return {
                prevState,
                message: "DynamoDB 조건 검사 실패: 이미 존재하는 데이터입니다.",
            };
        }

        console.error("DynamoDB Error:", error);
        return {
            prevState,
            message: "DynamoDB 저장 중 오류가 발생했습니다.",
        };
    }

    return {
        prevState,
        data: "ok",
        message: "성공적으로 등록되었습니다.",
    };
}
