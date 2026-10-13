"use client";


import type { FeatureProps } from "@/lib/spec/feature";
import Enroll, { type Options } from "./components/enroll";

export default function NotificationsFeature ( props: FeatureProps<Options> ) {

    return <Enroll {...props} />;

}
