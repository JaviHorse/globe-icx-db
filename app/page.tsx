"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ResponseRow = {
  id: string;
  group: string;
  question: string;
  answer: string;
  employeeId: string;
  timestamp: string;
  extraFields: Record<string, string>;
};

type GroupedResponse = {
  question: string;
  rows: ResponseRow[];
};

type ApiResponse = {
  success: boolean;
  totalResponses?: number;
  groups?: string[];
  groupedResponses?: Record<string, GroupedResponse>;
  updatedAt?: string;
  error?: string;
};

const ITEMS_PER_PAGE = 20;

function formatHeader(header: string) {
  return header.replace(/\s+/g, " ").trim();
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startXRef.current) * 2;
      scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrollRef.current) return;

    // Support both mouse and touch
    const clientX = "touches" in e ? e.touches[0].pageX : e.pageX;

    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = clientX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    // Don't preventDefault here to allow vertical scrolling if needed,
    // though for horizontal "swipe" we usually want to take control.
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  async function fetchData(group?: string) {
    setLoading(true);
    try {
      const query =
        group && group !== "All Groups"
          ? `/api/responses?group=${encodeURIComponent(group)}`
          : "/api/responses";

      const res = await fetch(query, { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch {
      setData({
        success: false,
        error: "Failed to load responses.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(selectedGroup);
    const interval = setInterval(() => fetchData(selectedGroup), 60000);
    return () => clearInterval(interval);
  }, [selectedGroup]);

  useEffect(() => {
    setPage(1);
  }, [selectedGroup]);

  const groupedResponses = data?.groupedResponses ?? {};
  const groups = data?.groups ?? [];

  const allRows = useMemo(() => {
    if (!data?.success) return [];

    if (selectedGroup === "All Groups") {
      return Object.values(groupedResponses).flatMap((group) => group.rows);
    }

    return groupedResponses[selectedGroup]?.rows ?? [];
  }, [data, groupedResponses, selectedGroup]);

  const featuredQuestion = useMemo(() => {
    if (selectedGroup === "All Groups") {
      return "Overall collaboration ratings across all groups";
    }

    return groupedResponses[selectedGroup]?.question || "No question available";
  }, [groupedResponses, selectedGroup]);

  const dynamicColumns = useMemo(() => {
    if (selectedGroup === "All Groups") return [];

    const seen = new Set<string>();
    const ordered: string[] = [];

    allRows.forEach((row) => {
      Object.keys(row.extraFields || {}).forEach((key) => {
        if (!seen.has(key)) {
          seen.add(key);
          ordered.push(key);
        }
      });
    });

    return ordered;
  }, [allRows, selectedGroup]);

  const totalPages = Math.max(1, Math.ceil(allRows.length / ITEMS_PER_PAGE));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return allRows.slice(start, start + ITEMS_PER_PAGE);
  }, [allRows, page]);

  const visibleColumnCount = 4 + (selectedGroup === "All Groups" ? 0 : dynamicColumns.length);

  return (
    <main className="min-h-screen bg-[#f2f4f8] text-[#1f2e8d]">
      <section className="bg-[#1f2e8d] text-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold">iCX: internal Customer eXperience</h1>
          <p className="mt-2 text-3xl italic">Your Voice, Our Purpose.</p>
          <p className="mt-4 text-lg opacity-90">ICX Groups survey responses</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-4 uppercase">The Question</h2>

        <div className="rounded-[28px] bg-gradient-to-r from-[#eef1f8] to-[#d8f2f5] shadow-md border border-[#dde3ef] p-10 text-center text-3xl font-semibold">
          {featuredQuestion}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold uppercase">Responses</h2>
          <div className="text-lg text-[#5b6799]">
            {allRows.length} responses · Updated{" "}
            {data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : "--"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => fetchData(selectedGroup)}
            className="rounded-xl bg-[#1f2e8d] text-white px-6 py-3 font-medium"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <a
            href="https://docs.google.com/spreadsheets/d/1S1Gca6lv1LlHx3ye5qtnYFmGRXbL9YLxwvBAKlFYXJc/edit"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[#1f2e8d] px-6 py-3 font-medium bg-white"
          >
            Open Sheet →
          </a>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-[#cfd6ea] px-4 py-3 bg-white min-w-[220px]"
          >
            <option value="All Groups">All Groups</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {!data?.success && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {data?.error || "Failed to load responses."}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-3xl shadow-sm border border-[#dce2f0] bg-white">
          <div
            ref={scrollRef}
            onMouseDown={startDragging}
            onTouchStart={startDragging}
            onTouchMove={handleTouchMove}
            className={`overflow-x-auto ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              }`}
          >
            <table className="w-full min-w-max">
              <thead className="bg-[#1f2e8d] text-white">
                <tr>
                  <th className="text-left px-6 py-4 whitespace-nowrap">GROUP</th>
                  <th className="text-left px-6 py-4 whitespace-nowrap">EMAIL</th>
                  <th className="text-left px-6 py-4 whitespace-nowrap">OVERALL RATING</th>
                  <th className="text-left px-6 py-4 whitespace-nowrap">TIMESTAMP</th>
                  {selectedGroup !== "All Groups" &&
                    dynamicColumns.map((column) => (
                      <th key={column} className="text-left px-6 py-4 min-w-[220px]">
                        {formatHeader(column)}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, i) => (
                  <tr key={`${row.id}-${i}`} className="border-t border-[#edf1f8] align-top">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{row.group || "-"}</td>
                    <td className="px-6 py-4">{row.employeeId || "-"}</td>
                    <td className="px-6 py-4">{row.answer || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.timestamp ? new Date(row.timestamp).toLocaleString() : "-"}
                    </td>
                    {selectedGroup !== "All Groups" &&
                      dynamicColumns.map((column) => (
                        <td key={`${row.id}-${column}`} className="px-6 py-4">
                          {row.extraFields?.[column] || "-"}
                        </td>
                      ))}
                  </tr>
                ))}

                {paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumnCount} className="px-6 py-8 text-center text-[#6d78a8]">
                      No responses found for this group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-[#fafbfe] border-t border-[#edf1f8]">
            <span>
              Showing {allRows.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, allRows.length)} of {allRows.length}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border px-4 py-2 disabled:opacity-40 bg-white"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages || allRows.length === 0}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border px-4 py-2 disabled:opacity-40 bg-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}