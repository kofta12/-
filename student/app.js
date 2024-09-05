const studentRecords = [];
const qrContainer = document.getElementById("qr-container");

// إضافة الطلاب الجدد
document.getElementById("student-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const studentId = document.getElementById("student-id").value;
    const studentName = document.getElementById("student-name").value;
    const studentClass = document.getElementById("student-class").value;

    // تخزين بيانات الطالب
    const studentData = { id: studentId, name: studentName, class: studentClass };
    studentRecords.push(studentData);

    // عرض الطالب في قائمة الطلاب المسجلين
    const studentRow = `<tr>
        <td>${studentId}</td>
        <td>${studentName}</td>
        <td>${studentClass}</td>
    </tr>`;
    document.querySelector("#students-table tbody").insertAdjacentHTML('beforeend', studentRow);

    // توليد QR Code
    const qr = new QRious({
        element: document.createElement("canvas"),
        value: studentId,
        size: 100
    });
    const img = document.createElement("img");
    img.src = qr.toDataURL();
    qrContainer.innerHTML = ''; // مسح QR Codes السابق
    qrContainer.appendChild(img);

    // مسح بيانات النموذج
    document.getElementById("student-form").reset();
});

// تحميل QR Code
document.getElementById("download-qr").addEventListener("click", function() {
    const img = qrContainer.querySelector("img");
    if (img) {
        const link = document.createElement("a");
        link.href = img.src;
        link.download = "qr-code.png";
        link.click();
    }
});

// إعداد كاميرا لقراءة QR Code وتسجيل الحضور
const html5QrCode = new Html5Qrcode("qr-reader");

document.getElementById("scan-qr").addEventListener("click", function() {
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        (decodedText, decodedResult) => {
            const student = studentRecords.find(s => s.id === decodedText);
            if (student) {
                // تسجيل الحضور
                const now = new Date();
                const attendanceRow = `<tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.class}</td>
                    <td>${now.toLocaleString()}</td>
                </tr>`;
                document.querySelector("#attendance-table tbody").insertAdjacentHTML('beforeend', attendanceRow);
            } else {
                alert("الطالب غير مسجل");
            }
            html5QrCode.stop();
        },
        (errorMessage) => {
            console.log(`خطأ في قراءة QR Code: ${errorMessage}`);
        }
    ).catch(err => {
        console.log(`فشل في تشغيل الكاميرا: ${err}`);
    });
});

// تحميل بيانات الحضور إلى Excel
document.getElementById("download-attendance").addEventListener("click", function() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "رقم الطالب,اسم الطالب,الفصل,التوقيت\n";
    
    const rows = document.querySelectorAll("#attendance-table tbody tr");
    rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        const dataString = Array.from(cols).map(col => col.textContent).join(",");
        csvContent += dataString + "\n";
    });

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "attendance.csv";
    link.click();
});

// مسح بيانات الحضور
document.getElementById("clear-data").addEventListener("click", function() {
    document.querySelector("#attendance-table tbody").innerHTML = '';
});
