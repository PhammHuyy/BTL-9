/**
 * manager-feedback-center.js - Logic controller cho trang manager-feedback-center
 */

let activeThemeFilter = "all";

    function renderFeedbackList() {
      let list = Store.getFeedback();

      if (activeThemeFilter !== "all") {
        list = list.filter(f => f.theme === activeThemeFilter);
      }

      document.getElementById("feedbackCountDisplay").innerText = `${list.length} đánh giá`;
      const container = document.getElementById("feedbackListContainer");

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div style="font-size:2rem;">💬</div>
            <h4>Không có đánh giá nào thuộc chủ đề này</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">Hãy chọn lại bộ lọc tất cả chủ đề.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(item => `
        <div class="feedback-item">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div>
              <strong style="color:var(--secondary); font-size:1.05rem;">${item.customerName}</strong>
              <span class="badge" style="background:#EEF2FF; color:#4338CA; margin-left:6px;">${item.tableNumber}</span>
              <span class="badge" style="background:#FEF3C7; color:#92400E; margin-left:4px;">Chủ đề: ${item.theme}</span>
            </div>
            <div style="font-size:0.85rem; color:var(--text-muted);">
              <span style="color:#D97706; font-weight:700;">${'⭐'.repeat(item.rating)}</span> • ${item.date}
            </div>
          </div>

          <p style="font-size:0.92rem; color:var(--secondary-muted); margin-bottom:12px; line-height:1.6;">
            "${item.comment}"
          </p>

          ${item.replied ? `
            <div style="background:#F8FAFC; border-left:4px solid var(--primary); padding:10px 14px; border-radius:0 6px 6px 0; margin-bottom:10px; font-size:0.85rem;">
              <strong style="color:var(--primary);">Quản lý nhà hàng đã trả lời:</strong>
              <div style="color:var(--secondary-muted); margin-top:2px;">${item.replyText}</div>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="openReplyModal('${item.id}')">
              ${item.replied ? '✏️ Sửa câu trả lời' : '💬 Trả lời khách'}
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteFeedbackItem('${item.id}')">
              🗑️ Xóa
            </button>
          </div>
        </div>
      `).join("");
    }

    function filterByTheme(theme) {
      activeThemeFilter = theme;
      const btns = ["btnThemeAll", "btnThemeFood", "btnThemeWait", "btnThemeService", "btnThemePrice"];
      btns.forEach(b => {
        const el = document.getElementById(b);
        if (el) el.className = "btn btn-sm btn-secondary";
      });

      if (theme === "all") document.getElementById("btnThemeAll").className = "btn btn-sm btn-primary";
      else if (theme === "Chất lượng món") document.getElementById("btnThemeFood").className = "btn btn-sm btn-primary";
      else if (theme === "Thời gian chờ") document.getElementById("btnThemeWait").className = "btn btn-sm btn-primary";
      else if (theme === "Dịch vụ & Thái độ") document.getElementById("btnThemeService").className = "btn btn-sm btn-primary";
      else if (theme === "Giá cả & Khẩu phần") document.getElementById("btnThemePrice").className = "btn btn-sm btn-primary";

      renderFeedbackList();
    }

    function applyThemeFilter(theme) {
      filterByTheme(theme);
      showToast(`Đã lọc danh sách theo chủ đề '${theme}'!`, "info");
    }

    function toggleAiFbFailure(checked) {
      AIEngine.simulateFailureMode = checked;
    }

    async function runAiFeedbackExtractor() {
      document.getElementById("aiFbIntro").style.display = "none";
      document.getElementById("aiFbLoading").style.display = "block";
      document.getElementById("aiFbResult").style.display = "none";
      document.getElementById("aiFbError").style.display = "none";

      const res = await AIEngine.extractFeedbackThemes();

      document.getElementById("aiFbLoading").style.display = "none";

      if (!res.success) {
        document.getElementById("aiFbError").style.display = "block";
        document.getElementById("aiFbErrorMsg").innerText = res.error;
        return;
      }

      document.getElementById("aiFbResult").style.display = "block";
      document.getElementById("aiSentimentBadge").innerText = `${res.sentiment.positive}% Hài lòng`;
      document.getElementById("barPos").style.width = `${res.sentiment.positive}%`;
      document.getElementById("barNeu").style.width = `${res.sentiment.neutral}%`;
      document.getElementById("barNeg").style.width = `${res.sentiment.negative}%`;
      document.getElementById("txtPos").innerText = `${res.sentiment.positive}%`;
      document.getElementById("txtNeu").innerText = `${res.sentiment.neutral}%`;
      document.getElementById("txtNeg").innerText = `${res.sentiment.negative}%`;

      const badgesContainer = document.getElementById("aiThemesBadges");
      badgesContainer.innerHTML = Object.entries(res.themesDistribution).map(([th, count]) => `
        <span class="badge" style="background:#EDE9FE; color:#6D28D9; font-size:0.8rem; cursor:pointer;" onclick="applyThemeFilter('${th}')">
          ${th} (${count} ý kiến)
        </span>
      `).join("");

      document.getElementById("aiTopPositiveText").innerText = res.topPositiveInsight;
      document.getElementById("aiTopIssueText").innerText = res.topIssueInsight;
      document.getElementById("aiActionSugText").innerText = res.aiActionSuggestion;
    }

    function dismissAiFb() {
      document.getElementById("aiFbResult").style.display = "none";
      document.getElementById("aiFbIntro").style.display = "block";
    }

    function resetAiFb() {
      document.getElementById("aiFbError").style.display = "none";
      document.getElementById("aiFbIntro").style.display = "block";
    }

    function saveFeedbackReport() {
      showToast("✓ Đã lưu kết quả phân tích chủ đề vào Báo cáo quản lý tuần!", "success");
    }

    function openReplyModal(fbId) {
      const fb = Store.getFeedback().find(f => f.id === fbId);
      if (!fb) return;

      document.getElementById("replyTargetId").value = fb.id;
      document.getElementById("replyCustomerComment").innerText = `"${fb.comment}"`;
      document.getElementById("replyTextarea").value = fb.replyText || "";
      openModal("replyModal");
    }

    function generateAiReplyTemplate() {
      document.getElementById("replyTextarea").value = 
        "Dạ MenuMind chân thành cảm ơn quý khách đã dành thời gian gửi lời nhận xét quý giá. Đội ngũ bếp và nhân viên phục vụ sẽ tiếp tục duy trì và nâng cao chất lượng hơn nữa để mang tới trải nghiệm tuyệt vời nhất cho quý khách ở lần ghé thăm tiếp theo ạ!";
      showToast("Đã sinh câu trả lời lịch thiệp bằng AI!", "info");
    }

    function submitReply() {
      const id = document.getElementById("replyTargetId").value;
      const text = document.getElementById("replyTextarea").value.trim();
      if (!text) {
        showToast("Vui lòng nhập nội dung phản hồi!", "warning");
        return;
      }
      Store.replyFeedback(id, text);
      closeModal("replyModal");
      showToast("Đã gửi câu trả lời tới thực khách thành công!", "success");
      renderFeedbackList();
    }

    function deleteFeedbackItem(id) {
      if (confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
        Store.deleteFeedback(id);
        showToast("Đã xóa phản hồi!", "warning");
        renderFeedbackList();
      }
    }

    function openAddFeedbackModal() {
      openModal("addFeedbackModal");
    }

    function submitNewSampleFeedback() {
      const name = document.getElementById("newFbName").value.trim();
      const table = document.getElementById("newFbTable").value.trim();
      const rating = parseInt(document.getElementById("newFbRating").value);
      const theme = document.getElementById("newFbTheme").value;
      const comment = document.getElementById("newFbComment").value.trim();

      if (!comment) {
        showToast("Vui lòng nhập nhận xét!", "warning");
        return;
      }

      Store.addFeedback({
        customerName: name,
        tableNumber: table,
        rating: rating,
        theme: theme,
        dishName: "Món ăn gọi tại bàn",
        comment: comment,
        sentiment: rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative"
      });

      closeModal("addFeedbackModal");
      showToast("Đã thêm đánh giá mẫu thành công!", "success");
      renderFeedbackList();
    }

    document.addEventListener("DOMContentLoaded", renderFeedbackList);
