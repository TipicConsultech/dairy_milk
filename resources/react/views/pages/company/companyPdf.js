import jsPDF from "jspdf";
import "jspdf-autotable";
import { getUserData } from "../../../util/session";
import logo from "../../../assets/brand/TipicConsultech.png";

export function generateCompanyReceiptPDF(receiptData) {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const ci = getUserData()?.company_info || {};
    const primaryColor = "#00bcd4";
    const textColor = "#000000";
    pdf.setFont("helvetica", "normal");

    pdf.setDrawColor("#333");
    pdf.rect(5, 5, pdf.internal.pageSize.getWidth() - 10, pdf.internal.pageSize.getHeight() - 10, "S");

    pdf.setFontSize(18);
    pdf.setTextColor(textColor);
    pdf.setFont("bold");
    pdf.text("Subscription Receipt", pdf.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    if (logo) {
        pdf.addImage(logo, "PNG", 15, 25, 35, 35);
    }

    pdf.setFontSize(11);
    pdf.setFont("normal");
    pdf.text(ci.company_name || "Company Name", 190, 30, { align: "right" });
    pdf.text(ci.land_mark || "Address", 190, 35, { align: "right" });
    pdf.text(`${ci.Tal || ""}, ${ci.Dist || ""}, ${ci.pincode || ""}`, 190, 40, { align: "right" });
    pdf.text(`Phone: ${ci.phone_no || "N/A"}`, 190, 45, { align: "right" });

    pdf.setFontSize(13);
    pdf.setTextColor(primaryColor);
    pdf.text("Receipt to:", 15, 70);

    pdf.setFontSize(11);
    pdf.setTextColor(textColor);
    const today = new Date().toISOString().split("T")[0];
    const formattedDate = formatDate(today);

    pdf.text(`Company Name  : ${receiptData?.company?.company_name || "N/A"}`, 15, 78);
    pdf.text(`Mobile Number : ${receiptData?.company?.phone_no || "N/A"}`, 15, 83);
    pdf.text(`Email         : ${receiptData?.company?.email_id || "N/A"}`, 15, 88);
    pdf.text(`Transaction ID: ${receiptData?.transaction_id || "N/A"}`, 15, 93);
    pdf.text(`Receipt Date  : ${formattedDate}`, 145, 78);
    pdf.text(`Valid Till    : ${formatDate(receiptData?.valid_till) || "N/A"}`, 145, 83);

    pdf.setFontSize(12);
    pdf.setFont("bold");
    pdf.text("Plan Details", 15, 105);
    pdf.setFontSize(11);
    pdf.setFont("normal");

    const planTable = [
        [
            receiptData?.plan?.name || "N/A",
            formatDate(receiptData?.created_at) || "N/A",
            formatDate(receiptData?.valid_till) || "N/A",
            `${receiptData?.plan?.price || "0"} /-`
        ]
    ];

    pdf.autoTable({
        startY: 110,
        headStyles: { fillColor: primaryColor, textColor: "#fff", fontStyle: "bold" },
        bodyStyles: { textColor: textColor },
        theme: "grid",
        head: [["Plan Name", "Start Date", "End Date", "Amount(Per Month)"]],
        body: planTable,
        margin: { left: 15, right: 15 },
        columnStyles: { 3: { halign: "right" } },
    });

    pdf.setFontSize(12);
    pdf.setFont("bold");
    pdf.text("Payment Details", 15, pdf.autoTable.previous.finalY + 10);
    pdf.setFontSize(11);
    pdf.setFont("normal");

    const paymentTable = [
        ["Amount", `${receiptData?.total_amount || "0"} /-`],
        ["GST", `${receiptData?.gst || "0"} /-`],
        ["Amount Paid", `${receiptData?.payable_amount || "0"} /-`]
    ];

    pdf.autoTable({
        startY: pdf.autoTable.previous.finalY + 15,
        headStyles: { fillColor: primaryColor, textColor: "#fff", fontStyle: "bold" },
        bodyStyles: { textColor: textColor },
        theme: "grid",
        head: [["Description", "Amount"]],
        body: paymentTable,
        margin: { left: 15, right: 15 },
        columnStyles: { 1: { halign: "right" } },
    });

    pdf.setFontSize(10);
    pdf.text("This receipt has been generated and is authorized.", 15, pdf.internal.pageSize.getHeight() - 15);

    pdf.save(`${receiptData?.company?.company_name || "Company"}-${Date.now()}.pdf`);
}
