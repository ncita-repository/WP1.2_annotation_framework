
export const projectTemplates = [
    {id: 1, name: 'Rad Chest 2 Views', url: 'templates/Rad Chest 2 Views.html'}
];

/* Additional metadata attributes may be associated with each report template
    in the template_attributes element. Defined in Table 8.1.1-2
 */
export const MrrtTemplateAttributes = [
    'top-level-flag',
    'status',
    'user-list',
    'provider-group-list',
];

export function MrrtTemplate(title = '') {
    this.dcterms = [];
    this.title = title;
    this.templateAttributes = {
        meta: {},
        templateTerms: [], // coded content applicable to the entire template
        templateCodingSchemas: [],
        codedContent: {
            codingSchemes: [],
            entries: []
        }
    };
    this.sections = [];
}

export function MrrtSection() {
    this.atts = {};
    this.level = 1;
    this.title = '';
    this.code = {};
    this.paragraphs = []; // paragraph elements
}

export function MrrtParagraph() {
    this.atts = {};
    this.fields = '';
}