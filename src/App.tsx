import React from 'react';
import SFMap from './components/SFMap/SFMap';
import Navbar from 'react-bootstrap/Navbar';

function App() {
    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#home">
                    <img alt="wsds" src="./logo.svg" width="30" height="30" className="d-inline-block align-top" /> San
                    Francisco Food Truck Explorer
                </Navbar.Brand>
            </Navbar>
            <SFMap />
        </div>
    );
}

export default App;
