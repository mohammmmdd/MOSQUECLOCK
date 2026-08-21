"use strict";


/* =========================================
   المواقيت الافتراضية
   ========================================= */

const defaultPrayerTimes = {

    fajr: {
        name: "الفجر",
        adhan: "04:30",
        iqama: "04:50"
    },

    dhuhr: {
        name: "الظهر",
        adhan: "12:15",
        iqama: "12:35"
    },

    asr: {
        name: "العصر",
        adhan: "15:40",
        iqama: "16:00"
    },

    maghrib: {
        name: "المغرب",
        adhan: "18:50",
        iqama: "19:00"
    },

    isha: {
        name: "العشاء",
        adhan: "20:05",
        iqama: "20:25"
    }

};


/* =========================================
   الإعدادات العامة
   ========================================= */

const defaultGeneralSettings = {

    mosqueName:
        "ساعة المسجد",

    mosqueSubtitle:
        "مواقيت الصلاة",

   dhikrItems: [
    "الحمد لله",
    "الله أكبر",
    "لا إله إلا الله"
],
    hijriOffset:
        0

};


/* =========================================
   إعدادات موقع سمائل
   ========================================= */

const defaultLocationSettings = {

    locationName:
        "سمائل - محافظة الداخلية - سلطنة عُمان",

    latitude:
        23.2969,

    longitude:
        57.9731,

    calculationMethod:
        8,

    autoPrayerTimes:
        true,

    lastUpdate:
        "",

    lastUpdateDate:
        ""

};


/* =========================================
   المتغيرات
   ========================================= */

let prayerTimes =
    loadSavedPrayerTimes();


let generalSettings =
    loadGeneralSettings();


let locationSettings =
    loadLocationSettings();


let ads =
    loadSavedAds();


let currentAdIndex =
    0;


let deferredInstallPrompt =
    null;


/* =========================================
   تشغيل التطبيق
   ========================================= */

   async function registerAppVisit() {

    try {

        let visitorId =
            localStorage.getItem(
                "mosqueVisitorId"
            );


        if (!visitorId) {

            visitorId =
                crypto.randomUUID();

            localStorage.setItem(
                "mosqueVisitorId",
                visitorId
            );

        }


        const response =
            await fetch(
                "/api/stats",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                visitorId:
                                    visitorId
                            }
                        )
                }
            );


        if (!response.ok) {

            console.error(
                "Failed to register app visit."
            );

        }

    }
    catch (error) {

        console.error(
            "Visitor statistics error:",
            error
        );

    }

} 

document.addEventListener(
    "DOMContentLoaded",
    async function () {
registerAppVisit();
await loadSharedSettings();

        applyGeneralSettings();

        applyLocationSettings();

        loadPrayerTimes();

        setupSettingsEvents();
        
        updateSettingsButtonVisibility();

        updateClock();

        updateConnectionStatus();

        checkIOSDevice();
        
document.getElementById(
    "adhkarButton"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "adhkarModal"
        ).classList.remove(
            "hidden"
        );

    }
);

document.getElementById(
    "afterPrayerAdhkarButton"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "afterPrayerAdhkarModal"
        ).classList.remove(
            "hidden"
        );

    }
);
document.getElementById(
    "closeAdhkarButton"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "adhkarModal"
        ).classList.add(
            "hidden"
        );

    }
);
document.getElementById(
    "closeAfterPrayerAdhkarButton"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "afterPrayerAdhkarModal"
        ).classList.add(
            "hidden"
        );

    }
);


        updateLastUpdateDisplay();


        setInterval(
            updateClock,
            1000
        );
setInterval(
    async function () {

        const updated =
            await loadSharedSettings();

        if (updated) {

            applyGeneralSettings();

            applyLocationSettings();

            loadPrayerTimes();

        }

    },
    10000
);


        if (
            locationSettings.autoPrayerTimes
            &&
            navigator.onLine
        ) {

            await updatePrayerTimesIfNeeded();

        }

    }
);


/* =========================================
   الإعدادات العامة
   ========================================= */

function loadGeneralSettings() {

    const saved =
        localStorage.getItem(
            "mosqueGeneralSettings"
        );


    if (!saved) {

        return {
            ...defaultGeneralSettings
        };

    }


    try {

        return {
            ...defaultGeneralSettings,
            ...JSON.parse(saved)
        };

    }
    catch (error) {

        return {
            ...defaultGeneralSettings
        };

    }

}


