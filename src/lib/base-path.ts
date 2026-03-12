export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function withBasePath(path: string): string {
    if (!path) return path
    if (!path.startsWith('/')) return `${BASE_PATH}/${path}`.replace(/\/+/g, '/')
    return `${BASE_PATH}${path}`.replace(/\/+/g, '/')
}

