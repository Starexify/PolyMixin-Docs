export class CodeBlock extends HTMLElement {
    connectedCallback() {
        const text = this.textContent.trim();
        const language = this.getAttribute('language') || 'haxe';

        // Create container for the entire code block
        const container = document.createElement('div');
        container.className = `bg-slate-900 rounded-lg shadow-lg overflow-hidden font-mono leading-relaxed relative group`;

        // Create wrapper for line numbers and code
        const codeWrapper = document.createElement('div');
        codeWrapper.className = 'flex overflow-x-auto';

        // Create line numbers container
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'bg-black/20 text-slate-400 text-right px-3 pr-5 py-4 border-r border-slate-700 min-w-fit';

        // Create code container
        const codeContainer = document.createElement('div');
        codeContainer.className = 'flex-1 overflow-x-auto';

        const pre = document.createElement('pre');
        pre.className = `p-4 m-0 overflow-visible`;

        const code = document.createElement('code');
        code.className = `block text-gray-100`;

        // Split code into lines and add line numbers
        const lines = text.split('\n');
        const maxLineNumber = lines.length;
        const lineNumberWidth = maxLineNumber.toString().length;

        // Generate line numbers
        const lineNumbersHtml = lines.map((_, index) => {
            const lineNum = (index + 1).toString().padStart(lineNumberWidth, ' ');
            return `<div class="leading-relaxed">${lineNum}</div>`;
        }).join('');
        lineNumbers.innerHTML = lineNumbersHtml;

        // Apply custom syntax highlighting
        const highlightedCode = SyntaxHighlighter.highlightCode(text, language);
        code.innerHTML = highlightedCode;

        pre.appendChild(code);
        codeContainer.appendChild(pre);

        // Assemble the structure
        codeWrapper.appendChild(lineNumbers);
        codeWrapper.appendChild(codeContainer);
        container.appendChild(codeWrapper);

        // Add language label
        const langLabel = document.createElement('div');
        langLabel.textContent = language;
        langLabel.className = 'absolute top-1 right-1 text-slate-500 px-2 py-0.5 text-xs font-semibold opacity-70 select-none transition-opacity duration-300 group-hover:opacity-0';
        container.appendChild(langLabel);

        // Clear and add the formatted code
        this.innerHTML = '';
        this.appendChild(container);

        // Add copy button
        this.addCopyButton(container, text);
    }

    addCopyButton(container, originalText) {
        const copyButton = document.createElement('button');
        copyButton.className = 'absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white p-1 rounded text-xs font-medium transition-colors opacity-0 hover:cursor-pointer group-hover:opacity-100';

        const copyIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        copyIcon.setAttribute("viewBox", "0 0 24 24");
        copyIcon.setAttribute("fill", "none");
        copyIcon.setAttribute("stroke", "currentColor");
        copyIcon.setAttribute("stroke-width", "1.5");
        copyIcon.setAttribute("class", "size-7");
        copyIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"></path>`;

        const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        checkIcon.setAttribute("viewBox", "0 0 24 24");
        checkIcon.setAttribute("fill", "none");
        checkIcon.setAttribute("stroke", "#28b128");
        checkIcon.setAttribute("stroke-width", "1.5");
        checkIcon.setAttribute("class", "size-7");
        checkIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>`;

        copyButton.appendChild(copyIcon);

        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(originalText);
                copyButton.replaceChild(checkIcon, copyIcon);
                setTimeout(() => {
                    copyButton.replaceChild(copyIcon, checkIcon);
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });

        container.appendChild(copyButton);
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
        functions: /\b(?!if\b|for\b|while\b|switch\b|catch\b|else\b|return\b|function\b)([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,

        // Annotations/Metadata
        annotations: /@:[a-zA-Z_][a-zA-Z0-9_]*|\(|\)/g,

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

        /// Process in order of precedence
        // Comments
        highlighted = highlighted.replace(this.haxeTokens.comments, (match, offset) => {
            const id = `__COMMENT_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-gray-500">${this.escapeHtml(match)}</span>` });
            return id;
        });

        // Annotations
        highlighted = highlighted.replace(/@:[a-zA-Z_][a-zA-Z0-9_]*\([^\)]*\)/g, (match) => {
            const id = `__ANNOTATION_${tokens.length}__`;

            // Optional: color name vs parentheses differently
            const nameMatch = match.match(/^@:[a-zA-Z_][a-zA-Z0-9_]*/)[0];
            const parensMatch = match.slice(nameMatch.length);

            const replacement = `<span class="text-red-400">${this.escapeHtml(nameMatch)}</span>${this.escapeHtml(parensMatch)}`;
            tokens.push({ id, replacement });
            return id;
        });

        // Strings
        highlighted = highlighted.replace(this.haxeTokens.strings, (match) => {
            const id = `__STRING_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-cyan-200">${this.escapeHtml(match)}</span>` });
            return id;
        });

        // Function
        highlighted = highlighted.replace(this.haxeTokens.functions, (match, offset) => {
            const id = `__FUNCTION_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-purple-400">${this.escapeHtml(match)}</span>` });
            return id;
        });

        // Keywords
        highlighted = highlighted.replace(this.haxeTokens.keywords, (match, offset) => {
            const id = `__KEYWORD_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-red-400 font-semibold">${this.escapeHtml(match)}</span>` });
            return id;
        });

        // Types
        highlighted = highlighted.replace(this.haxeTokens.types, (match, offset) => {
            const id = `__TYPE_${tokens.length}__`;
            tokens.push({ id, replacement: `<span class="text-amber-500">${this.escapeHtml(match)}</span>` });
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

        highlighted = this.escapeHtml(highlighted);
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