function saveGeneralSettings() {

    localStorage.setItem(
        "mosqueGeneralSettings",
        JSON.stringify(
            generalSettings
        )
    );

}
function applyGeneralSettings() {
setText(
    "adhkarMosqueName",
    generalSettings.mosqueName
);
    setText(
        "mosqueName",
        generalSettings.mosqueName
    );


    setText(
        "mosqueSubtitle",
        generalSettings.mosqueSubtitle
    );


    const dhikrTrack =
        document.querySelector(
            ".dhikr-reel-track"
        );


    if (
        dhikrTrack
        &&
        Array.isArray(
            generalSettings.dhikrItems
        )
    ) {

        dhikrTrack.innerHTML =
            "";


        generalSettings.dhikrItems.forEach(
            function (
                item,
                index
            ) {

                const span =
                    document.createElement(
                        "span"
                    );


                span.textContent =
                    item;


                dhikrTrack.appendChild(
                    span
                );


                if (
                    index <
                    generalSettings.dhikrItems.length - 1
                ) {

                    const separator =
                        document.createElement(
                            "span"
                        );


                    separator.className =
                        "dhikr-separator";


                    separator.textContent =
                        "•";


                    dhikrTrack.appendChild(
                        separator
                    );

                }

            }
        );

    }


    document.title =
        generalSettings.mosqueName;

}
async function saveSharedSettings() {

    const sharedSettings = {

        generalSettings:
            generalSettings,

        locationSettings:
            locationSettings,

        prayerTimes:
            prayerTimes,

        ads:
            ads

    };


    const response =
        await fetch(
            "/api/settings",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        sharedSettings
                    )
            }
        );


    if (!response.ok) {

        throw new Error(
            "Failed to save shared settings."
        );

    }


    return await response.json();

}
async function loadSharedSettings() {

    try {

        const response =
            await fetch(
                "/api/settings",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            return false;

        }


        const result =
            await response.json();


        if (
            !result.success
            ||
            !result.settings
        ) {

            return false;

        }


        const sharedSettings =
            result.settings;


        if (sharedSettings.generalSettings) {

            generalSettings = {
                ...defaultGeneralSettings,
                ...sharedSettings.generalSettings
            };

        }


        if (sharedSettings.locationSettings) {

            locationSettings = {
                ...defaultLocationSettings,
                ...sharedSettings.locationSettings
            };

        }


        if (sharedSettings.prayerTimes) {

            prayerTimes =
                sharedSettings.prayerTimes;

        }

if (Array.isArray(sharedSettings.ads)) {

    ads =
        sharedSettings.ads;

}
        if (
            Array.isArray(
                sharedSettings.ads
            )
        ) {

            ads =
                sharedSettings.ads;

        }


        saveGeneralSettings();

        saveLocationSettings();

        savePrayerTimes();

        saveAds();


        return true;

    }
    catch (error) {

        console.error(
            "Shared settings load failed:",
            error
        );


        return false;

    }

}
/* =========================================
   إعدادات الموقع
   ========================================= */

function loadLocationSettings() {

    const saved =
        localStorage.getItem(
            "mosqueLocationSettings"
        );


    if (!saved) {

        return {
            ...defaultLocationSettings
        };

    }


    try {

        return {
            ...defaultLocationSettings,
            ...JSON.parse(saved)
        };

    }
    catch (error) {

        return {
            ...defaultLocationSettings
        };

    }

}


function saveLocationSettings() {

    localStorage.setItem(
        "mosqueLocationSettings",
        JSON.stringify(
            locationSettings
        )
    );

}


function applyLocationSettings() {

    setText(
        "locationDisplay",
        locationSettings.locationName
    );

}


/* =========================================
   مواقيت الصلاة
   ========================================= */

function loadSavedPrayerTimes() {

    const saved =
        localStorage.getItem(
            "mosquePrayerTimes"
        );


    if (!saved) {

        return JSON.parse(
            JSON.stringify(
                defaultPrayerTimes
            )
        );

    }


    try {

        const parsed =
            JSON.parse(saved);


        return {

            fajr: {
                ...defaultPrayerTimes.fajr,
                ...parsed.fajr
            },

            dhuhr: {
                ...defaultPrayerTimes.dhuhr,
                ...parsed.dhuhr
            },

            asr: {
                ...defaultPrayerTimes.asr,
                ...parsed.asr
            },

            maghrib: {
                ...defaultPrayerTimes.maghrib,
                ...parsed.maghrib
            },

            isha: {
                ...defaultPrayerTimes.isha,
                ...parsed.isha
            }

        };

    }
    catch (error) {

        return JSON.parse(
            JSON.stringify(
                defaultPrayerTimes
            )
        );

    }

}


function savePrayerTimes() {

    localStorage.setItem(
        "mosquePrayerTimes",
        JSON.stringify(
            prayerTimes
        )
    );

}


/* =========================================
   تحميل الأذان تلقائيًا
   ========================================= */

async function fetchAutomaticPrayerTimes() {

    const latitude =
        locationSettings.latitude;


    const longitude =
        locationSettings.longitude;


    const method =
        locationSettings.calculationMethod;


    const apiUrl =
        "https://api.aladhan.com/v1/timings"
        +
        "?latitude="
        +
        encodeURIComponent(latitude)
        +
        "&longitude="
        +
        encodeURIComponent(longitude)
        +
        "&method="
        +
        encodeURIComponent(method)
        +
        "&school=0";


    const response =
        await fetch(
            apiUrl,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "تعذر تحميل مواقيت الصلاة."
        );

    }


    const result =
        await response.json();


    if (
        !result
        ||
        result.code !== 200
        ||
        !result.data
        ||
        !result.data.timings
    ) {

        throw new Error(
            "بيانات مواقيت الصلاة غير صحيحة."
        );

    }


    return result.data.timings;

}


/* =========================================
   تنظيف الوقت القادم من API
   ========================================= */

