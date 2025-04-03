import React, { useRef } from 'react';
import { FaDownload, FaPrint } from 'react-icons/fa';
import html2canvas from 'html2canvas';

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
  
  if (!item || !qrCode) {
    return null;
  }
  
  // Shared label HTML for both download and print
  const generateLabelHTML = () => {
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
      {/* Preview of the asset label */}
      <div 
        ref={labelRef}
        className="flex items-start bg-white p-3 rounded-lg shadow-md mb-3 border border-gray-200"
      >
        <div className="w-[70px] flex-shrink-0 pr-2">
          <img src={qrCode} alt="Asset Label QR Code" className="w-full border border-gray-100 rounded p-0.5" />
        </div>
        <div className="ml-2 flex-grow overflow-hidden">
          <div className="text-xs font-bold text-gray-600">DemoOrg Co.</div>
          {/* Make sure text doesn't get cut off by allowing text wrapping */}
          <div className="font-bold text-sm text-gray-800 break-words">{item.title}</div>
          <div className="text-sm text-gray-600">{item.customId}</div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className={`flex ${compact ? 'gap-2' : 'gap-4'} justify-center`}>
        <button 
          onClick={downloadLabel}
          className={`flex items-center gap-1 ${
            compact 
              ? 'px-2 py-1 text-xs' 
              : 'px-3 py-2 gap-2'
          } bg-blue-500 text-white rounded-md hover:bg-blue-600 transition`}
        >
          <FaDownload /> {compact ? 'Save' : 'Save Label'}
        </button>
        <button 
          onClick={printQRCode}
          className={`flex items-center gap-1 ${
            compact 
              ? 'px-2 py-1 text-xs' 
              : 'px-3 py-2 gap-2'
          } bg-gray-500 text-white rounded-md hover:bg-gray-600 transition`}
        >
          <FaPrint /> {compact ? 'Print' : 'Print Label'}
        </button>
      </div>
    </div>
  );
};

export default ItemTag;
