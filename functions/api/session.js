"use strict";

/*
=========================================
MOSQUECLOCK - Admin Session Verification
Path:
/functions/api/session.js
=========================================
*/

const SESSION_COOKIE_NAME = "mosque_admin_session";


export async function onRequestGet(context) {

    try {

        const sessionSecret =
            context.env.SESSION_SECRET;


        if (!sessionSecret) {

            return jsonResponse(
                {
                    authenticated: false,
                    message: "إعدادات الجلسة غير مكتملة."
                },
                500
            );

        }


        const cookieHeader =
            context.request.headers.get("Cookie") || "";


        const sessionToken =
            getCookieValue(
                cookieHeader,
                SESSION_COOKIE_NAME
            );


        if (!sessionToken) {

            return jsonResponse(
                {
                    authenticated: false
                },
                401
            );

        }


        const session =
            await verifySignedSession(
                sessionToken,
                sessionSecret
            );


        if (!session) {

            return jsonResponse(
                {
                    authenticated: false
                },
                401
            );

        }


        if (session.role !== "admin") {

            return jsonResponse(
                {
                    authenticated: false
                },
                403
            );

        }


        return jsonResponse(
            {
                authenticated: true,
                role: session.role,
                username: session.username
            },
            200
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK session verification error:",
            error
        );


        return jsonResponse(
            {
                authenticated: false,
                message: "حدث خطأ أثناء التحقق من الجلسة."
            },
            500
        );

    }

}


export function onRequestPost() {

    return jsonResponse(
        {
            success: false,
            message: "Method not allowed."
        },
        405
    );

}


async function verifySignedSession(
    token,
    secret
) {

    const parts =
        token.split(".");


    if (parts.length !== 2) {

        return null;

    }


    const encodedPayload =
        parts[0];

    const receivedSignature =
        parts[1];


    if (
        !encodedPayload ||
        !receivedSignature
    ) {

        return null;

    }


    const expectedSignature =
        await createHmacSignature(
            encodedPayload,
            secret
        );


    const signaturesMatch =
        constantTimeEqual(
            receivedSignature,
            expectedSignature
        );


    if (!signaturesMatch) {

        return null;

    }


    let payload;


    try {

        const payloadText =
            base64UrlDecode(
                encodedPayload
            );


        payload =
            JSON.parse(
                payloadText
            );

    }
    catch {

        return null;

    }


    if (
        !payload ||
        typeof payload !== "object" ||
        typeof payload.username !== "string" ||
        typeof payload.role !== "string" ||
        typeof payload.exp !== "number"
    ) {

        return null;

    }


    if (Date.now() >= payload.exp) {

        return null;

    }


    return payload;

}


async function createHmacSignature(
    data,
    secret
) {

    const encoder =
        new TextEncoder();


    const key =
        await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            {
                name: "HMAC",
                hash: "SHA-256"
            },
            false,
            [
                "sign"
            ]
        );


    const signatureBuffer =
        await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(data)
        );


    return base64UrlEncode(
        new Uint8Array(
            signatureBuffer
        )
    );

}


function constantTimeEqual(
    valueA,
    valueB
) {

    if (valueA.length !== valueB.length) {

        return false;

    }


    let result = 0;


    for (
        let i = 0;
        i < valueA.length;
        i++
    ) {

        result |=
            valueA.charCodeAt(i) ^
            valueB.charCodeAt(i);

    }


    return result === 0;

}


function getCookieValue(
    cookieHeader,
    cookieName
) {

    const cookies =
        cookieHeader.split(";");


    for (const cookie of cookies) {

        const separatorIndex =
            cookie.indexOf("=");


        if (separatorIndex === -1) {

            continue;

        }


        const name =
            cookie
                .slice(
                    0,
                    separatorIndex
                )
                .trim();


        const value =
            cookie
                .slice(
                    separatorIndex + 1
                )
                .trim();


        if (name === cookieName) {

            return value;

        }

    }


    return null;

}


function base64UrlEncode(bytes) {

    let binary = "";


    for (
        let i = 0;
        i < bytes.length;
        i++
    ) {

        binary +=
            String.fromCharCode(
                bytes[i]
            );

    }


    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

}


function base64UrlDecode(value) {

    let base64 =
        value
            .replace(/-/g, "+")
            .replace(/_/g, "/");


    while (base64.length % 4 !== 0) {

        base64 += "=";

    }


    const binary =
        atob(base64);


    const bytes =
        new Uint8Array(
            binary.length
        );


    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }


    return new TextDecoder()
        .decode(bytes);

}


function jsonResponse(
    data,
    status
) {

    return new Response(
        JSON.stringify(data),
        {
            status: status,

            headers: {

                "Content-Type":
                    "application/json; charset=UTF-8",

                "Cache-Control":
                    "no-store"
            }
        }
    );

}