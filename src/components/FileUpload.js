// src/components/FileUpload.js
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';

const FileUpload = () => {
    const [loading, setLoading] = useState(false);
    const fileInputRef=useRef(null)

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        processCSVFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        processCSVFiles(selectedFiles);
    }

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve,ms))
    }

    const processCSVFiles = async (files) => {
        setLoading(true);
        for (const file of files) {
            await new Promise((resolve) => {
                Papa.parse(file, {
                    complete: async (result) => {
                        await createAudioFiles(result.data, file.name);
                        resolve();
                    }
                });
            });
            
        } 
        setLoading(false);
    };

    const createAudioFiles = async (data, fileName) => {
        const zip = new JSZip();
        const apiKey = process.env.REACT_APP_AZURE_API_KEY; // Replace with your Azure API key
            console.log(apiKey)
        const endpointUrl = 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1';

        for (let i = 1; i < data.length; i++) {
            const text = data[i][2]; // Text is in column C (index 2)
            const name = data[i][1]; // Name is in column B (index 1)
            const property = data[i][0]; // Property is in column A (index 0)

            if (text && property === "Text") {
                const audioContent = await callTextToSpeechAPI(text, apiKey, endpointUrl);
                zip.file(`${name}_${text.substring(0, 15)}.wav`, audioContent);
                await sleep(250);
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${fileName}.zip`);
    };

    const callTextToSpeechAPI = async (text, apiKey, endpointUrl) => {
        const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>${text}</voice></speak>`;
        const headers = {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm'
        };

        const response = await axios.post(endpointUrl, ssml, { headers, responseType: 'arraybuffer' });
        return response.data;
    };

    return (
        <div
            style={{
                border: '2px dashed #ccc',
                borderRadius: '5px',
                padding: '20px',
                height: '80vh',
                backgroundColor: loading ? 'lightblue' : 'blue',
                justifyItems: 'center',
                alignContent: 'center',
                width: '80vw',
                fontFamily: 'sans-serif',
                fontSize: '30px',
                color: 'grey',
                animation: loading ? 'glisten 3s infinite' : 'none',
                cursor: 'pointer',
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleClick}
        >
            <input 
                type="file" 
                accept=".csv"
                style = {{display: 'none'}} 
                ref={fileInputRef}
                onChange={handleFileSelect}
            />
            <p>{loading ? 'Converting...' : 'Convert your .csv to a .zip full of audio clips'}</p>
            <span>{loading ? '' : 'Simply drag and drop your CSV files here'}</span>
        </div>
    );
};

export default FileUpload;
