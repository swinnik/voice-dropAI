// src/App.js
import React from 'react';
import './App.css';
import FileUpload from './components/FileUpload';

function App() {
    return (
        <div className="App" 
        style={{
            display: 'flex',
            height: '100vh',
            width: 'auto',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'blue'
        }}>
          
            <FileUpload />
        </div>
    );
}

export default App;
//68379408fb054456a2760b3c6e4e9cad