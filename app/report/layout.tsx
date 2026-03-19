"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/report/overview", label: "Overview" },
    { href: "/report/overall", label: "Overall" },
    { href: "/report/services-given", label: "Services Given" },
    { href: "/report/services-received", label: "Services Received" },
    { href: "/report/themes", label: "Themes" },
    { href: "/report/recommendations", label: "Recommendations" },
];

export default function ReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <main className="min-h-screen bg-report-bg text-white">
            <div className="mx-auto max-w-[1200px] px-6 py-4">
                <header className="mb-4 flex items-center justify-between border-b border-white/6 pb-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]">i</div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">iCX Executive Report</h1>
                        </div>
                        <p className="mt-2 text-[#8da0c2]">Consolidated collaboration and service analytics</p>
                    </div>
                    
                    <nav className="flex gap-1 rounded-2xl bg-white/[0.03] p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                        isActive 
                                            ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]" 
                                            : "text-[#8da0c2] hover:bg-white/[0.06] hover:text-white"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </header>

                <div className="relative">
                    {children}
                </div>
            </div>
        </main>
    );
}