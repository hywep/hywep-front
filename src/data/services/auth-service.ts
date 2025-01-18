import {
    AttributeValue,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {sendSlackMessage} from "@/data/services/slack-service";
import {hashPassword, verifyPassword} from "@/data/services/encrypt-service";
import {SignJWT} from "jose";

export interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    majors: string[];
    grade: number;
    created_at: string;
    isActive: boolean;
    tags: string[];
}

export interface UserProp {
    user: User;
}

export interface LoginUserProps {
    email: string;
    password: string;
}

const dynamoDBClient = new DynamoDBClient({region: "ap-northeast-2"});
const TABLE_NAME = `hywep-users-${process.env.STAGE}`;

export async function registerUserService(userData: Partial<User>) {
    const {name, password, email, majors, grade, tags} = userData;
    try {
        const emailCheckResponse = await dynamoDBClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: marshall({
                    ":email": email,
                }),
            })
        );

        if (emailCheckResponse.Count && emailCheckResponse.Count > 0) {
            return {
                success: false,
                message: "이미 존재하는 이메일입니다.",
            };
        }

        const id = `${new Date().getTime() - Math.floor(Math.random() * 1000)}`;
        const createdAt = new Date().toISOString().split("T")[0];

        const newItem = {
            id: Number(id),
            name,
            email,
            password: await hashPassword(password!),
            majors,
            tags,
            grade,
            created_at: createdAt,
            isActive: true,
        };

        await dynamoDBClient.send(
            new PutItemCommand({
                TableName: TABLE_NAME,
                Item: marshall(newItem),
            })
        );

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const token = await new SignJWT({
            id,
            name,
            email,
        })
            .setProtectedHeader({alg: "HS256"})
            .setExpirationTime("1h")
            .sign(secret);

        if (process.env.STAGE === "prod") {
            await sendSlackMessage(`${process.env.STAGE} 회원 가입:\n- 이름: ${name}\n- 이메일: ${email}\n- 학과: ${majors!.join(",")}\n- 학년: ${grade}`);
        }

        return {success: true, token, message: "로그인 성공"};
    } catch (error) {
        console.error("DynamoDB Error:", error);
        return {
            success: false,
            message: "DynamoDB 저장 중 오류가 발생했습니다.",
        };
    }
}

export async function loginUserService(userData: LoginUserProps) {
    const {email, password} = userData;

    try {
        const userQueryResponse = await dynamoDBClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: marshall({
                    ":email": email,
                }),
            })
        );

        if (!userQueryResponse.Items || userQueryResponse.Items.length === 0) {
            return {
                success: false,
                message: "사용자를 찾을 수 없습니다.",
            };
        }

        const user = unmarshall(userQueryResponse.Items[0]) as User;

        if (!await verifyPassword(password, user.password)) {
            return {
                success: false,
                message: "비밀번호가 일치하지 않습니다.",
            };
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            name: user.name,
        })
            .setProtectedHeader({alg: "HS256"})
            .setExpirationTime("1h")
            .sign(secret);

        return {
            success: true,
            message: "로그인 성공",
            token,
        };
    } catch (error) {
        console.error("DynamoDB Error during login:", error);

        return {
            success: false,
            message: "로그인 중 오류가 발생했습니다.",
        };
    }
}

export async function getUserById(id: number) {
    try {
        const response = await dynamoDBClient.send(
            new GetItemCommand({
                TableName: TABLE_NAME,
                Key: marshall({id}),
            })
        );

        if (!response.Item) {
            return {
                success: false,
                message: "사용자를 찾을 수 없습니다.",
            };
        }

        const user = unmarshall(response.Item) as User;

        return {
            success: true,
            user,
        };
    } catch (error) {
        console.error("DynamoDB Error (GetUser):", error);
        return {
            success: false,
            message: "DynamoDB에서 사용자 정보를 가져오는 중 오류가 발생했습니다.",
        };
    }
}

export async function updateUserById(id: number, updateData: Partial<User>) {
    try {
        const updateExpressionParts: string[] = [];
        const expressionAttributeValues: Record<string, AttributeValue> = {};
        const expressionAttributeNames: Record<string, string> = {};

        Object.entries(updateData).forEach(([key, value]) => {
            const placeholder = `:${key}`;
            const attributeName = `#${key}`;

            updateExpressionParts.push(`${attributeName} = ${placeholder}`);
            expressionAttributeNames[attributeName] = key;

            expressionAttributeValues[placeholder] = marshall({value}, {removeUndefinedValues: true}).value;
        });

        const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

        await dynamoDBClient.send(
            new UpdateItemCommand({
                TableName: TABLE_NAME,
                Key: marshall({id}),
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames,
            })
        );

        return {
            success: true,
            message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        };
    } catch (error) {
        console.error("DynamoDB Error (UpdateUser):", error);
        return {
            success: false,
            message: "DynamoDB에서 사용자 정보를 업데이트하는 중 오류가 발생했습니다.",
        };
    }
}

