import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT_DIR = path.resolve(process.cwd(), 'src')
const ALLOWED_EXTENSIONS = new Set(['.tsx', '.ts', '.js', '.html', '.json'])
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git'])
const SUSPICIOUS_SEQUENCES = ['\uFFFD', 'Ã', 'Â', 'â€']

async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = []

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name)) continue
            files.push(...await walk(path.join(dir, entry.name)))
            continue
        }

        const ext = path.extname(entry.name).toLowerCase()
        if (ALLOWED_EXTENSIONS.has(ext)) {
            files.push(path.join(dir, entry.name))
        }
    }

    return files
}

function decodeUtf8(bytes) {
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return decoder.decode(bytes)
}

async function main() {
    const files = await walk(ROOT_DIR)
    const issues = []

    for (const file of files) {
        const bytes = await readFile(file)
        let text = ''

        try {
            text = decodeUtf8(bytes)
        } catch {
            issues.push({ file, reason: 'not valid UTF-8' })
            continue
        }

        for (const marker of SUSPICIOUS_SEQUENCES) {
            if (text.includes(marker)) {
                issues.push({ file, reason: `contains suspicious sequence: ${marker}` })
                break
            }
        }
    }

    if (issues.length > 0) {
        console.error('Encoding issues found:')
        for (const issue of issues) {
            console.error(`- ${path.relative(process.cwd(), issue.file)}: ${issue.reason}`)
        }
        process.exit(1)
    }

    console.log(`UTF-8 check passed for ${files.length} file(s).`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})