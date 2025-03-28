import React from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getUserData } from '../../../util/session';

export function generatePDF(grandTotal, invoiceNo, customerName, formData,remainingAmount,totalAmountWords) {
    // PDF generation logic
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const ci = getUserData()?.company_info;

    const fontSize = 10;
    pdf.setFontSize(fontSize);
    // pdf.setLineWidth(0.5);
    pdf.setDrawColor("#333");
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "S");

    const img = new Image();
    img.src = 'img/'+ci.logo;
    pdf.addImage(img, "PNG", 15, 10, 40, 40);
    pdf.setFontSize(15);
    pdf.setTextColor("#000");

    const status = formData.status;
    const INVOICE = formData.InvoiceStatus;
    const headingX = pdf.internal.pageSize.getWidth() / 2;
    
    // Set font to bold and increase size by 1.5 times
    pdf.setFont( "bold");
    // "helvetica"
    
    pdf.setFontSize(17);
    
    // Set color based on status
    if (status === 0) {
        pdf.setTextColor(255, 0, 0); // Red
    } else if (status === 1) {
        pdf.setTextColor(0, 128, 0); // Green
    } else if (status === 2) {
        pdf.setTextColor(255, 165, 0); // Yellow
    }
    
    pdf.text(`${INVOICE}`, headingX, 10, { align: "center" });
    
    // Reset the font size to original after use if needed
    pdf.setFontSize(10);
    pdf.setFont("normal");
    pdf.setTextColor("#000"); // Reset to default color

    pdf.text(ci.company_name, pdf.internal.pageSize.getWidth() - 65, 20);
    pdf.text(ci.land_mark, pdf.internal.pageSize.getWidth() - 65, 25);
    pdf.text(ci.Tal+" , "+ci.Dist+" , "+ci.pincode, pdf.internal.pageSize.getWidth() - 65, 30);
    pdf.text("Phone: "+ci.phone_no, pdf.internal.pageSize.getWidth() - 65, 35);

    pdf.setTextColor("#000");
    pdf.setFontSize(13);
    pdf.text(`Invoice to:`, 15, 60);
    pdf.setFont("normal");
    pdf.setFontSize(11);
    pdf.text(`Customer Name    : ${formData.customer.name}`, 15, 70);
    pdf.text(`Customer Address : ${formData.customer.address}`, 15, 75);
    pdf.text(`Mobile Number     : ${formData.customer.mobile}`, 15, 80);
    pdf.text(`Invoice No: ${invoiceNo}`, 145, 70);

    const formattedDate = formData.date.split("-").reverse().join("-");
    pdf.text(`Invoice Date: ${formattedDate}`, 145, 75);
    let y;

    if (formData.InvoiceType == 2) {
        const formattedDeliveryDate = formData.DeliveryDate.split("-").reverse().join("-");
        pdf.text(`Delivery Date: ${formattedDeliveryDate}`, 145, 80);
        pdf.setFontSize(10);
        y = 90; // Adjust y coordinate for subsequent text if any
    } else {
        pdf.setFontSize(10);
        y = 85; // Adjust y coordinate for subsequent text if any
    }

    const grandTotalRow = ["", "", "", "Grand Total", grandTotal+" /-"];
    pdf.autoTable({
        startY: y,
        head: [["Sr No", "Item Name", "Price (Rs)", "Quantity", "Total (Rs)"]],
        body: [
            ...formData.products.map((product, index) => [
                index + 1,
                product.product_name ,
                product.dPrice + (product.product_unit?.length > 0 ? ` per ${product.product_unit}`: ' /-'),
                product.dQty + (product.product_unit?.length > 0 ? ` ${product.product_unit}`: ''),
                product.total_price+" /-"
            ]),
            grandTotalRow,
        ],
        theme: "grid",
        styles: { halign: "center", valign: "middle", fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0] },
        columnStyles: {
            0: { halign: "center" },
            2: { halign: "center" },
            3: { halign: "center" },
            4: { halign: "center" },
        },
    });

    y = pdf.autoTable.previous.finalY + 10;
    const totalAmountWord = totalAmountWords;

    // Prepare additional details data
    const additionalDetailsData = [];

    if (formData.discount > 0) {
        additionalDetailsData.push(["Discount (%):", `${formData.discount} %`]);
    }

    additionalDetailsData.push(
        ["Amount Paid:",`${formData.amountPaid.toFixed(2)}`+" /-"],
        ["Balance Amount:",`${remainingAmount.toFixed(2)}`+" /-" ],
        ["Payment Mode:", formData.paymentMode]
    );

    pdf.autoTable({
        body: additionalDetailsData,
        startY: y,
        theme: "grid",
        styles: { halign: "left", valign: "middle", fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0] },
        margin: { bottom: 30 },
    });

    y = pdf.autoTable.previous.finalY + 10;
    pdf.setFontSize(11);
    pdf.setFont("normal");
    pdf.text("Total Amount (In Words):", 15, y);

    pdf.setTextColor("#000");
    pdf.setFontSize(10);
    pdf.setFont("bold");
    pdf.text(`${totalAmountWord} Rs Only`, 60, y);
    pdf.setFont("normal");
    const bankDetailsY = y + 10 + 40 + 10;
    const signatureY = bankDetailsY + 15;

    pdf.setLineWidth(0.2);
    pdf.setDrawColor("#000");
    pdf.rect(13.5, bankDetailsY, pdf.internal.pageSize.getWidth() - 28.5, 40, "S");
    pdf.setFontSize(12);

    pdf.text("Bank Details", 20, bankDetailsY + 9);
    pdf.setFontSize(10);
    pdf.setFont("normal");
    pdf.text(ci.bank_name, 20, bankDetailsY + 20);
    pdf.text('Account No: '+ci.account_no, 20, bankDetailsY + 25);
    pdf.text('IFSC code  : '+ci.IFSC_code, 20, bankDetailsY + 30);
    pdf.setFont("bold");
    pdf.text(
        "E-SIGNATURE",
        pdf.internal.pageSize.width - 84,
        bankDetailsY + 8
    );
    pdf.addImage(
        'img/'+ci.sign,
        "JPG",
        pdf.internal.pageSize.width - 72,
        bankDetailsY + 9,
        35,
        20
    );
    pdf.setFontSize(10);
    pdf.text(
        "Authorized Signature",
        pdf.internal.pageSize.width - 70,
        bankDetailsY + 36
    );

    const additionalMessage = "This bill has been computer-generated and is authorized.";
    const additionalMessageWidth = pdf.getStringUnitWidth(additionalMessage) * 6;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(0);
    pdf.rect(0, 0, pageWidth, pageHeight);
    pdf.setFontSize(10);
    const shiftRight = 15;
    const textXAdditional = (pageWidth - additionalMessageWidth) / 1.3 + shiftRight;
    const textY = pageHeight - 5;
    pdf.text(additionalMessage, textXAdditional, textY);

    pdf.save(`${invoiceNo}-${customerName}-${new Date().getTime()}.pdf`);
}

function InvoicePdf() {
    return (
        <div>
           
        </div>
    );
}

export default InvoicePdf;
