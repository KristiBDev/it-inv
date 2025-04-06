import React, { useRef } from 'react';
import { FaDownload, FaPrint } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { useTheme } from '../contexts/ThemeContext';

/**
 * A component for displaying and printing an item tag with QR code
 * @param {Object} props - Component props
 * @param {Object} props.item - The item data
 * @param {string} props.qrCode - Base64 encoded QR code image
 * @param {boolean} props.compact - Whether to show a compact version (smaller buttons)
 * @returns {JSX.Element} - The rendered component
 */
const ItemTag = ({ item, qrCode, compact = false }) => {
  const labelRef = useRef(null);
  const { isNightMode } = useTheme();
  
  if (!item || !qrCode) {
    return null;
  }
  
  // Shared label HTML for both download and print
  const generateLabelHTML = () => {
    // Use light theme colors for export regardless of current theme
    return `
      <div style="
        display: flex;
        align-items: flex-start;
        padding: 12px;
        background-color: #ffffff;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        width: 280px;
        font-family: Arial, sans-serif;
      ">
        <div style="
          width: 70px;
          flex-shrink: 0;
          padding-right: 8px;
        ">
          <img 
            src="${qrCode}" 
            alt="Asset Label QR Code"
            style="
              width: 100%;
              display: block;
              border: 1px solid #eee;
              border-radius: 4px;
              padding: 2px;
            "
          >
        </div>
        <div style="
          margin-left: 8px;
          flex-grow: 1;
        ">
          <div style="
            font-size: 12px;
            font-weight: bold;
            color: #4b5563;
            margin-bottom: 6px;
            letter-spacing: 0.3px;
          ">DemoOrg Co.</div>
          <div style="
            font-weight: bold;
            font-size: 13px;
            color: #1f2937;
            margin-bottom: 6px;
            line-height: 1.2;
            max-height: none;
            word-wrap: break-word;
          ">${item.title}</div>
          <div style="
            font-size: 13px;
            color: #4b5563;
            margin-top: 2px;
          ">${item.customId}</div>
        </div>
      </div>
    `;
  };

  // Function to download the entire label as an image
  const downloadLabel = async () => {
    try {
      // Create a hidden container for canvas generation
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.width = '280px'; // Set fixed width
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.backgroundColor = '#ffffff';
      container.innerHTML = generateLabelHTML();
      
      document.body.appendChild(container);
      
      // Capture with html2canvas
      const canvas = await html2canvas(container, { 
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Clean up
      document.body.removeChild(container);
      
      // Create download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `asset-label-${item.customId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating label image:', error);
      // Fallback to just saving the QR code
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qrcode-${item.customId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Could not save full label. Saving QR code only instead.');
    }
  };
  
  // Function to print the QR code tag - now using the same layout as download
  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Asset Label: ${item.title} (${item.customId})</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f0f0f0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-container {
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              width: 300px;
            }
            @media print {
              body {
                background: white;
              }
              .print-container {
                box-shadow: none;
                padding: 0;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${generateLabelHTML()}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
  };

  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Preview of the asset label using theme classes */}
      <div className="asset-label">
        <div className="asset-label-qr">
          <img src={qrCode} alt="Asset Label QR Code" className="w-full border border-gray-100 rounded p-0.5" />
        </div>
        <div className="asset-label-info">
          <div className="asset-label-org">DemoOrg Co.</div>
          <div className="asset-label-title">{item.title}</div>
          <div className="asset-label-id">{item.customId}</div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className={`flex ${compact ? 'gap-2' : 'gap-4'} justify-center mt-3`}>
        <button 
          onClick={downloadLabel}
          className={`app-btn ${compact ? 'app-btn-sm' : ''} app-btn-primary`}
        >
          <FaDownload className="mr-1" /> {compact ? 'Save' : 'Save Label'}
        </button>
        <button 
          onClick={printQRCode}
          className={`app-btn ${compact ? 'app-btn-sm' : ''} app-btn-outline`}
        >
          <FaPrint className="mr-1" /> {compact ? 'Print' : 'Print Label'}
        </button>
      </div>
    </div>
  );
};

export default ItemTag;
