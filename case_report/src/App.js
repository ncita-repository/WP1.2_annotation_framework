import React from 'react';
import './App.css';
import TemplateSelectBar from "./ui/TemplateSelectBar";
// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";

function App() {
  return (
      <Container className='App p-3' fluid={true}>
          <TemplateSelectBar />
      </Container>
  );
}

export default App;
