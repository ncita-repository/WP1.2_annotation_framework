import React from 'react';
import './App.css';
import TemplateSelectBar from "./ui/TemplateSelectBar";
import ReportView from "./ui/ReportView"
// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mainView: true,
            currentTemplate: {}
        };
        this.onShowReportView = this.onShowReportView.bind(this);
        this.onShowMainView = this.onShowMainView.bind(this);
    }

    onShowReportView = (template) => {
        this.setState({
            currentTemplate: template,
            mainView: false
        });
    };

    onShowMainView = () => {
        this.setState({
            currentTemplate: {},
            mainView: true
        });
    };

    render() {
        return (
            <Container className='App p-3' fluid>
                {this.state.mainView &&
                    <TemplateSelectBar showReportView = {this.onShowReportView}/>
                }
                {!this.state.mainView &&
                    <ReportView
                        template = {this.state.currentTemplate}
                        showMainView = {this.onShowMainView}
                    />
                }
            </Container>
        );
    }
}

export default App;
