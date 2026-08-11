"use strict";

const SESSION_COOKIE_NAME =
    "mosque_admin_session";

const KV_KEY =
    "mosque_settings";


export async function onRequestGet(context) {

    try {

        if (!context.env.MOSQUE_DATA) {

            return jsonResponse(
                {
                    success: false,
                    message: "Shared storage is not configured."
                },
                500
            );

        }


        const savedSettings =
            await context.env.MOSQUE_DATA.get(
                KV_KEY,
                {
                    type: "json"
                }
            );


        return jsonResponse(
            {
                success: true,
                settings:
                    savedSettings || null
            },
            200
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK settings read error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                message: "Failed to load shared settings."
            },
            500
        );

    }

}


export async function onRequestPost(context) {

    try {

        const sessionSecret =
            context.env.SESSION_SECRET;


        if (!sessionSecret) {

            return jsonResponse(
                {
                    success: false,
                    message: "Session configuration is incomplete."
                },
                500
            );

        }


        if (!context.env.MOSQUE_DATA) {

            return jsonResponse(
                {
                    success: false,
                    message: "Shared storage is not configured."
                },
                500
            );

        }


        const cookieHeader =
            context.request.headers.get(
                "Cookie"
            ) || "";


        const sessionToken =
            getCookieValue(
                cookieHeader,
                SESSION_COOKIE_NAME
            );


        if (!sessionToken) {

            return jsonResponse(
                {
                    success: false,
                    message: "Unauthorized."
                },
                401
            );

        }


        const session =
            await verifySignedSession(
                sessionToken,
                sessionSecret
            );


        if (
            !session ||
            session.role !== "admin"
        ) {

            return jsonResponse(
                {
                    success: false,
                    message: "Unauthorized."
                },
                403
            );

        }


        const body =
            await context.request.json();


        if (
            !body ||
            typeof body !== "object"
        ) {

            return jsonResponse(
                {
                    success: false,
                    message: "Invalid request."
                },
                400
            );

        }


        await context.env.MOSQUE_DATA.put(
            KV_KEY,
            JSON.stringify(body)
        );


        return jsonResponse(
            {
                success: true
            },
            200
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK settings save error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                message: "Failed to save shared settings."
            },
            500
        );

    }

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


    if (
        Date.now() >= payload.exp
    ) {

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

    if (
        valueA.length !== valueB.length
    ) {

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


    for (
        const cookie of cookies
    ) {

        const separatorIndex =
            cookie.indexOf("=");


        if (
            separatorIndex === -1
        ) {

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


        if (
            name === cookieName
        ) {

            return value;

        }

    }


    return null;

}


function base64UrlEncode(
    bytes
) {

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


function base64UrlDecode(
    value
) {

    let base64 =
        value
            .replace(/-/g, "+")
            .replace(/_/g, "/");


    while (
        base64.length % 4 !== 0
    ) {

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
        .decode(
            bytes
        );

}


function jsonResponse(
    data,
    status
) {

    return new Response(
        JSON.stringify(
            data
        ),
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