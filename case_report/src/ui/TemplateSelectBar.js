import React from 'react';
import {projectTemplates} from "../util/defs";
import {parseTemplate} from "../util/utils";
import {trackPromise} from "react-promise-tracker";
import { usePromiseTracker } from 'react-promise-tracker';
import Loader from 'react-promise-loader';
// Bootstrap imports
import Jumbotron from "react-bootstrap/Jumbotron";
import Row from "react-bootstrap/Row";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Button from "react-bootstrap/Button";

const hello = () => {
    let str = 'template html';
    fetch(projectTemplates[0].url)
        .then(response => response.text())
        .then((data) => {
            console.log(data)
        });
    let parser = new DOMParser();
    return str;
};

class TemplateSelectBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            selectedIdx: 0,
            selectedTemplate: {}
        };

        this.selectTemplate = this.selectTemplate.bind(this);
    }

    selectTemplate = (e) => {
        const idx = e.target.selectedIndex;
        this.setState({
            selectedIdx: idx
        });
        if (idx !== 0) {
            // let html = parseTemplate(idx - 1);
            // console.log('Select template func: ' + html);
            // this.setState({
            //     selectedTemplate: html
            // });
            trackPromise(
                parseTemplate(idx - 1)
                    .then((template) => {
                        this.setState({
                            selectedTemplate: template
                        })
                    })
            );
        } else {
            this.setState({
                selectedTemplate: {}
            });
        }
    };

    componentDidMount() {
        this.setState({
            templates: projectTemplates
        });
     }

    render() {
        const {templates} = this.state;
        let templateList = templates.map((item) => {
            return (
                <option key={item.id} value={item.url}>{item.name}</option>
            )}
        );
        templateList.unshift(
            <option key={-1} value=''>Select a template</option>
        );

        return (
            <Jumbotron>
                <h2>MRRT report rendering using React</h2>
                <Row className='p-3'>
                    <select onChange={this.selectTemplate} className='mr-2'>
                        {templateList}
                    </select>
                    {this.state.selectedIdx !== 0 &&
                        <ButtonToolbar>
                            <Button variant='outline-info' className='mr-2' size='sm'><strong>i</strong></Button>
                            <Button variant='primary' size='sm'>Fill case report</Button>
                        </ButtonToolbar>
                    }
                </Row>
                <Row>
                    <Loader promiseTracker={usePromiseTracker} />
                </Row>
            </Jumbotron>
        );
    }
}
export default TemplateSelectBar;