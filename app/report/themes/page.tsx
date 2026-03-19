import { InsightPanel, SectionCard } from "@/components/report/ReportPrimitives";

export default function ThemesPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-4xl font-bold text-white">Qualitative Themes</h2>
                <p className="mt-2 text-[#8da0c2]">
                    Key insights from stakeholder feedback and coded open-ended responses.
                </p>
            </div>

            <SectionCard
                title="Key Themes / Qualitative Insights"
                subtitle="I think we can add here the automated themes from the Bucketing tool."
            >
                <div className="grid gap-6 xl:grid-cols-3">
                    <InsightPanel
                        title="TPositive insights"
                        value="Placeholder lang mga toh."
                    />
                    <InsightPanel
                        title="Negative insights"
                        value="Placeholder lang din toh."
                    />
                    <InsightPanel
                        title="Top Improvement Requests"
                        value="Placeholder lang din toh."
                    />
                </div>
            </SectionCard>
        </div>
    );
}