export const profileImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

type FileInfo = { name: string; type: string; size: number };
type Policy = { maxBytes: number; blocked: readonly string[] };

export function profileImageError ( file: FileInfo, policy: Policy ): "fileType" | "fileSize" | null {

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if ( !file.size || file.name.length > 255 || !profileImageTypes.some(( mime ) => mime === file.type) ) return "fileType";
    if ( policy.blocked.includes(extension) ) return "fileType";

    return file.size > policy.maxBytes ? "fileSize" : null;

}
