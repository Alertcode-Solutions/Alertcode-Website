import { NextRequest } from "next/server";
import { safeApiHandler } from "@/lib/api-handler";
import { getSubscribers } from "@/lib/subscribers";

function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export const GET = safeApiHandler(
  async (_request: NextRequest) => {
    const subscribers = await getSubscribers();

    const header = ["email", "createdAt"].join(",");
    const rows = subscribers.map((subscriber) =>
      [escapeCsv(subscriber.email), escapeCsv(subscriber.createdAt.toISOString())].join(","),
    );

    const csv = [header, ...rows].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=alertcode-subscribers.csv",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  },
  {
    noStore: true,
    fallbackMessage: "Unable to export subscribers.",
  },
);