function cleanApiTime(time) {

    if (
        typeof time
        !==
        "string"
    ) {

        return null;

    }


    const match =
        time.match(
            /(\d{1,2}):(\d{2})/
        );


    if (!match) {

        return null;

    }


    return (
        String(
            Number(match[1])
        ).padStart(
            2,
            "0"
        )
        +
        ":"
        +
        match[2]
    );

}
/* =========================================
   تحديث الأذان من الإنترنت
   ========================================= */

async function updateAutomaticPrayerTimes(
    showMessage = false
) {

    const updateButton =
        document.getElementById(
            "updatePrayerTimesButton"
        );


    try {

        if (
            updateButton
        ) {

            updateButton.disabled =
                true;


            updateButton.textContent =
                "جاري تحديث المواقيت...";

        }


        setText(
            "prayerUpdateStatus",
            "جاري تحديث مواقيت الصلاة..."
        );


        const timings =
            await fetchAutomaticPrayerTimes();


        const fajr =
            cleanApiTime(
                timings.Fajr
            );


        const dhuhr =
            cleanApiTime(
                timings.Dhuhr
            );


        const asr =
            cleanApiTime(
                timings.Asr
            );


        const maghrib =
            cleanApiTime(
                timings.Maghrib
            );


        const isha =
            cleanApiTime(
                timings.Isha
            );


        if (
            !fajr
            ||
            !dhuhr
            ||
            !asr
            ||
            !maghrib
            ||
            !isha
        ) {

            throw new Error(
                "بعض المواقيت غير متوفرة."
            );

        }


        /*
            نقوم بتحديث وقت الأذان فقط.

            وقت الإقامة يبقى كما حدده المسجد
            يدويًا.
        */

        prayerTimes.fajr.adhan =
            fajr;


        prayerTimes.dhuhr.adhan =
            dhuhr;


        prayerTimes.asr.adhan =
            asr;


        prayerTimes.maghrib.adhan =
            maghrib;


        prayerTimes.isha.adhan =
            isha;


        savePrayerTimes();


        const now =
            new Date();


        locationSettings.lastUpdate =
            now.toISOString();


        locationSettings.lastUpdateDate =
            getLocalDateKey(
                now
            );


        saveLocationSettings();


        loadPrayerTimes();

        updateClock();

        updateLastUpdateDisplay();


        if (
            document.getElementById(
                "settingsModal"
            )
            &&
            !document
                .getElementById(
                    "settingsModal"
                )
                .classList
                .contains(
                    "hidden"
                )
        ) {

            fillPrayerSettingsForm();

        }


        if (
            showMessage
        ) {

            alert(
                "تم تحديث مواقيت الأذان لولاية سمائل بنجاح."
            );

        }

    }
    catch (error) {

        console.error(
            error
        );


        setText(
            "prayerUpdateStatus",
            "تعذر التحديث - يتم استخدام آخر مواقيت محفوظة"
        );


        if (
            showMessage
        ) {

            alert(
                "تعذر تحديث المواقيت الآن. سيتم استخدام آخر مواقيت محفوظة."
            );

        }

    }
    finally {

        if (
            updateButton
        ) {

            updateButton.disabled =
                false;


            updateButton.textContent =
                "تحديث مواقيت الأذان الآن";

        }

    }

}


/* =========================================
   تحديث مرة واحدة يوميًا
   ========================================= */

async function updatePrayerTimesIfNeeded() {

    const today =
        getLocalDateKey(
            new Date()
        );


    if (
        locationSettings.lastUpdateDate
        ===
        today
    ) {

        return;

    }


    await updateAutomaticPrayerTimes(
        false
    );

}


function getLocalDateKey(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth()
            +
            1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year
        +
        "-"
        +
        month
        +
        "-"
        +
        day
    );

}


/* =========================================
   عرض آخر تحديث
   ========================================= */

function updateLastUpdateDisplay() {

    if (
        !locationSettings.lastUpdate
    ) {

        setText(
            "prayerUpdateStatus",
            "لم يتم تحديث المواقيت تلقائيًا بعد"
        );


        setText(
            "lastUpdateInfo",
            "لم يتم التحديث بعد"
        );


        return;

    }


    const date =
        new Date(
            locationSettings.lastUpdate
        );


    const formatted =
        date.toLocaleString(
            "ar-OM",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );


    const message =
        "آخر تحديث للمواقيت: "
        +
        formatted;


    setText(
        "prayerUpdateStatus",
        message
    );


    setText(
        "lastUpdateInfo",
        message
    );

}


/* =========================================
   عرض مواقيت الصلاة
   ========================================= */

