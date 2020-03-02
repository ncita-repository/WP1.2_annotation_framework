import {projectTemplates} from "./defs";

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

export async function parseTemplate(idx) {
    let response = await fetch(projectTemplates[idx].url);
    let html = await response.text();
    await sleep(500);
    let template = fillTemplateFromHtml(html);
    // console.log(template);
    return html;
}

function fillTemplateFromHtml(html) {
    let template = {
        dcterms: [],
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
            let name = item.name.substring(8); //dcterms length + 1 for '.'
            let content = item.content;
            template.dcterms.push({name, content});
        }
    });

    // ToDo: parse and fill template_attributes
    // ToDo: parse template sections and html elements

    return template;
}