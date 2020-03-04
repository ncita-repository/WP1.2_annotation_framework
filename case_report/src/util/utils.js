import {projectTemplates} from "./defs";

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

export async function parseTemplate(idx) {
    let response = await fetch(projectTemplates[idx].url);
    let html = await response.text();
    await sleep(0);
    // fill template meta
    let template = fillTemplateMetaFromHtml(html);
    // set template title
    template.title = projectTemplates[idx].name;
    const titleObj = template.dcterms.find(item => item.name === 'title');
    if (titleObj != null) {
        template.title = titleObj.content;
    }
    console.log('template.title: ' + template.title);
    return template;
}

function fillTemplateMetaFromHtml(html) {
    let template = {
        dcterms: [],
        title: '',
        template_attributes: {
            coded_content: {
                coding_schemes: [],
                entries: []
            }
        }
    };
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // parse and fill dcterms (Dublin Core Metadata Elements in template object)
    const metaElements = Array.from(doc.head.getElementsByTagName('meta'));
    metaElements.forEach((item) => {
        if (item.name.startsWith('dcterms')) {
            let name = item.name.substring(8); //dcterms. prefix length
            let content = item.content;
            template.dcterms.push({name, content});
        }
    });

    // parse and fill template_attributes
    const scriptElements = Array.from(doc.scripts);
    let foundTemplateAttributes = scriptElements.some((item) => {
        if (item.type === 'text/xml') {
            // reconstruct the xml text
            const xmlText = '<?xml version="1.0" encoding="UTF-8"?><doc>' + item.text + '</doc>';
            const xmlParser = new DOMParser();
            const xmlDoc = xmlParser.parseFromString(xmlText, "text/xml");
            const templateAttributes = xmlDoc.getElementsByTagName('template_attributes')[0];
            // return if template_attributes does not exist
            if (templateAttributes == null) {
                return false;
            }
            // parse template_attributes
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
                        template.template_attributes.coded_content.coding_schemes.push(codingSchema);
                    });
                });
                // parse entries
                const entries = Array.from(codedContent.getElementsByTagName('entry'));
                entries.forEach((item) => {
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

                    template.template_attributes.coded_content.entries.push(entry);
                });
            }
            //console.log('scriptElements: ' + item.outerHTML);
            // templateAttributes.childNodes.forEach((item0) => {
            //     if (item0.tagName === 'coded_content') {
            //         // console.log(item0.childNodes);
            //     }
            // });
            // const codedContent = templateAttributes.childNodes;
            // console.log(templateAttributes.getElementsByTagName('coded_content'));
            return true;
        }

        return false;
    });
    console.log('scriptElements: ' + foundTemplateAttributes);

    // ToDo: parse template sections and html elements

    return template;
}