function loadPrayerTimes() {

    setText(
        "fajrAdhan",
        formatPrayerTime12Hour(
            prayerTimes.fajr.adhan
        )
    );


    setText(
        "fajrIqama",
        formatPrayerTime12Hour(
            prayerTimes.fajr.iqama
        )
    );


    setText(
        "dhuhrAdhan",
        formatPrayerTime12Hour(
            prayerTimes.dhuhr.adhan
        )
    );


    setText(
        "dhuhrIqama",
        formatPrayerTime12Hour(
            prayerTimes.dhuhr.iqama
        )
    );


    setText(
        "asrAdhan",
        formatPrayerTime12Hour(
            prayerTimes.asr.adhan
        )
    );


    setText(
        "asrIqama",
        formatPrayerTime12Hour(
            prayerTimes.asr.iqama
        )
    );


    setText(
        "maghribAdhan",
        formatPrayerTime12Hour(
            prayerTimes.maghrib.adhan
        )
    );


    setText(
        "maghribIqama",
        formatPrayerTime12Hour(
            prayerTimes.maghrib.iqama
        )
    );


    setText(
        "ishaAdhan",
        formatPrayerTime12Hour(
            prayerTimes.isha.adhan
        )
    );


    setText(
        "ishaIqama",
        formatPrayerTime12Hour(
            prayerTimes.isha.iqama
        )
    );

}


/* =========================================
   الساعة 12 ساعة
   ========================================= */

function updateClock() {

    const now =
        new Date();


    updateTime(now);

    updateGregorianDate(now);

    updateHijriDate(now);

    updateNextPrayer(now);

    updateIqamaAlert(now);

}


function updateTime(now) {

    let hours =
        now.getHours();


    const minutes =
        now.getMinutes();


    const seconds =
        now.getSeconds();


    const period =
        hours >= 12
            ? "م"
            : "ص";


    hours =
        hours % 12;


    if (
        hours === 0
    ) {

        hours = 12;

    }


    setText(
        "currentTime",

        padNumber(hours)
        +
        ":"
        +
        padNumber(minutes)
        +
        ":"
        +
        padNumber(seconds)
        +
        " "
        +
        period
    );

}


function formatPrayerTime12Hour(
    time
) {

    if (
        !isValidTime(
            time
        )
    ) {

        return "--:--";

    }


    const parts =
        time.split(":");


    let hours =
        Number(
            parts[0]
        );


    const minutes =
        Number(
            parts[1]
        );


    const period =
        hours >= 12
            ? "م"
            : "ص";


    hours =
        hours % 12;


    if (
        hours === 0
    ) {

        hours = 12;

    }


    return (
        padNumber(hours)
        +
        ":"
        +
        padNumber(minutes)
        +
        " "
        +
        period
    );

}


/* =========================================
   التاريخ
   ========================================= */

