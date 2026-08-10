"use strict";

/* =========================================
   اسم وإصدار التخزين
========================================= */

const CACHE_NAME = "mosque-clock-v2";


/* =========================================
   الملفات الأساسية للعمل دون إنترنت
========================================= */

const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./css/style.css",

    "./js/app.js",

    "./manifest.json",

    "./assets/icon-192.png",

    "./assets/icon-512.png"

];


/* =========================================
   تثبيت Service Worker
========================================= */

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    function (cache) {

                        return cache.addAll(
                            FILES_TO_CACHE
                        );

                    }
                )

        );

        /*
            تفعيل النسخة الجديدة مباشرة
            بدون انتظار إغلاق التطبيق.
        */

        self.skipWaiting();

    }
);


/* =========================================
   تفعيل Service Worker
========================================= */

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function (cacheNames) {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    function (cacheName) {

                                        /*
                                            حذف أي Cache قديم.
                                        */

                                        return cacheName !== CACHE_NAME;

                                    }
                                )
                                .map(
                                    function (cacheName) {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }
                                )

                        );

                    }
                )
                .then(
                    function () {

                        /*
                            جعل النسخة الجديدة تتحكم
                            في الصفحات المفتوحة مباشرة.
                        */

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================
   التعامل مع الطلبات
========================================= */

self.addEventListener(
    "fetch",
    function (event) {

        /*
            نتعامل فقط مع GET requests.
        */

        if (event.request.method !== "GET") {

            return;

        }


        /*
            طلبات التنقل مثل index.html
            نستخدم Network First.

            هذا يساعد على الحصول على
            آخر نسخة من الصفحة.
        */

        if (event.request.mode === "navigate") {

            event.respondWith(

                fetch(event.request)

                    .then(
                        function (networkResponse) {

                            /*
                                حفظ النسخة الجديدة.
                            */

                            const responseCopy =
                                networkResponse.clone();


                            caches
                                .open(CACHE_NAME)
                                .then(
                                    function (cache) {

                                        cache.put(
                                            "./index.html",
                                            responseCopy
                                        );

                                    }
                                );


                            return networkResponse;

                        }
                    )

                    .catch(
                        function () {

                            /*
                                إذا لم يوجد إنترنت
                                نستخدم النسخة المحفوظة.
                            */

                            return caches.match(
                                "./index.html"
                            );

                        }
                    )

            );

            return;

        }


        /*
            باقي الملفات:
            CSS
            JavaScript
            Manifest
            Images

            نحاول الإنترنت أولاً للحصول
            على أحدث نسخة.
        */

        event.respondWith(

            fetch(event.request)

                .then(
                    function (networkResponse) {

                        /*
                            لا نحفظ Response غير صالح.
                        */

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200
                        ) {

                            return networkResponse;

                        }


                        /*
                            نسخ Response لأن Response
                            لا يمكن استخدامه مرتين.
                        */

                        const responseCopy =
                            networkResponse.clone();


                        /*
                            تحديث Cache بالنسخة الجديدة.
                        */

                        caches
                            .open(CACHE_NAME)
                            .then(
                                function (cache) {

                                    cache.put(
                                        event.request,
                                        responseCopy
                                    );

                                }
                            );


                        /*
                            عرض النسخة الجديدة.
                        */

                        return networkResponse;

                    }
                )

                .catch(
                    function () {

                        /*
                            إذا لم يوجد إنترنت
                            نستخدم النسخة المحفوظة.
                        */

                        return caches.match(
                            event.request
                        );

                    }
                )

        );

    }
);