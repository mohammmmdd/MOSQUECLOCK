"use strict";

/*
=========================================
MOSQUECLOCK - Admin Login API
Path:
/functions/api/login.js
=========================================
*/


export async function onRequestPost(context) {

    try {

        /*
        =========================================
        قراءة بيانات تسجيل الدخول المرسلة
        من التطبيق
        =========================================
        */

        const body = await context.request.json();

        const username =
            String(body.username || "").trim();

        const password =
            String(body.password || "");


        /*
        =========================================
        التحقق من أن الحقول ليست فارغة
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
        بيانات المدير الأول

        لن تكون كلمات المرور داخل الكود.
        سيتم وضعها لاحقاً داخل Cloudflare Secrets.
        =========================================
        */

        const admin1Username =
            context.env.ADMIN1_USERNAME;

        const admin1Password =
            context.env.ADMIN1_PASSWORD;


        /*
        =========================================
        بيانات المدير الثاني
        =========================================
        */

        const admin2Username =
            context.env.ADMIN2_USERNAME;

        const admin2Password =
            context.env.ADMIN2_PASSWORD;


        /*
        =========================================
        التأكد من أن Secrets تم إعدادها
        =========================================
        */

        if (
            !admin1Username ||
            !admin1Password ||
            !admin2Username ||
            !admin2Password
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
        التحقق من المدير الأول
        =========================================
        */

        const isAdmin1 =
            username === admin1Username &&
            password === admin1Password;


        /*
        =========================================
        التحقق من المدير الثاني
        =========================================
        */

        const isAdmin2 =
            username === admin2Username &&
            password === admin2Password;


        /*
        =========================================
        إذا كانت البيانات غير صحيحة
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
        تسجيل الدخول نجح

        لاحقاً سنضيف Session آمنة.
        =========================================
        */

        return jsonResponse(
            {
                success: true,
                role: "admin",
                username: username,
                message: "تم تسجيل الدخول بنجاح."
            },
            200
        );

    }
    catch (error) {

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
منع GET على Login API
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
إنشاء JSON Response
=========================================
*/

function jsonResponse(data, status) {

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