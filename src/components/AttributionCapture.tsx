"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Mounted once in the root layout: records first-touch attribution on load. */
export default function AttributionCapture() {
  useEffect(() => { captureAttribution(); }, []);
  return null;
}