function updateGregorianDate(
    now
) {

    const dayFormatter =
        new Intl.DateTimeFormat(
            "ar-OM",
            {
                weekday: "long"
            }
        );


    const dateFormatter =
        new Intl.DateTimeFormat(
            "ar-OM",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    setText(
        "dayName",
        dayFormatter.format(
            now
        )
    );


    setText(
        "gregorianDate",
        dateFormatter.format(
            now
        )
    );

}


function updateHijriDate(
    now
) {

    try {

        const adjustedDate =
            new Date(
                now
            );


        adjustedDate.setDate(
            adjustedDate.getDate()
            +
            Number(
                generalSettings.hijriOffset
            )
        );


        const formatter =
            new Intl.DateTimeFormat(
                "ar-SA-u-ca-islamic",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        setText(
            "hijriDate",
            formatter.format(
                adjustedDate
            )
        );

    }
    catch (error) {

        setText(
            "hijriDate",
            "التاريخ الهجري غير متوفر"
        );

    }

}


/* =========================================
   الصلاة القادمة
   ========================================= */

function updateNextPrayer(
    now
) {

    const prayers = [

        prayerTimes.fajr,

        prayerTimes.dhuhr,

        prayerTimes.asr,

        prayerTimes.maghrib,

        prayerTimes.isha

    ];


    let nextPrayer =
        null;


    let nextPrayerDate =
        null;


    for (
        const prayer
        of prayers
    ) {

        if (
            !isValidTime(
                prayer.adhan
            )
        ) {

            continue;

        }


        const prayerDate =
            getPrayerDate(
                now,
                prayer.adhan
            );


        if (
            prayerDate
            >
            now
        ) {

            nextPrayer =
                prayer;


            nextPrayerDate =
                prayerDate;


            break;

        }

    }


    if (
        nextPrayer
        ===
        null
    ) {

        nextPrayer =
            prayerTimes.fajr;


        nextPrayerDate =
            getPrayerDate(
                now,
                prayerTimes.fajr.adhan
            );


        nextPrayerDate.setDate(
            nextPrayerDate.getDate()
            +
            1
        );

    }


    setText(
        "nextPrayerName",
        nextPrayer.name
    );
document
    .querySelectorAll(".prayer-row")
    .forEach((row) => {

        row.classList.remove(
            "next-prayer-active"
        );

        if (
            row.dataset.prayerName
            ===
            nextPrayer.name
        ) {

            row.classList.add(
                "next-prayer-active"
            );

        }

    });

    setText(
        "nextPrayerTime",
        formatPrayerTime12Hour(
            nextPrayer.adhan
        )
    );


    updateCountdown(
        now,
        nextPrayerDate
    );

}


function getPrayerDate(
    baseDate,
    time
) {

    const parts =
        time.split(":");


    const result =
        new Date(
            baseDate
        );


    result.setHours(
        Number(
            parts[0]
        ),
        Number(
            parts[1]
        ),
        0,
        0
    );


    return result;

}


function isValidTime(
    time
) {

    return (
        typeof time
        ===
        "string"
        &&
        /^\d{2}:\d{2}$/.test(
            time
        )
    );

}


/* =========================================
   العد التنازلي
   ========================================= */
function updateIqamaAlert(now) {

    const alertElement =
        document.getElementById(
            "iqamaAlert"
        );

    const prayerNameElement =
        document.getElementById(
            "iqamaAlertPrayerName"
        );

    const countdownElement =
        document.getElementById(
            "iqamaAlertCountdown"
        );


    if (
        !alertElement
        ||
        !prayerNameElement
        ||
        !countdownElement
    ) {

        return;

    }


    const prayers = [

        prayerTimes.fajr,
        prayerTimes.dhuhr,
        prayerTimes.asr,
        prayerTimes.maghrib,
        prayerTimes.isha

    ];


    let activePrayer =
        null;

    let remainingSeconds =
        null;


    for (
        const prayer
        of prayers
    ) {

        if (
            !isValidTime(
                prayer.iqama
            )
        ) {

            continue;

        }


        const iqamaDate =
            getPrayerDate(
                now,
                prayer.iqama
            );


        const difference =
            Math.floor(
                (
                    iqamaDate.getTime()
                    -
                    now.getTime()
                )
                /
                1000
            );


        if (
            difference >= 0
            &&
            difference <= 300
        ) {

            activePrayer =
                prayer;

            remainingSeconds =
                difference;

            break;

        }

    }


    if (
        !activePrayer
        ||
        remainingSeconds === null
    ) {

        alertElement.classList.add(
            "hidden"
        );

        return;

    }


    alertElement.classList.remove(
        "hidden"
    );


    prayerNameElement.textContent =
        activePrayer.name;


    const minutes =
        Math.floor(
            remainingSeconds
            /
            60
        );


    const seconds =
        remainingSeconds
        %
        60;


    countdownElement.textContent =
        padNumber(
            minutes
        )
        +
        ":"
        +
        padNumber(
            seconds
        );


    if (
        remainingSeconds === 0
    ) {

        prayerNameElement.textContent =
            "حان الآن وقت الإقامة";

    }

}
function updateCountdown(
    now,
    prayerDate
) {

    let difference =
        prayerDate.getTime()
        -
        now.getTime();


    if (
        difference < 0
    ) {

        difference =
            0;

    }


    const totalSeconds =
        Math.floor(
            difference
            /
            1000
        );


    const hours =
        Math.floor(
            totalSeconds
            /
            3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds
                %
                3600
            )
            /
            60
        );


    const seconds =
        totalSeconds
        %
        60;


    setText(
        "countdown",

        padNumber(hours)
        +
        ":"
        +
        padNumber(minutes)
        +
        ":"
        +
        padNumber(seconds)
    );

}


function padNumber(
    number
) {

    return String(
        number
    ).padStart(
        2,
        "0"
    );

}
/* =========================================
   أحداث الإعدادات
   ========================================= */

async function updateSettingsButtonVisibility() {

    const settingsButton =
        document.getElementById(
            "settingsButton"
        );

    if (!settingsButton) {
        return;
    }

    settingsButton.classList.add(
        "hidden"
    );

    try {

        const response =
            await fetch(
                "/api/session",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        const session =
            await response.json();

        if (
            response.ok
            &&
            session.authenticated
            &&
            session.role === "admin"
        ) {

            settingsButton.classList.remove(
                "hidden"
            );

        }

    }
    catch (error) {

        console.error(
            "Settings visibility check failed:",
            error
        );

    }

}
function setupSettingsEvents() {

    document.getElementById(
        "settingsButton"
    ).addEventListener(
        "click",
        openSettings
    );


    document.getElementById(
        "closeSettingsButton"
    ).addEventListener(
        "click",
        closeSettings
    );


    /* =========================================
       إضافة ذكر جديد
       ========================================= */

    document.getElementById(
        "addDhikrButton"
    ).addEventListener(
        "click",
        function () {

            const newDhikrInput =
                document.getElementById(
                    "newDhikrText"
                );


            const newDhikr =
                newDhikrInput.value.trim();


            if (!newDhikr) {

                alert(
                    "يرجى كتابة الذكر أولاً."
                );

                return;

            }


            const container =
                document.getElementById(
                    "dhikrItemsList"
                );


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "dhikr-setting-item";


            const input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            input.maxLength =
                120;

            input.className =
                "dhikr-setting-input";

            input.value =
                newDhikr;


            const removeButton =
                document.createElement(
                    "button"
                );

            removeButton.type =
                "button";

            removeButton.className =
                "delete-dhikr-button";

            removeButton.textContent =
                "حذف";


            removeButton.addEventListener(
                "click",
                function () {

                    row.remove();

                }
            );


            row.append(
                input,
                removeButton
            );


            container.appendChild(
                row
            );


            newDhikrInput.value =
                "";

            newDhikrInput.focus();

        }
    );


    /* =========================================
       تحديث مواقيت الأذان
       ========================================= */

    document.getElementById(
        "updatePrayerTimesButton"
    ).addEventListener(
        "click",
        function () {

            updateAutomaticPrayerTimes(
                true
            );

        }
    );


    /* =========================================
       حفظ جميع التغييرات
       ========================================= */

    document.getElementById(
        "saveAllSettingsButton"
    ).addEventListener(
        "click",
        async function () {

            try {

                const generalSaved =
                    saveGeneralSettingsFromForm();

                if (!generalSaved) {
                    return;
                }


                const locationSaved =
                    saveLocationSettingsFromForm();

                if (!locationSaved) {
                    return;
                }


                const prayerSaved =
                    savePrayerSettingsFromForm();

                if (!prayerSaved) {
                    return;
                }


                await saveSharedSettings();


                alert(
                    "تم حفظ جميع التغييرات."
                );

            }
            catch (error) {

                console.error(
                    "Save all settings failed:",
                    error
                );

                alert(
                    "تعذر حفظ جميع التغييرات."
                );

            }

        }
    );


    /* =========================================
       استعادة المواقيت الافتراضية
       ========================================= */

    document.getElementById(
        "resetSettingsButton"
    ).addEventListener(
        "click",
        resetPrayerSettings
    );


    /* =========================================
       إغلاق الإعدادات عند الضغط خارج اللوحة
       ========================================= */

    document.getElementById(
        "settingsModal"
    ).addEventListener(
        "click",
        function (event) {

            if (
                event.target.id
                ===
                "settingsModal"
            ) {

                closeSettings();

            }

        }
    );

}

async function openSettings() {

    try {

        const response =
            await fetch(
                "/api/session",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const session =
            await response.json();


        if (
            !response.ok
            ||
            !session.authenticated
            ||
            session.role !== "admin"
        ) {

            alert(
                "هذه الإعدادات متاحة للمشرفين فقط."
            );

            return;

        }


        setInputValue(
            "settingMosqueName",
            generalSettings.mosqueName
        );


        setInputValue(
            "settingMosqueSubtitle",
            generalSettings.mosqueSubtitle
        );


renderDhikrSettingsList();

        setInputValue(
            "settingHijriOffset",
            String(
                generalSettings.hijriOffset
            )
        );


        setInputValue(
            "settingLocationName",
            locationSettings.locationName
        );


        setInputValue(
            "settingLatitude",
            locationSettings.latitude
        );


        setInputValue(
            "settingLongitude",
            locationSettings.longitude
        );


        setInputValue(
            "settingCalculationMethod",
            String(
                locationSettings.calculationMethod
            )
        );


        document.getElementById(
            "settingAutoPrayerTimes"
        ).checked =
            Boolean(
                locationSettings.autoPrayerTimes
            );


        fillPrayerSettingsForm();



        updateLastUpdateDisplay();


        document.getElementById(
            "settingsModal"
        ).classList.remove(
            "hidden"
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK admin session check failed:",
            error
        );


        alert(
            "تعذر التحقق من صلاحية المشرف."
        );

    }

}


function fillPrayerSettingsForm() {

    setInputValue(
        "settingFajrAdhan",
        prayerTimes.fajr.adhan
    );


    setInputValue(
        "settingFajrIqama",
        prayerTimes.fajr.iqama
    );


    setInputValue(
        "settingDhuhrAdhan",
        prayerTimes.dhuhr.adhan
    );


    setInputValue(
        "settingDhuhrIqama",
        prayerTimes.dhuhr.iqama
    );


    setInputValue(
        "settingAsrAdhan",
        prayerTimes.asr.adhan
    );


    setInputValue(
        "settingAsrIqama",
        prayerTimes.asr.iqama
    );


    setInputValue(
        "settingMaghribAdhan",
        prayerTimes.maghrib.adhan
    );


    setInputValue(
        "settingMaghribIqama",
        prayerTimes.maghrib.iqama
    );


    setInputValue(
        "settingIshaAdhan",
        prayerTimes.isha.adhan
    );


    setInputValue(
        "settingIshaIqama",
        prayerTimes.isha.iqama
    );

}


function closeSettings() {

    document.getElementById(
        "settingsModal"
    ).classList.add(
        "hidden"
    );

}


/* =========================================
   حفظ الإعدادات العامة
   ========================================= */
function renderDhikrSettingsList() {

    const container =
        document.getElementById(
            "dhikrItemsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const items =
        Array.isArray(
            generalSettings.dhikrItems
        )
        ?
        generalSettings.dhikrItems
        :
        defaultGeneralSettings.dhikrItems;


    items.forEach(
        function (
            item
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "dhikr-setting-item";


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "text";

            input.maxLength =
                120;

            input.className =
                "dhikr-setting-input";

            input.value =
                item;


            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";

            removeButton.className =
                "delete-dhikr-button";

            removeButton.textContent =
                "حذف";


            removeButton.addEventListener(
                "click",
                function () {

                    row.remove();

                }
            );


            row.append(
                input,
                removeButton
            );


            container.appendChild(
                row
            );

        }
    );

}
function saveGeneralSettingsFromForm() {

    const mosqueName =
        getInputValue(
            "settingMosqueName"
        ).trim();


    if (
        !mosqueName
    ) {

        alert(
            "يرجى كتابة اسم المسجد."
        );

        return false;

    }


    const dhikrInputs =
        document.querySelectorAll(
            ".dhikr-setting-input"
        );


    const dhikrItems =
        Array.from(
            dhikrInputs
        )
        .map(
            function (input) {

                return input.value.trim();

            }
        )
        .filter(
            function (item) {

                return item !== "";

            }
        );


    if (
        dhikrItems.length === 0
    ) {

        alert(
            "يرجى إضافة ذكر واحد على الأقل."
        );

        return false;

    }


    generalSettings = {

        mosqueName:
            mosqueName,

        mosqueSubtitle:
            getInputValue(
                "settingMosqueSubtitle"
            ).trim()
            ||
            "مواقيت الصلاة",

        dhikrItems:
            dhikrItems,

        hijriOffset:
            Number(
                getInputValue(
                    "settingHijriOffset"
                )
            )

    };


    saveGeneralSettings();

    applyGeneralSettings();

    updateClock();

    return true;

}
/* =========================================
   حفظ الموقع
   ========================================= */

function saveLocationSettingsFromForm() {

    const latitude =
        Number(
            getInputValue(
                "settingLatitude"
            )
        );


    const longitude =
        Number(
            getInputValue(
                "settingLongitude"
            )
        );


    if (
        !Number.isFinite(latitude)
        ||
        latitude < -90
        ||
        latitude > 90
    ) {

        alert(
            "خط العرض غير صحيح."
        );

        return false;

    }


    if (
        !Number.isFinite(longitude)
        ||
        longitude < -180
        ||
        longitude > 180
    ) {

        alert(
            "خط الطول غير صحيح."
        );

        return false;

    }


    locationSettings.locationName =
        getInputValue(
            "settingLocationName"
        ).trim()
        ||
        defaultLocationSettings.locationName;


    locationSettings.latitude =
        latitude;


    locationSettings.longitude =
        longitude;


    locationSettings.calculationMethod =
        Number(
            getInputValue(
                "settingCalculationMethod"
            )
        );


    locationSettings.autoPrayerTimes =
        document.getElementById(
            "settingAutoPrayerTimes"
        ).checked;


    locationSettings.lastUpdateDate =
        "";


    saveLocationSettings();

    applyLocationSettings();

    return true;

}
/* =========================================
   حفظ المواقيت يدويًا
   ========================================= */
function savePrayerSettingsFromForm() {

    const newTimes = {

        fajr: {
            name: "الفجر",
            adhan: getInputValue(
                "settingFajrAdhan"
            ),
            iqama: getInputValue(
                "settingFajrIqama"
            )
        },

        dhuhr: {
            name: "الظهر",
            adhan: getInputValue(
                "settingDhuhrAdhan"
            ),
            iqama: getInputValue(
                "settingDhuhrIqama"
            )
        },

        asr: {
            name: "العصر",
            adhan: getInputValue(
                "settingAsrAdhan"
            ),
            iqama: getInputValue(
                "settingAsrIqama"
            )
        },

        maghrib: {
            name: "المغرب",
            adhan: getInputValue(
                "settingMaghribAdhan"
            ),
            iqama: getInputValue(
                "settingMaghribIqama"
            )
        },

        isha: {
            name: "العشاء",
            adhan: getInputValue(
                "settingIshaAdhan"
            ),
            iqama: getInputValue(
                "settingIshaIqama"
            )
        }

    };


    const times = [

        newTimes.fajr.adhan,
        newTimes.fajr.iqama,

        newTimes.dhuhr.adhan,
        newTimes.dhuhr.iqama,

        newTimes.asr.adhan,
        newTimes.asr.iqama,

        newTimes.maghrib.adhan,
        newTimes.maghrib.iqama,

        newTimes.isha.adhan,
        newTimes.isha.iqama

    ];


    if (
        times.some(
            function (time) {

                return !isValidTime(
                    time
                );

            }
        )
    ) {

        alert(
            "يرجى تحديد جميع المواقيت."
        );

        return false;

    }


    prayerTimes =
        newTimes;


    savePrayerTimes();

    loadPrayerTimes();

    updateClock();

    return true;

}
function resetPrayerSettings() {

    if (
        !confirm(
            "هل تريد استعادة المواقيت الافتراضية؟"
        )
    ) {

        return;

    }


    prayerTimes =
        JSON.parse(
            JSON.stringify(
                defaultPrayerTimes
            )
        );


    savePrayerTimes();

    loadPrayerTimes();

    updateClock();

    fillPrayerSettingsForm();

}
/* =========================================
   الإعلانات
   ========================================= */

function loadSavedAds() {

    const saved =
        localStorage.getItem(
            "mosqueAds"
        );


    if (!saved) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(saved);


        return Array.isArray(
            parsed
        )
            ?
            parsed
            :
            [];

    }
    catch {

        return [];

    }

}


function saveAds() {

    localStorage.setItem(
        "mosqueAds",
        JSON.stringify(
            ads
        )
    );

}


async function addAd() { 

    const title =
        getInputValue(
            "newAdTitle"
        ).trim();


    const text =
        getInputValue(
            "newAdText"
        ).trim();


    const startDate =
        getInputValue(
            "newAdStartDate"
        );


    const endDate =
        getInputValue(
            "newAdEndDate"
        );


    if (
        !title
        ||
        !text
    ) {

        alert(
            "يرجى كتابة عنوان ونص الإعلان."
        );

        return;

    }


    if (
        startDate
        &&
        endDate
        &&
        startDate > endDate
    ) {

        alert(
            "تاريخ النهاية يجب أن يكون بعد تاريخ البداية."
        );

        return;

    }


    ads.push(
        {

            id:
                Date.now(),

            title:
                title,

            text:
                text,

            startDate:
                startDate,

            endDate:
                endDate,

            enabled:
                true

        }
    );


    saveAds();

await saveSharedSettings();

    clearAdForm();

    

    currentAdIndex =
        0;



}


function clearAdForm() {

    setInputValue(
        "newAdTitle",
        ""
    );

    setInputValue(
        "newAdText",
        ""
    );

    setInputValue(
        "newAdStartDate",
        ""
    );

    setInputValue(
        "newAdEndDate",
        ""
    );

}


function getActiveAds() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    return ads.filter(
        function (
            ad
        ) {

            if (
                !ad.enabled
            ) {

                return false;

            }


            if (
                ad.startDate
            ) {

                const start =
                    new Date(
                        ad.startDate
                        +
                        "T00:00:00"
                    );


                if (
                    today < start
                ) {

                    return false;

                }

            }


            if (
                ad.endDate
            ) {

                const end =
                    new Date(
                        ad.endDate
                        +
                        "T23:59:59"
                    );


                if (
                    today > end
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}

/* =========================================
   الاتصال
   ========================================= */

function updateConnectionStatus() {

    setText(
        "connectionStatus",

        navigator.onLine
        ?
        "متصل بالإنترنت"
        :
        "وضع عدم الاتصال - الساعة مستمرة بالعمل"
    );

}


window.addEventListener(
    "online",
    async function () {

        updateConnectionStatus();


        if (
            locationSettings.autoPrayerTimes
        ) {

            await updatePrayerTimesIfNeeded();

        }

    }
);


window.addEventListener(
    "offline",
    updateConnectionStatus
);


/* =========================================
   PWA
   ========================================= */

window.addEventListener(
    "beforeinstallprompt",
    function (
        event
    ) {

        event.preventDefault();


        deferredInstallPrompt =
            event;


        document.getElementById(
            "installButton"
        ).classList.remove(
            "hidden"
        );

    }
);


document.addEventListener(
    "DOMContentLoaded",
    function () {

        document.getElementById(
            "installButton"
        ).addEventListener(
            "click",
            installApp
        );

    }
);
async function installApp() {

    if (
        !deferredInstallPrompt
    ) {

        const iosInstructions =
            document.getElementById(
                "iosInstructions"
            );

        if (
            iosInstructions
        ) {

            iosInstructions.classList.remove(
                "hidden"
            );

        }

        return;

    }


    deferredInstallPrompt.prompt();


    await deferredInstallPrompt
        .userChoice;


    deferredInstallPrompt =
        null;


    document.getElementById(
        "installButton"
    ).classList.add(
        "hidden"
    );

}


/* =========================================
   iPhone
   ========================================= */

function checkIOSDevice() {

    const agent =
        navigator.userAgent
            .toLowerCase();


    const isIOS =
        /iphone|ipad|ipod/
            .test(
                agent
            );


    if (
        isIOS
        &&
        navigator.standalone
        !==
        true
    ) {
document.getElementById(
    "installButton"
).classList.remove(
    "hidden"
);
        document.getElementById(
            "iosInstructions"
        ).classList.remove(
            "hidden"
        );

    }

}


/* =========================================
   Service Worker
   ========================================= */

if (
    "serviceWorker"
    in
    navigator
) {

    window.addEventListener(
        "load",
        async function () {

            try {

                await navigator
                    .serviceWorker
                    .register(
                        "./service-worker.js"
                    );

            }
            catch (
                error
            ) {

                console.error(
                    error
                );

            }

        }
    );

}


/* =========================================
   مساعدات
   ========================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value;

    }

}


function setInputValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.value =
            value;

    }

}


function getInputValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ?
        element.value
        :
        "";

}
/* =========================================
   Phone / PC / Auto View
========================================= */

function setViewMode(mode) {

    document.body.classList.remove(
        "phone-view",
        "pc-view"
    );

    if (mode === "phone") {
        document.body.classList.add(
            "phone-view"
        );
    }

    if (mode === "pc") {
        document.body.classList.add(
            "pc-view"
        );
    }

    localStorage.setItem(
        "mosqueViewMode",
        mode
    );
}


document.getElementById(
    "autoViewButton"
).addEventListener(
    "click",
    function () {
        setViewMode("auto");
    }
);


document.getElementById(
    "phoneViewButton"
).addEventListener(
    "click",
    function () {
        setViewMode("phone");
    }
);


document.getElementById(
    "pcViewButton"
).addEventListener(
    "click",
    function () {
        setViewMode("pc");
    }
);


const savedViewMode =
    localStorage.getItem(
        "mosqueViewMode"
    )
    || "auto";


setViewMode(
    savedViewMode
);