import {projectTemplates, MrrtTemplateAttributes, MrrtTemplate,
    MrrtSection, MrrtParagraph} from "./defs";
import {Result} from "./utils";

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

export async function parseMrrtTemplate(idx) {
    let response = await fetch(projectTemplates[idx].url);
    let html = await response.text();
    await sleep(0);
    // template object
    let template = new MrrtTemplate(projectTemplates[idx].name);
    // html parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // fill template meta
    let res = fillTemplateMetaFromHtml(doc, template);
    if (res.success) {
        // set template title
        const titleObj = template.dcterms.find(item => item.name === 'title');
        if (titleObj != null) {
            template.title = titleObj.content;
        }
        // parse template sections and html elements
        res = fillTemplateBodyFromHtml(doc, template);
    }

    // ToDo: handle errors
    return template;
}

function fillTemplateMetaFromHtml(doc, template) {
    /* parse and fill dcterms (Dublin Core Metadata Elements in template object)
        8.1.1 Template Attributes
     */
    Array.from(doc.head.getElementsByTagName('meta')).forEach((item) => {
        if ('name' in item) {
            if (item.name.startsWith('dcterms')) {
                let name = item.name.substring(8); //dcterms. prefix length
                let content = item.content;
                template.dcterms.push({name, content});
            }
        }
    });

    if (!template.dcterms.length) {
        return new Result(
            false,
            'Template metadata is missing');
    }

    /* The head element shall contain [1..1] script element containing coded content.
       - The script element shall be assigned a type attribute of "text/xml".
       - The script element shall contain [1..1] template_attributes element.
     */
    // parse and fill template_attributes
    const foundTemplateAttributes = Array.from(doc.scripts).some((item) => {
        if (item.type === 'text/xml') {
            // reconstruct the xml text
            const xmlText = '<?xml version="1.0" encoding="UTF-8"?><docs>' + item.text + '</docs>';
            const xmlParser = new DOMParser();
            const xmlDoc = xmlParser.parseFromString(xmlText, "text/xml");
            const templateAttributes = xmlDoc.getElementsByTagName('template_attributes')[0];
            // return if template_attributes does not exist
            if (templateAttributes == null) {
                return false;
            }

            /* The template_attributes element may contain [0..*] of the non-Dublin Core
                metadata elements specified in Table 8.1.1-2, such as status and top-level-flag.
             */
            MrrtTemplateAttributes.forEach((item) => {
                const meta = templateAttributes.getElementsByTagName(item)[0];
                if (meta != null) {
                    template.templateAttributes.meta[item] = meta.textContent.trim();
                }
            });

            /* The template_attributes element contains coded content linked to specific
                elements in the body of the template.
               - The coded_content may contain [0..1] coding_schemes element.
               - The coding_schemes shall contain one or more [1..*] coding_scheme elements.
               - Each coding_scheme shall contain exactly one name attribute and one designator attribute.
             */
            Array.from(templateAttributes.getElementsByTagName('coding_schemes')).forEach((codingSchemes) => {
                if (codingSchemes.parentElement === templateAttributes) {
                    console.log(codingSchemes);
                    Array.from(codingSchemes.getElementsByTagName('coding_scheme')).forEach((item) => {
                        let codingSchema = {};
                        item.getAttributeNames().forEach((attr) => {
                            codingSchema[attr] = item.getAttribute(attr);
                        });
                        template.templateAttributes.templateCodingSchemas.push(codingSchema);
                    });
                }
            });

            /* The template_attributes element may contain [0..*] term elements
                containing additional coded content applicable to the entire template
                that cannot be represented in Dublin Core attributes.
                - Term elements may be assigned a type attribute indicating the template
                    attribute for which the term tuple is the value.
                - Each term element shall contain exactly one code element.
                - Each code element shall contain exactly one meaning attribute,
                    one scheme attribute, and one value attribute.
             */
            Array.from(templateAttributes.getElementsByTagName('term')).forEach((item) => {
                if (item.parentElement === templateAttributes) {
                    let term = {};
                    item.getAttributeNames().forEach((attr) => {
                        term[attr] = item.getAttribute(attr);
                    });
                    // parse code
                    Array.from(item.getElementsByTagName('code')).forEach((item) => {
                        term['code'] = {};
                        item.getAttributeNames().forEach((attr) => {
                            term.code[attr] = item.getAttribute(attr);
                        });
                    });
                    template.templateAttributes.templateTerms.push(term);
                }
            });

            /* The template_attribtes element shall contain [1..1] coded_content element.
               - The coded_content element contains coded content linked to specific
                    elements in the body of the template.
               - The coded_content may contain [0..1] coding_schemes element.
               - The coding_schemes shall contain one or more [1..*] coding_scheme elements.
               - Each coding_scheme shall contain exactly one name attribute and one designator attribute.
             */
            const codedContent = templateAttributes.getElementsByTagName('coded_content')[0];
            if (codedContent != null) {
                // parse coding schemas
                const codingSchemes = Array.from(codedContent.getElementsByTagName('coding_schemes'));
                codingSchemes.forEach((item) => {
                    Array.from(item.getElementsByTagName('coding_scheme')).forEach((item) => {
                        let codingSchema = {};
                        item.getAttributeNames().forEach((attr) => {
                            codingSchema[attr] = item.getAttribute(attr);
                        });
                        template.templateAttributes.codedContent.codingSchemes.push(codingSchema);
                    });
                });
                /* The coded_content element may contain [0..*] entry elements.
                   - Each entry element shall contain an ORIGTXT attribute whose value
                        matches the id attribute of an element in the body to which the coded
                        content in the entry applies.
                   - Each entry shall contain [1..*] term element, and each term element shall
                        contain exactly one code. Each code element shall contain exactly one
                        meaning attribute, one scheme attribute, and one value attribute.
                   - Term elements may be assigned a type attribute indicating the template
                        attribute for which the term tuple is the value.
                 */
                // parse entry elements
                Array.from(codedContent.getElementsByTagName('entry')).forEach((item) => {
                    let entry = {};
                    item.getAttributeNames().forEach((attr) => {
                        entry[attr] = item.getAttribute(attr);
                    });
                    // parse term node
                    Array.from(item.getElementsByTagName('term')).forEach((item) => {
                        entry['term'] = {};
                        // parse code
                        Array.from(item.getElementsByTagName('code')).forEach((item) => {
                            entry.term['code'] = {};
                            item.getAttributeNames().forEach((attr) => {
                                entry.term.code[attr] = item.getAttribute(attr);
                            });
                        });
                    });

                    template.templateAttributes.codedContent.entries.push(entry);
                });
            }
            return true;
        }

        return false;
    });

    if (!foundTemplateAttributes) {
        return new Result(
            false,
            'Template attribute data is missing');
    }

    return new Result();
}

