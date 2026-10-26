/**
 * manager-sales-insights.js - Logic controller cho trang manager-sales-insights
 */

function changePeriod(period) {
      const btns = ["btnPeriodToday", "btnPeriodWeek", "btnPeriodMonth"];
      btns.forEach(b => document.getElementById(b).className = "btn btn-sm btn-secondary");

      if (period === "today") {
        document.getElementById("btnPeriodToday").className = "btn btn-sm btn-primary";
        document.getElementById("kpiRevenue").innerText = "14.850.000 ₫";
        document.getElementById("kpiOrders").innerText = "48 đơn";
        document.getElementById("kpiWaitTime").innerText = "14.2 phút";
      } else if (period === "week") {
        document.getElementById("btnPeriodWeek").className = "btn btn-sm btn-primary";
        document.getElementById("kpiRevenue").innerText = "98.420.000 ₫";
        document.getElementById("kpiOrders").innerText = "326 đơn";
        document.getElementById("kpiWaitTime").innerText = "15.0 phút";
      } else if (period === "month") {
        document.getElementById("btnPeriodMonth").className = "btn btn-sm btn-primary";
        document.getElementById("kpiRevenue").innerText = "412.800.000 ₫";
        document.getElementById("kpiOrders").innerText = "1.340 đơn";
        document.getElementById("kpiWaitTime").innerText = "14.8 phút";
      }

      showToast(`Đã cập nhật số liệu kinh doanh cho kỳ: ${period === 'today' ? 'Hôm nay' : period === 'week' ? '7 ngày qua' : 'Tháng này'}!`, "info");
    }

    function exportSalesReport() {
      const csvContent = "data:text/csv;charset=utf-8,Khung gio,Doanh thu,So don\n11h,1200000,4\n12h,2800000,9\n13h,1900000,6\n17h,950000,3\n18h,2300000,8\n19h,3900000,12\n20h,3100000,10\n21h,1400000,5";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sales_report_menumind_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Đã xuất và tải về báo cáo doanh số CSV thành công!", "success");
    }
