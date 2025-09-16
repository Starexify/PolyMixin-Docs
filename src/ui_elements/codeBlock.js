export class CodeBlock extends HTMLElement {
    connectedCallback() {
        const text = this.textContent.trim();
        const language = this.getAttribute('language') || 'haxe';

        // Create pre and code elements
        const pre = document.createElement('pre');
        pre.className = `bg-slate-900 rounded-lg shadow-lg overflow-x-auto p-4 font-mono leading-relaxed`;

        const code = document.createElement('code');
        code.className = `block text-gray-100`;

        // Apply custom syntax highlighting
        const highlightedCode = SyntaxHighlighter.highlightCode(text, language);
        code.innerHTML = highlightedCode;

        pre.appendChild(code);

        // Clear and add the formatted code
        this.innerHTML = '';
        this.appendChild(pre);

        // Add copy button
        this.addCopyButton(text);
    }

    addCopyButton(originalText) {
        const copyButton = document.createElement('button');
        copyButton.className = 'absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white p-1 rounded text-xs font-medium transition-colors opacity-0 hover:cursor-pointer group-hover:opacity-100';

        const copyIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        copyIcon.setAttribute("viewBox", "0 0 24 24");
        copyIcon.setAttribute("fill", "none");
        copyIcon.setAttribute("stroke", "currentColor");
        copyIcon.setAttribute("stroke-width", "1.5");
        copyIcon.setAttribute("class", "size-5");
        copyIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"></path>`;

        const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        checkIcon.setAttribute("viewBox", "0 0 24 24");
        checkIcon.setAttribute("fill", "none");
        checkIcon.setAttribute("stroke", "currentColor");
        checkIcon.setAttribute("stroke-width", "1.5");
        checkIcon.setAttribute("class", "size-5 text-green-500");
        checkIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>`;

        copyButton.appendChild(copyIcon);

        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(originalText);
                copyButton.replaceChild(checkIcon, copyIcon); // swap icon
                setTimeout(() => {
                    copyButton.replaceChild(copyIcon, checkIcon); // revert back
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });

        // Make parent relative and add group class for hover effect
        this.classList.add('relative', 'group');
        this.appendChild(copyButton);
    }
}

// Custom syntax highlighter for Haxe and other languages
class SyntaxHighlighter {
    static haxeTokens = {
        // Keywords
        keywords: /\b(abstract|as|break|case|cast|catch|class|continue|default|do|dynamic|else|enum|extends|extern|false|final|for|function|if|implements|import|in|inline|interface|macro|new|null|override|package|private|public|return|static|super|switch|this|throw|true|try|typedef|untyped|using|var|while)\b/g,

        // Types (including custom types)
        types: /\b(Int|Float|String|Bool|Array|Map|Dynamic|Void|Any|ScriptEvent|ScriptedEvent|Mixins|PolyMixin|MixinAnnotationProcessor)\b/g,

        // Strings
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,

        // Comments
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,

        // Numbers
        numbers: /\b\d+(?:\.\d+)?\b/g,

        // Functions/Methods
        functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,

        // Annotations/Metadata
        annotations: /@:?[a-zA-Z_][a-zA-Z0-9_]*/g,

        // Operators
        operators: /[+\-*\/=<>!&|%^~?:]+/g,

        // Brackets and punctuation
        punctuation: /[{}[\]();,\.]/g
    };
    static jsonTokens = {
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        numbers: /\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g,
        booleans: /\b(true|false|null)\b/g,
        punctuation: /[{}[\]:,]/g
    };

    static highlightHaxe(code) {
        // Store original positions to avoid conflicts
        let highlighted = code;
        const tokens = [];

        // Process in order of precedence
        highlighted = highlighted.replace(this.haxeTokens.comments, (match, offset) => {
            const id = `__COMMENT_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-gray-500">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.strings, (match, offset) => {
            const id = `__STRING_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-cyan-200">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.annotations, (match, offset) => {
            const id = `__ANNOTATION_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-yellow-400">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.keywords, (match, offset) => {
            const id = `__KEYWORD_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-red-400 font-semibold">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.types, (match, offset) => {
            const id = `__TYPE_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-amber-500">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.functions, (match, offset) => {
            const id = `__FUNCTION_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-purple-400">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.numbers, (match, offset) => {
            const id = `__NUMBER_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-orange-400">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.operators, (match, offset) => {
            const id = `__OPERATOR_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-gray-300">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.haxeTokens.punctuation, (match, offset) => {
            const id = `__PUNCT_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-gray-300">${this.escapeHtml(match)}</span>` });
            return id;
        });

        // Escape remaining HTML and restore tokens
        highlighted = this.escapeHtml(highlighted);

        // Replace tokens with highlighted versions
        tokens.forEach(token => {
            highlighted = highlighted.replace(new RegExp(token.id, 'g'), token.replacement);
        });

        return highlighted;
    }

    static highlightJson(code) {
        let highlighted = code;
        const tokens = [];

        highlighted = highlighted.replace(this.jsonTokens.strings, (match) => {
            const id = `__STRING_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-blue-300">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.jsonTokens.numbers, (match) => {
            const id = `__NUMBER_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-orange-400">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.jsonTokens.booleans, (match) => {
            const id = `__BOOLEAN_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-purple-400">${this.escapeHtml(match)}</span>` });
            return id;
        });

        highlighted = highlighted.replace(this.jsonTokens.punctuation, (match) => {
            const id = `__PUNCT_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-gray-300">${this.escapeHtml(match)}</span>` });
            return id;
        });

        // Escape remaining HTML and restore tokens
        highlighted = this.escapeHtml(highlighted);

        tokens.forEach(token => {
            highlighted = highlighted.replace(new RegExp(token.id, 'g'), token.replacement);
        });

        return highlighted;
    }

    static highlightCode(code, language) {
        switch (language.toLowerCase()) {
            case 'haxe':
                return this.highlightHaxe(code);
            case 'json':
                return this.highlightJson(code);
            default:
                return this.escapeHtml(code);
        }
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
