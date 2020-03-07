import React from 'react';
import {projectTemplates} from "../utils/defs";
import {parseMrrtTemplate} from "../utils/mrrt_parser";
import {trackPromise} from "react-promise-tracker";
import { usePromiseTracker } from 'react-promise-tracker';
import Loader from 'react-promise-loader';
// Bootstrap imports
import Jumbotron from "react-bootstrap/Jumbotron";
import Row from "react-bootstrap/Row";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";

const TemplateInfoModal = (props) => {
    let infoTable = '';
    if ('dcterms' in props.template) {
        const infoList = props.template.dcterms.map((item, key) => {
            return (
                <tr key={key}>
                    <td>{item.name}</td>
                    <td>{item.content}</td>
                </tr>
            )
        });
        infoTable =
            <Table striped bordered hover size='sm' className='mb-0'>
                <tbody>
                    {infoList}
                </tbody>
            </Table>
    }
    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size='lg'
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {props.template.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Template info</h5>
                {infoTable}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

class TemplateSelectBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            selectedIdx: 0,
            currentTemplate: {},
            showInfo: false
        };

        this.selectTemplate = this.selectTemplate.bind(this);
        this.showTemplateInfo = this.showTemplateInfo.bind(this);
    }

    selectTemplate = (e) => {
        const idx = e.target.selectedIndex;
        this.setState({
            selectedIdx: idx
        });
        if (idx !== 0) {
            trackPromise(
                parseMrrtTemplate(idx - 1)
                    .then((template) => {
                        this.setState({
                            currentTemplate: template
                        })
                    })
            );
        } else {
            this.setState({
                currentTemplate: {}
            });
        }
    };

    showTemplateInfo () {
        this.setState(state => ({
            showInfo: !state.showInfo
        }));
    }

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
            <React.Fragment>
                <Jumbotron>
                    <h2>MRRT report rendering using React</h2>
                    <Row className='p-3'>
                        <select onChange={this.selectTemplate} className='mr-2'>
                            {templateList}
                        </select>
                        {this.state.selectedIdx !== 0 &&
                            <ButtonToolbar>
                                <Button id='showInfo' onClick={this.showTemplateInfo} variant='outline-info' className='mr-2' size='sm'>
                                    <strong>i</strong>
                                </Button>
                                <Button variant='primary' size='sm'>Fill case report</Button>
                            </ButtonToolbar>
                        }
                    </Row>
                    <Row>
                        <Loader promiseTracker={usePromiseTracker} />
                    </Row>
                </Jumbotron>
                <TemplateInfoModal
                    show={this.state.showInfo}
                    onHide={this.showTemplateInfo}
                    template={this.state.currentTemplate}
                />
            </React.Fragment>
        );
    }
}
export default TemplateSelectBar;