// components/UploadForm.js

"use client";
import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/UploadForm.module.css'; 
import Image from 'next/image';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [unit, setUnit] = useState('px');
    const [format, setFormat] = useState('PNG');
    const [dpi, setDPI] = useState(300); 
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [targetSizeKB, setTargetSizeKB] = useState(''); 
    const [removeBg, setRemoveBg] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.onload = () => {
                    setImageDimensions({ width: img.width, height: img.height });
                    setWidth(img.width);
                    setHeight(img.height);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const convertToPixels = (value, unit, dpi) => {
        switch (unit) {
            case 'inches':
                return value * dpi;
            case 'cm':
                return (value * dpi) / 2.54;
            case 'mm':
                return (value * dpi) / 25.4;
            default:
                return value; // pixels
        }
    };

    const validateDimensions = (width, height, imageDimensions) => {
        const imgWidth = imageDimensions.width;
        const imgHeight = imageDimensions.height;

        return width <= imgWidth && height <= imgHeight;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProcessedImage(null);
        setError('');

        const newWidth = convertToPixels(parseFloat(width), unit, dpi);
        const newHeight = convertToPixels(parseFloat(height), unit, dpi);

        if (!validateDimensions(newWidth, newHeight, imageDimensions)) {
            setError('Width and height must not exceed the dimensions of the uploaded image.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('width', newWidth);
        formData.append('height', newHeight);
        formData.append('format', format);
        formData.append('size_kb', targetSizeKB); 
        formData.append('remove_bg', removeBg); 
        console.log(formData)
        try {
            const response = await axios.post('http://localhost:5000/process_image', formData, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([response.data]));
            setProcessedImage(url);
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            <div className={styles.uploadForm}>
                <form onSubmit={handleSubmit}>
                    <h1 className={styles.heading}>Image Processing Form</h1>
                    <div
                        className={`${styles.uploadArea} ${dragOver ? styles.uploadAreaDragover : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => document.getElementById('image').click()}
                    >
                        <input
                            type="file"
                            id="image"
                            className={styles.hiddenInput}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <Image
                            src="/svgviewer-png-output(3).png"
                            alt="logo"
                            height={30}
                            width={30}
                            // onClick={() => }
                            style={{ cursor: "pointer", filter: "invert(1)" }}
                        />
                        <h4>Upload Image</h4>
                        <p className={styles.uploadAreaText}>
                            {file ? `File selected: ${file.name}` : 'Drag & drop files here to upload. We only accept JPG, JPEG, PNG & PDF images.'}
                        </p>
                    </div>
                    {file && (
                        <div className={styles.imgSize}>
                            <p>Image Size: {imageDimensions.width} x {imageDimensions.height}px</p>
                        </div>
                    )}
                    <div style={{ display: "flex", gap:"10px",padding:"5px",textAlign:"center"}}>
                        <label htmlFor="remove_bg" className={styles.label}>Remove Background:</label>
                        <input
                            type="checkbox"
                            id="remove_bg"
                            checked={removeBg}
                            onChange={(e) => setRemoveBg(e.target.checked)}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <div className={styles.inputBox}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label htmlFor="width" className={styles.label}>Width</label>
                                <h5 style={{ padding: "2px 8px", background: "#716d6df7", borderRadius: "5px", fontWeight: "bold" }}>{unit.toLocaleUpperCase()}</h5>
                            </div>
                            <input
                                id="width"
                                placeholder='0'
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                className={styles.numberInput}
                                required
                            />
                        </div>
                        <div className={styles.inputBox}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label htmlFor="height" className={styles.label}>Height:</label>
                                <h5 style={{ padding: "2px 8px", background: "#716d6df7", borderRadius: "5px", fontWeight: "bold" }}>{unit.toLocaleUpperCase()}</h5>
                            </div>
                            <input
                                id="height"
                                placeholder='0'
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className={styles.numberInput}
                                required
                            />
                        </div>
                        <div className={styles.inputBox}>
                            <label htmlFor="unit" className={styles.label}>Unit:</label>
                            <select
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="px">Pixels</option>
                                <option value="inches">Inches</option>
                                <option value="cm">Centimeters</option>
                                <option value="mm">Millimeters</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <div className={styles.inputBox}>
                            <label htmlFor="format" className={styles.label}>Format</label>
                            <select
                                id="format"
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="PNG">PNG</option>
                                <option value="JPEG">JPEG</option>
                                <option value="WEBP">WEBP</option>
                            </select>
                        </div>
                        <div className={styles.inputBox}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label htmlFor="size_kb" className={styles.label}>Target Size (KB):</label>
                                <h5 style={{ padding: "2px 8px", background: "#716d6df7", borderRadius: "5px", fontWeight: "bold" }}>{unit.toLocaleUpperCase()}</h5>
                            </div>
                            <input
                                id="size_kb"
                                placeholder='KB'
                                value={targetSizeKB}
                                onChange={(e) => setTargetSizeKB(e.target.value)}
                                className={styles.numberInput}
                            />
                        </div>
                        <div className={styles.inputBox}>
                            <label htmlFor="dpi" className={styles.label}>DPI</label>
                            <input
                                id="dpi"
                                placeholder='DPI'
                                type="number"
                                value={dpi}
                                onChange={(e) => setDPI(e.target.value)}
                                className={styles.numberInput}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <button className={styles.button} type="submit"  disabled={loading}>
                            {loading ? 'Processing...' : 'Process'}
                        </button>
                    </div>
                    {error && (
                        <div className={styles.error}>
                            <p>{error}</p>
                        </div>
                    )}
                </form>
            </div>
            {processedImage && (
                <div className={styles.uploadForm}>
                    <div style={{width:"381px",height:"488px"}}>
                        <h3>Processed Image:</h3>
                        <Image src={processedImage} alt="Processed Image" width={381} height={381} />
                        <div>
                            <a href={processedImage} download={`processed_image.${format.toLowerCase()}`}>
                                <button className={styles.button}>Download Processed Image</button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default UploadForm;
