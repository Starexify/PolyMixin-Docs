export class CodeBlock extends HTMLElement {
    connectedCallback() {
        const text = this.textContent.trim();
        const language = this.getAttribute('language') || 'haxe';

        // Create pre and code elements for Prism
        const pre = document.createElement('pre');
        pre.className = `language-${language} bg-slate-900 rounded-lg shadow-lg overflow-x-auto`;

        const code = document.createElement('code');
        code.className = `language-${language}`;
        code.textContent = text;

        pre.appendChild(code);

        // Clear and add the formatted code
        this.innerHTML = '';
        this.appendChild(pre);

        // Apply syntax highlighting
        if (window.Prism) {
            window.Prism.highlightElement(code);
        } else {
            // Wait for Prism to load
            document.addEventListener('DOMContentLoaded', () => {
                if (window.Prism) {
                    window.Prism.highlightElement(code);
                }
            });
        }
    }
}
