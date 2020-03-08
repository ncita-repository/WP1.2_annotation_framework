import React from "react";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";

class ReportView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSubmitReport = this.onSubmitReport.bind(this);
    }

    onSubmitReport = (e) => {
        e.preventDefault();
        alert('ToDo: handle report submission');
        this.props.showMainView();
    };

    render() {
        const {sections} = this.props.template;
        const sectionList = sections.map((section, key) => {
            return (
                <Tab key={key} eventKey={key} title={section.title} className='CaseFormTab p-3'>
                    {
                        section.paragraphs.map((p, key) => {
                            return (
                                <div key={key} dangerouslySetInnerHTML={{__html: p.fields}} />
                            )
                        })
                    }
                </Tab>
            )
        });
        return (
            <React.Fragment>
                <div className='CaseForm p-3'>
                    <div className='pt-3 pb-3'>
                        <h3>{this.props.template.title}</h3>
                    </div>
                    <div className='d-flex flex-row'>
                        <Form>
                            <Tabs id='case-form-tabs' defaultActiveKey={0} variant='pills'>
                                {sectionList}
                            </Tabs>
                            <div className='pt-3 float-right'>
                                <ButtonToolbar>
                                    <Button id='submitReport'
                                            onClick={this.onSubmitReport}
                                            type='submit'
                                            variant='info' className='mr-2' size='sm'>
                                        Submit report
                                    </Button>
                                    <Button id='returnToTemplates'
                                            onClick={this.props.showMainView}
                                            variant='outline-info' size='sm'>
                                        Return to templates list
                                    </Button>
                                </ButtonToolbar>
                            </div>
                        </Form>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default ReportView;