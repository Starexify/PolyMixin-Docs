export class DataTable extends HTMLElement {
    connectedCallback() {
        let data = [];
        let headers = [];

        // Try to parse as simple array format first (rows separated by newlines)
        const content = this.innerHTML.trim();
        if (content && !content.startsWith('[') && !content.startsWith('{')) {
            data = this.parseSimpleFormat(content);
            headers = this.dataset.headers?.split(',').map(h => h.trim()) || ['Column 1', 'Column 2', 'Column 3'];
        } else {
            // Fallback to JSON format
            try {
                data = JSON.parse(content || this.dataset.json || '[]');
                headers = this.dataset.headers
                    ? this.dataset.headers.split(',').map(h => h.trim())
                    : Object.keys(data[0] || {});
            } catch (e) {
                console.error('Invalid data in DataTable:', e);
                return;
            }
        }

        this.innerHTML = `
            <div class="overflow-x-auto">
                <div class="rounded-lg border border-slate-700 overflow-hidden inline-block max-w-full">
                    <table class="table-auto w-full text-left">
                        <thead>
                            <tr class="bg-slate-900/90">
                                ${headers.map(header =>
            `<th class="px-4 py-2">${this.capitalize(header)}</th>`
        ).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((row, index) => `
                                <tr class="bg-slate-900/${index % 2 === 0 ? '35' : '50'}">
                                    ${Array.isArray(row) ?
            row.map((cell, cellIndex) => `<td class="px-4 py-2">${this.formatCell(cell || '', cellIndex, headers[cellIndex])}</td>`).join('') :
            headers.map((header, cellIndex) => `<td class="px-4 py-2">${this.formatCell(row[header] || '', cellIndex, header)}</td>`).join('')
        }
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    parseSimpleFormat(content) {
        return content.split('\n').map(line => {
            return line.split('|').map(cell => cell.trim());
        }).filter(row => row.length > 1 && row[0] !== ''); // Filter out empty rows
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatCell(value, cellIndex, headerName) {
        if (typeof value !== 'string') return value;

        // Determine formatting based on column context
        const header = headerName ? headerName.toLowerCase() : '';

        // Format first column based on header type
        if (cellIndex === 0) {
            if (header.includes('method')) {
                // Method names - look for parentheses
                if (value.includes('(') && value.includes(')')) {
                    return `<code-field>${value}</code-field>`;
                }
            } else if (header.includes('enum')) {
                // Enum values - format anything that looks like Enum.VALUE
                if (value.includes('.') || value.match(/^[A-Z][a-zA-Z]*$/)) {
                    return `<code-field>${value}</code-field>`;
                }
            } else if (header.includes('integer') || header.includes('number')) {
                // Numbers/integers - format numeric values
                if (value.match(/^-?\d+$/) || value === '-1') {
                    return `<code-field>${value}</code-field>`;
                }
            } else if (header.includes('script')) {
                // Script class names - format anything that starts with "Scripted"
                if (value.startsWith('Scripted') || value.match(/^[A-Z][a-zA-Z]*$/)) {
                    return `<code-field>${value}</code-field>`;
                }
            }
        }

        // Format second column based on header type
        if (cellIndex === 1) {
            if (header.includes('kind')) {
                // MixinKind enum values - format anything with MixinKind. or looks like enum
                if (value.includes('MixinKind.') || value.includes('.')) {
                    return `<code-field>${value}</code-field>`;
                }
            }
        }

        // Format parameters column (second column with "param" in header)
        if ((cellIndex === 1 && header.includes('param')) || header.includes('string')) {
            // Parameters or string literals should be formatted as code
            return `<code-field>${value}</code-field>`;
        }

        // Format descriptions - be selective about what gets code formatting
        if (header.includes('description')) {
            // Only format specific code terms in backticks or known keywords
            value = value.replace(/`([^`]+)`/g, '<code-field>$1</code-field>');

            // Format specific Haxe/code keywords when they appear in isolation or with dots
            value = value.replace(/(^|\s|[(])(At\.RETURN|At\.INVOKE|At\.HEAD|At\.TAIL|Shift\.BEFORE|Shift\.AFTER|MixinKind\.Mixin|MixinKind\.SongMixin|MixinKind\.LevelMixin|MixinKind\.NoteStyleMixin|MixinKind\.PlayerMixin|MixinKind\.ConversationMixin|MixinKind\.DialogueBoxMixin|MixinKind\.SpeakerMixin|MixinKind\.AlbumMixin|MixinKind\.StageMixin|MixinKind\.StickerMixin|MixinKind\.FreeplayStyleMixin|MixinKind\.SongEventMixin|MixinKind\.NoteKindMixin)($|\s|[)]|,)/g, '$1<code-field>$2</code-field>$3');

            // Handle special formatting markers
            value = value.replace(/\{small\}(.*?)\{\/small\}/g, '<span class="text-sm">$1</span>');
            value = value.replace(/\{code\}(.*?)\{\/code\}/g, '<code-field>$1</code-field>');

            return value;
        }

        // Default: minimal formatting
        return value;
    }
}