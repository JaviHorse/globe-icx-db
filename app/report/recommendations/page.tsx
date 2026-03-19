import { InsightPanel, SectionCard } from "@/components/report/ReportPrimitives";

export default function RecommendationsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-4xl font-bold text-white">Recommendations</h2>
                <p className="mt-2 text-[#8da0c2]">
                    Maybe Insights kasi diba data insights and analytics...
                </p>
            </div>

            <SectionCard
                title="Recommendations / Action Summary"
                subtitle="Executive synthesis page for Keep, Fix, and Improve actions."
            >
                <div className="grid gap-6 xl:grid-cols-3">
                    <InsightPanel
                        title="Keep"
                        value="Placeholder: strengths and experiences that should be kept because they are already working well."
                    />
                    <InsightPanel
                        title="Fix"
                        value="Placeholder: immediate friction points that needs to be fixed according to the insights."
                    />
                    <InsightPanel
                        title="Improve"
                        value="Placeholder: studd lang naman to improve on if ever."
                    />
                </div>
            </SectionCard>
        </div>
    );
}