import {CodeField} from "./ui_elements/codeField.js";
import {CodeBlock} from "./ui_elements/codeBlock.js";
import {TipBlock} from "./ui_elements/tipBlock.js";
import {NoteBlock} from "./ui_elements/noteBlock.js";
import {DocLink} from "./ui_elements/docLink.js";
import {DataTable} from "./ui_elements/dataTable.js";

window.customElements.define('tip-block', TipBlock);
window.customElements.define('note-block', NoteBlock);
window.customElements.define('code-field', CodeField);
window.customElements.define('code-block', CodeBlock);
window.customElements.define('doc-link', DocLink);
window.customElements.define('data-table', DataTable);
