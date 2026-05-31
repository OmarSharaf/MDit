import { FEATURES_GUIDE_FILE_NAME, FEATURES_GUIDE_MD } from "./featuresGuide";
import { WELCOME_FILE_NAME, WELCOME_MD } from "./welcome";

export const BUILT_IN_DOCS = [
  { name: WELCOME_FILE_NAME, content: WELCOME_MD, pinned: false },
  { name: FEATURES_GUIDE_FILE_NAME, content: FEATURES_GUIDE_MD, pinned: true },
] as const;

export function isBuiltInDoc(name: string, path: string | null): boolean {
  return path === null && BUILT_IN_DOCS.some((doc) => doc.name === name);
}
