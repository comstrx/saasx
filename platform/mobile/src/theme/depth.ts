import type { BoxShadowValue } from "react-native";
import type { Roles } from "@/theme/roles";

export type DepthName = "flat" | "lift" | "raise" | "float";

type Depth = {
    borderWidth: number;
    borderColor: string;
    boxShadow: BoxShadowValue[];
};

export const depths = ({ line, cast }: Roles ): Record<DepthName, Depth> => ({
    flat: { borderWidth: 0, borderColor: line.hair, boxShadow: [] },
    lift: { borderWidth: 0, borderColor: line.hair, boxShadow: cast.lift },
    raise: { borderWidth: 0, borderColor: line.soft, boxShadow: cast.raise },
    float: { borderWidth: 0, borderColor: line.soft, boxShadow: cast.float },
});
