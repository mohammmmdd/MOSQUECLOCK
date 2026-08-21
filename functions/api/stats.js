"use strict";

const STATS_KEY =
    "mosque_app_stats";


export async function onRequestPost(context) {

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


        const body =
            await context.request.json();


        const visitorId =
            typeof body?.visitorId === "string"
                ? body.visitorId.trim()
                : "";


        if (!visitorId) {

            return jsonResponse(
                {
                    success: false,
                    message: "Invalid visitor id."
                },
                400
            );

        }


        const saved =
            await context.env.MOSQUE_DATA.get(
                STATS_KEY,
                {
                    type: "json"
                }
            );


        const stats =
            saved &&
            typeof saved === "object"
                ?
                saved
                :
                {
                    uniqueVisitors: [],
                    totalVisits: 0
                };


        if (
            !Array.isArray(
                stats.uniqueVisitors
            )
        ) {

            stats.uniqueVisitors =
                [];

        }


        stats.totalVisits =
            Number(
                stats.totalVisits
            ) || 0;


        stats.totalVisits++;


        if (
            !stats.uniqueVisitors.includes(
                visitorId
            )
        ) {

            stats.uniqueVisitors.push(
                visitorId
            );

        }


        await context.env.MOSQUE_DATA.put(
            STATS_KEY,
            JSON.stringify(
                stats
            )
        );


        return jsonResponse(
            {
                success: true,

                uniqueVisitors:
                    stats.uniqueVisitors.length,

                totalVisits:
                    stats.totalVisits
            },
            200
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK stats error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                message: "Failed to update statistics."
            },
            500
        );

    }

}


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


        const saved =
            await context.env.MOSQUE_DATA.get(
                STATS_KEY,
                {
                    type: "json"
                }
            );


        const uniqueVisitors =
            Array.isArray(
                saved?.uniqueVisitors
            )
                ?
                saved.uniqueVisitors.length
                :
                0;


        const totalVisits =
            Number(
                saved?.totalVisits
            ) || 0;


        return jsonResponse(
            {
                success: true,
                uniqueVisitors,
                totalVisits
            },
            200
        );

    }
    catch (error) {

        console.error(
            "MOSQUECLOCK stats read error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                message: "Failed to load statistics."
            },
            500
        );

    }

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