function fillTemplateBodyFromHtml(doc, template) {
    /* The body element shall contain [1..*] section element.
        - Each section element shall contain [1..1] header element.
        - The header element shall contain [1..1] class attribute indicating the section level.
            The value of the attribute shall be the string "level" followed by an integer indicating
            the nesting level (e.g.,"level1").
        - The header element may contain the title text for the section.
     */
    // parse sections and their child elements
    Array.from(doc.body.getElementsByTagName('section')).forEach((_section) => {
        // parse immediate section elements
        if (_section.parentElement === doc.body) {
            let section = new MrrtSection();
            // parse section attributes - 8.1.2 Section Attributes
            _section.getAttributeNames().forEach((attr) => {
                section.atts[attr] = _section.getAttribute(attr);
            });
            // set section title
            section.title = _section.dataset.sectionName;
            // parse header element
            const header = _section.getElementsByTagName('header')[0];
            if (header != null) {
                const level = header.getAttribute('class');
                if (level != null) {
                    section.level = parseInt(level.substring(5)); //remove level
                }
            }
            // assign section code
            if (_section.id != null) {
                section.code = findElementCode(template.templateAttributes, _section.id);
            }
            /* 8.1.3 Report Template Fields
               - Each section element shall contain [1..*] paragraph (p) element containing the section content.
               - Fields shall be described only using the HTML select or input [or textarea] elements
                    shown in Table 8.1.3-1
               - Table 8.1.3.1-1 shows the attributes associated with fields of any type.
             */
            // parse paragraph elements
            Array.from(_section.getElementsByTagName('p')).forEach((_paragraph) => {
                let paragraph = new MrrtParagraph();
                // fill paragraph attributes
                _paragraph.getAttributeNames().forEach((attr) => {
                    paragraph.atts[attr] = _paragraph.getAttribute(attr);
                });
                // fill paragraph fields
                paragraph.fields = _paragraph.outerHTML.trim();
                section.paragraphs.push(paragraph);
            });
            template.sections.push(section);
        }
    });

    return new Result();
}

function findElementCode(templateAttributes, id) {
    let code = {};
    const entry = templateAttributes.codedContent.entries.find((item) => {
        return item.origtxt === id;
    });
    if (entry != null) {
        code = entry.term.code;
    }
    return code;
}