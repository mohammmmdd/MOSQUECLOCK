"use strict";

/*
=========================================
MOSQUECLOCK - Admin Login API
Path:
/functions/api/login.js
=========================================
*/

const SESSION_COOKIE_NAME = "mosque_admin_session";

// Admin session lasts for 8 hours.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;


/*
=========================================
POST /api/login
=========================================
*/

export async function onRequestPost(context) {

    try {

        let body;

        try {

            body = await context.request.json();

        }
        catch {

            return jsonResponse(
                {
                    success: false,
                    message: "بيانات تسجيل الدخول غير صالحة."
                },
                400
            );

        }


        const username =
            String(body.username || "").trim();

        const password =
            String(body.password || "");


        /*
        =========================================
        Validate input
        =========================================
        */

        if (!username || !password) {

            return jsonResponse(
                {
                    success: false,
                    message: "يرجى إدخال اسم المستخدم وكلمة المرور."
                },
                400
            );

        }


        /*
        =========================================
        Read admin credentials from
        Cloudflare Secrets
        =========================================
        */

        const admin1Username =
            context.env.ADMIN1_USERNAME;

        const admin1Password =
            context.env.ADMIN1_PASSWORD;

        const admin2Username =
            context.env.ADMIN2_USERNAME;

        const admin2Password =
            context.env.ADMIN2_PASSWORD;

        const sessionSecret =
            context.env.SESSION_SECRET;


        /*
        =========================================
        Make sure Cloudflare Secrets exist
        =========================================
        */

        if (
            !admin1Username ||
            !admin1Password ||
            !admin2Username ||
            !admin2Password ||
            !sessionSecret
        ) {

            return jsonResponse(
                {
                    success: false,
                    message: "إعدادات تسجيل دخول الإدارة غير مكتملة."
                },
                500
            );

        }


        /*
        =========================================
        Check Admin 1
        =========================================
        */

        const isAdmin1 =
            username === admin1Username &&
            password === admin1Password;


        /*
        =========================================
        Check Admin 2
        =========================================
        */

        const isAdmin2 =
            username === admin2Username &&
            password === admin2Password;


        /*
        =========================================
        Reject invalid credentials
        =========================================
        */

        if (!isAdmin1 && !isAdmin2) {

            return jsonResponse(
                {
                    success: false,
                    message: "اسم المستخدم أو كلمة المرور غير صحيحة."
                },
                401
            );

        }


        /*
        =========================================
        Create signed admin session
        =========================================
        */

        const expiresAt =
            Date.now() +
            (SESSION_MAX_AGE_SECONDS * 1000);


        const sessionPayload = {

            username: username,

            role: "admin",

            exp: expiresAt

        };


        const sessionToken =
            await createSignedSession(
                sessionPayload,
                sessionSecret
            );


        /*
        =========================================
        Create secure HttpOnly cookie
        =========================================
        */

        const sessionCookie =
            buildSessionCookie(
                sessionToken,
                SESSION_MAX_AGE_SECONDS
            );


        /*
        =========================================
        Successful login
        =========================================
        */

        return jsonResponse(
            {
                success: true,
                role: "admin",
                username: username,
                message: "تم تسجيل الدخول بنجاح."
            },
            200,
            {
                "Set-Cookie": sessionCookie
            }
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK login error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                message: "حدث خطأ أثناء تسجيل الدخول."
            },
            500
        );

    }

}


/*
=========================================
GET /api/login
GET requests are not allowed
=========================================
*/

export function onRequestGet() {

    return jsonResponse(
        {
            success: false,
            message: "Method not allowed."
        },
        405
    );

}


/*
=========================================
Create signed session token
=========================================
*/

async function createSignedSession(
    payload,
    secret
) {

    const encoder =
        new TextEncoder();


    const payloadText =
        JSON.stringify(payload);


    const payloadBytes =
        encoder.encode(payloadText);


    const encodedPayload =
        base64UrlEncode(payloadBytes);


    const signature =
        await createHmacSignature(
            encodedPayload,
            secret
        );


    return (
        encodedPayload +
        "." +
        signature
    );

}


/*
=========================================
Create HMAC-SHA256 signature
=========================================
*/

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


/*
=========================================
Convert bytes to Base64 URL format
=========================================
*/

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


/*
=========================================
Build secure session cookie
=========================================
*/

function buildSessionCookie(
    token,
    maxAge
) {

    return [
        `${SESSION_COOKIE_NAME}=${token}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        `Max-Age=${maxAge}`
    ].join("; ");

}


/*
=========================================
JSON response helper
=========================================
*/

function jsonResponse(
    data,
    status,
    extraHeaders = {}
) {

    const headers =
        new Headers();


    headers.set(
        "Content-Type",
        "application/json; charset=UTF-8"
    );


    headers.set(
        "Cache-Control",
        "no-store"
    );


    for (
        const [name, value]
        of Object.entries(extraHeaders)
    ) {

        headers.set(
            name,
            value
        );

    }


    return new Response(
        JSON.stringify(data),
        {
            status: status,
            headers: headers
        }
    );

}