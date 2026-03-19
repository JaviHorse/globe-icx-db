export const GROUP_TABS = [
    "AIG",
    "AIG&ISDPSharedServices",
    "B2B",
    "B2C",
    "BB",
    "CMB",
    "CLSG",
    "EDS",
    "F&A",
    "FVT",
    "HR",
    "IA",
    "ISDP",
    "Marketing",
    "PXG",
    "CXC",
    "ISG",
    "NTG",
    "OSMCX",
    "SCC",
] as const;

export type GroupTabName = (typeof GROUP_TABS)[number];