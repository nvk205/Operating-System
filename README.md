# Tài Liệu Kịch Bản Mô Phỏng Thuật Toán Banker (Scenarios Specification)

Tài liệu này đặc tả chi tiết 4 kịch bản mô phỏng từ cơ bản đến nâng cao cho ứng dụng Web mô phỏng thuật toán Banker của Edsger Dijkstra. Mỗi kịch bản đều tuân thủ phương trình trạng thái cơ sở:

$$\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$$

$$\text{Resource}[j] = \text{Available}[j] + \sum_{i=0}^{n-1} \text{Allocation}[i][j]$$

---

## Kịch bản 1: Nghiệp vụ Ngân hàng (Ý tưởng gốc của Dijkstra)

### 1. Bối cảnh thực tế
Một ngân hàng thương mại quản lý 3 nguồn vốn tín dụng khác nhau để giải ngân theo tiến độ cho 4 dự án xây dựng hạ tầng ($P_0, P_1, P_2, P_3$). Trước khi khởi công, mỗi chủ đầu tư phải đăng ký hạn mức tín dụng tối đa ($\text{Max}$) cần thiết để hoàn thiện công trình. Ngân hàng giải ngân từng đợt ($\text{Allocation}$) và chỉ phê duyệt yêu cầu rút vốn mới nếu quỹ dự trữ thanh khoản ($\text{Available}$) đảm bảo ít nhất một dự án có thể hoàn thành, nghiệm thu và hoàn trả toàn bộ vốn vay để xoay vòng cho dự án tiếp theo.

* **Số lượng tiến trình ($n$):** $4$ dự án xây dựng ($P_0 \rightarrow P_3$).
* **Số lượng loại tài nguyên ($m$):** $3$ nguồn vốn (Đơn vị: Tỷ VNĐ quy đổi):
  * $A$: Quỹ tiền mặt giải ngân trực tiếp (Tổng: $10$).
  * $B$: Hạn mức tín dụng ngoại tệ nhập khẩu thiết bị (Tổng: $6$).
  * $C$: Quỹ bảo lãnh thanh toán nhà thầu (Tổng: $8$).
* **Vector tổng nguồn vốn:** $\text{Resource} = [10, 6, 8]$.
* **Vector quỹ dự trữ rảnh ban đầu:** $\text{Available} = [3, 2, 2]$.

### 2. Bảng trạng thái tại thời điểm $T_0$

| Tiến trình | Tên dự án | Allocation | Max | Need |
| :--- | :--- | :--- | :--- | :--- |
| $P_0$ | Khu đô thị A | $2, 1, 2$ | $6, 4, 5$ | $4, 3, 3$ |
| $P_1$ | Cầu vượt B | $3, 2, 1$ | $5, 3, 3$ | $2, 1, 2$ |
| $P_2$ | Nhà máy C | $1, 1, 2$ | $4, 3, 4$ | $3, 2, 2$ |
| $P_3$ | Kho vận D | $1, 0, 1$ | $7, 5, 6$ | $6, 5, 5$ |

Bảng trên thể hiện hạn mức tối đa đã đăng ký, số vốn đã giải ngân và số vốn còn thiếu của 4 dự án khi quỹ dự trữ ngân hàng hiện còn $\text{Available} = [3, 2, 2]$.

### 3. Diễn biến kiểm tra an toàn (Safety Algorithm)
Khởi tạo vector làm việc $\text{Work} = [3, 2, 2]$ và mảng $\text{Finish} = [\text{false}, \text{false}, \text{false}, \text{false}]$:
1. **Xét $P_0$:** $\text{Need}_0 = [4, 3, 3] \not\le \text{Work} = [3, 2, 2]$ $\rightarrow$ Tạm hoãn vì thiếu tiền mặt và ngoại tệ.
2. **Xét $P_1$:** $\text{Need}_1 = [2, 1, 2] \le \text{Work} = [3, 2, 2]$ $\rightarrow$ Giải ngân nốt cho Cầu vượt B hoàn thành, thu hồi vốn: $\text{Work} = [3, 2, 2] + [3, 2, 1] = [6, 4, 3]$. Đánh dấu $\text{Finish}[1] = \text{true}$.
3. **Xét $P_2$:** $\text{Need}_2 = [3, 2, 2] \le \text{Work} = [6, 4, 3]$ $\rightarrow$ Nhà máy C hoàn thành và trả vốn: $\text{Work} = [6, 4, 3] + [1, 1, 2] = [7, 5, 5]$. Đánh dấu $\text{Finish}[2] = \text{true}$.
4. **Xét $P_3$:** $\text{Need}_3 = [6, 5, 5] \le \text{Work} = [7, 5, 5]$ $\rightarrow$ Kho vận D hoàn thành và trả vốn: $\text{Work} = [7, 5, 5] + [1, 0, 1] = [8, 5, 6]$. Đánh dấu $\text{Finish}[3] = \text{true}$.
5. **Quay lại $P_0$:** $\text{Need}_0 = [4, 3, 3] \le \text{Work} = [8, 5, 6]$ $\rightarrow$ Khu đô thị A hoàn thành và trả vốn: $\text{Work} = [8, 5, 6] + [2, 1, 2] = [10, 6, 8]$. Đánh dấu $\text{Finish}[0] = \text{true}$.

* **Kết luận:** Hệ thống **An toàn (Safe State)** với chuỗi giải ngân an toàn $\langle P_1, P_2, P_3, P_0 \rangle$.

### 4. Kịch bản yêu cầu giải ngân mẫu
* **Yêu cầu 1 (Hợp lệ & Duyệt):** Dự án $P_2$ xin rút thêm $\text{Request}_2 = [1, 0, 1]$. Sau khi giả lập cấp phát, $\text{Available}$ còn $[2, 2, 1]$ và $\text{Need}_1 = [2, 1, 2] \not\le [2, 2, 1]$, nhưng bản thân $P_2$ lúc này chỉ còn thiếu $\text{Need}_2 = [2, 2, 1] \le \text{Work} = [2, 2, 1]$ nên $P_2$ về đích trước, kéo theo chuỗi an toàn mới $\langle P_2, P_1, P_0, P_3 \rangle$.
* **Yêu cầu 2 (Từ chối & Rollback):** Dự án $P_3$ xin rút $\text{Request}_3 = [2, 1, 1]$. Nếu giải ngân, quỹ dự trữ chỉ còn $\text{Available} = [1, 1, 1]$, không đủ giúp bất kỳ dự án nào hoàn thiện (nguy cơ đóng băng vốn toàn hệ thống). Ngân hàng từ chối và thực hiện Rollback.

---

## Kịch bản 2: Cấp phát Phần cứng Hệ điều hành (OS Hardware Allocation)

### 1. Bối cảnh thực tế
Nhân hệ điều hành (OS Kernel) quản lý việc cấp phát 4 nhóm tài nguyên phần cứng vật lý cho 5 tiến trình ứng dụng ($P_0 \rightarrow P_4$) đang thực thi đồng thời.

* **Số lượng tiến trình ($n$):** $5$ tiến trình ($P_0 \rightarrow P_4$).
* **Số lượng loại tài nguyên ($m$):** $4$ loại phần cứng:
  * $A$: Cụm chu kỳ vi xử lý (CPU Cycles) — Tổng: $3$.
  * $B$: Khung trang bộ nhớ (Memory Space Frames) — Tổng: $17$.
  * $C$: Máy in laser mạng (Laser Printers) — Tổng: $16$.
  * $D$: Ổ đĩa băng từ lưu trữ (Tape Drives) — Tổng: $12$.
* **Vector tổng tài nguyên:** $\text{Resource} = [3, 17, 16, 12]$.
* **Vector tài nguyên rảnh ban đầu:** $\text{Available} = [1, 5, 2, 0]$.

### 2. Bảng trạng thái tại thời điểm $T_0$

| Tiến trình | Vai trò hệ thống | Allocation | Max | Need |
| :--- | :--- | :--- | :--- | :--- |
| $P_0$ | System Daemon | $0, 1, 1, 0$ | $0, 2, 1, 0$ | $0, 1, 0, 0$ |
| $P_1$ | Video Encoder | $1, 2, 3, 1$ | $1, 6, 5, 2$ | $0, 4, 2, 1$ |
| $P_2$ | Backup Service | $1, 3, 6, 5$ | $2, 3, 6, 6$ | $1, 0, 0, 1$ |
| $P_3$ | Print Spooler | $0, 6, 3, 2$ | $0, 6, 5, 2$ | $0, 0, 2, 0$ |
| $P_4$ | Log Analyzer | $0, 0, 1, 4$ | $0, 6, 5, 6$ | $0, 6, 4, 2$ |

Bảng trên liệt kê số lượng thực thể phần cứng $A, B, C, D$ của 5 tiến trình ứng dụng với lượng tài nguyên rảnh hiện có là $\text{Available} = [1, 5, 2, 0]$.

### 3. Diễn biến kiểm tra an toàn (Safety Algorithm)
Khởi tạo $\text{Work} = [1, 5, 2, 0]$ và $\text{Finish} = [\text{false}, \text{false}, \text{false}, \text{false}, \text{false}]$:
1. **Xét $P_0$:** $\text{Need}_0 = [0, 1, 0, 0] \le \text{Work} = [1, 5, 2, 0]$ $\rightarrow$ Thỏa mãn. Sau khi $P_0$ hoàn tất, thu hồi $\text{Allocation}_0$: $\text{Work} = [1, 5, 2, 0] + [0, 1, 1, 0] = [1, 6, 3, 0]$. Đặt $\text{Finish}[0] = \text{true}$.
2. **Xét $P_1$:** $\text{Need}_1 = [0, 4, 2, 1] \not\le \text{Work} = [1, 6, 3, 0]$ (vì thiếu ổ băng từ $D$: $1 > 0$) $\rightarrow$ $P_1$ phải chờ.
3. **Xét $P_2$:** $\text{Need}_2 = [1, 0, 0, 1] \not\le \text{Work} = [1, 6, 3, 0]$ (vì thiếu ổ băng từ $D$: $1 > 0$) $\rightarrow$ $P_2$ phải chờ.
4. **Xét $P_3$:** $\text{Need}_3 = [0, 0, 2, 0] \le \text{Work} = [1, 6, 3, 0]$ $\rightarrow$ Thỏa mãn. Sau khi $P_3$ hoàn tất, thu hồi $\text{Allocation}_3$: $\text{Work} = [1, 6, 3, 0] + [0, 6, 3, 2] = [1, 12, 6, 2]$. Đặt $\text{Finish}[3] = \text{true}$.
5. **Xét $P_4$:** $\text{Need}_4 = [0, 6, 4, 2] \le \text{Work} = [1, 12, 6, 2]$ $\rightarrow$ Thỏa mãn. Sau khi $P_4$ hoàn tất, thu hồi $\text{Allocation}_4$: $\text{Work} = [1, 12, 6, 2] + [0, 0, 1, 4] = [1, 12, 7, 6]$. Đặt $\text{Finish}[4] = \text{true}$.
6. **Quay lại vòng 2 xét $P_1$:** $\text{Need}_1 = [0, 4, 2, 1] \le \text{Work} = [1, 12, 7, 6]$ $\rightarrow$ Thỏa mãn. Thu hồi $\text{Allocation}_1$: $\text{Work} = [1, 12, 7, 6] + [1, 2, 3, 1] = [2, 14, 10, 7]$. Đặt $\text{Finish}[1] = \text{true}$.
7. **Xét $P_2$:** $\text{Need}_2 = [1, 0, 0, 1] \le \text{Work} = [2, 14, 10, 7]$ $\rightarrow$ Thỏa mãn. Thu hồi $\text{Allocation}_2$: $\text{Work} = [2, 14, 10, 7] + [1, 3, 6, 5] = [3, 17, 16, 12]$. Đặt $\text{Finish}[2] = \text{true}$.

* **Kết luận:** Hệ thống **An toàn (Safe State)** với chuỗi thực thi $\langle P_0, P_3, P_4, P_1, P_2 \rangle$.

### 4. Kịch bản yêu cầu tài nguyên mẫu
* **Yêu cầu a ($P_1$ yêu cầu $[2, 1, 1, 0]$):** Bị từ chối ngay ở bước lọc đầu vào vì yêu cầu $2$ đơn vị tài nguyên $A$ vượt quá cả $\text{Need}_1[A] = 0$ lẫn $\text{Available}[A] = 1$.
* **Yêu cầu b ($P_1$ yêu cầu $[0, 2, 1, 0]$):** Thỏa mãn $[0, 2, 1, 0] \le \text{Need}_1 = [0, 4, 2, 1]$ và $\le \text{Available} = [1, 5, 2, 0]$. Khi giả lập cấp phát, $\text{Available}$ mới là $[1, 3, 1, 0]$, $\text{Allocation}_1$ thành $[1, 4, 4, 1]$ và $\text{Need}_1$ giảm xuống $[0, 2, 1, 1]$. Chạy Safety Algorithm vẫn thu được chuỗi an toàn $\langle P_0, P_3, P_4, P_1, P_2 \rangle$ $\rightarrow$ **Chấp thuận cấp phát**.

---

## Kịch bản 3: Hệ thống Đa luồng & Cơ sở dữ liệu (Multi-threaded Server)

### 1. Bối cảnh thực tế
Một máy chủ giao dịch thương mại điện tử đa luồng quản lý việc phân bổ 3 loại tài nguyên phần mềm và kết nối cho 5 tiến trình xử lý dịch vụ ($P_0 \rightarrow P_4$).

* **Số lượng tiến trình ($n$):** $5$ tiến trình dịch vụ ($P_0 \rightarrow P_4$).
* **Số lượng loại tài nguyên ($m$):** $3$ loại tài nguyên phần mềm:
  * $A$: Khóa đồng bộ (Mutex Locks / Semaphores) — Tổng: $10$.
  * $B$: Phiên kết nối Cơ sở dữ liệu (Database Connections) — Tổng: $5$.
  * $C$: Luồng vào/ra tệp tin (I/O File Streams) — Tổng: $7$.
* **Vector tổng tài nguyên:** $\text{Resource} = [10, 5, 7]$.
* **Vector tài nguyên rảnh ban đầu:** $\text{Available} = [3, 3, 2]$.

### 2. Bảng trạng thái tại thời điểm $T_0$

| Tiến trình | Dịch vụ Backend | Allocation | Max | Need |
| :--- | :--- | :--- | :--- | :--- |
| $P_0$ | Auth Worker | $0, 1, 0$ | $7, 5, 3$ | $7, 4, 3$ |
| $P_1$ | Payment Thread | $2, 0, 0$ | $3, 2, 2$ | $1, 2, 2$ |
| $P_2$ | Order Processor | $3, 0, 2$ | $9, 0, 2$ | $6, 0, 0$ |
| $P_3$ | Cache Sync | $2, 1, 1$ | $2, 2, 2$ | $0, 1, 1$ |
| $P_4$ | Audit Logger | $0, 0, 2$ | $4, 3, 3$ | $4, 3, 1$ |

Bảng trên mô tả trạng thái kinh điển gồm 5 tiến trình và 3 loại tài nguyên với lượng rảnh ban đầu $\text{Available} = [3, 3, 2]$.

### 3. Diễn biến kiểm tra an toàn (Safety Algorithm)
Khởi tạo $\text{Work} = [3, 3, 2]$:
1. **$P_0$ chờ** vì $\text{Need}_0 = [7, 4, 3] \not\le [3, 3, 2]$.
2. **$P_1$ chạy xong:** $\text{Need}_1 = [1, 2, 2] \le [3, 3, 2]$ $\rightarrow$ $\text{Work} = [3, 3, 2] + [2, 0, 0] = [5, 3, 2]$.
3. **$P_2$ chờ** vì $\text{Need}_2 = [6, 0, 0] \not\le [5, 3, 2]$.
4. **$P_3$ chạy xong:** $\text{Need}_3 = [0, 1, 1] \le [5, 3, 2]$ $\rightarrow$ $\text{Work} = [5, 3, 2] + [2, 1, 1] = [7, 4, 3]$.
5. **$P_4$ chạy xong:** $\text{Need}_4 = [4, 3, 1] \le [7, 4, 3]$ $\rightarrow$ $\text{Work} = [7, 4, 3] + [0, 0, 2] = [7, 4, 5]$.
6. **Quay lại $P_0$ chạy xong:** $\text{Need}_0 = [7, 4, 3] \le [7, 4, 5]$ $\rightarrow$ $\text{Work} = [7, 4, 5] + [0, 1, 0] = [7, 5, 5]$.
7. **Quay lại $P_2$ chạy xong:** $\text{Need}_2 = [6, 0, 0] \le [7, 5, 5]$ $\rightarrow$ $\text{Work} = [7, 5, 5] + [3, 0, 2] = [10, 5, 7]$.

* **Kết luận:** Hệ thống **An toàn (Safe State)** với chuỗi thực thi $\langle P_1, P_3, P_4, P_0, P_2 \rangle$.

### 4. Kịch bản yêu cầu tài nguyên mẫu
* **Yêu cầu 1 ($P_1$ xin $[1, 0, 2]$):** Hợp lệ. Sau khi cấp phát, $\text{Available}$ còn $[2, 3, 0]$, $\text{Allocation}_1 = [3, 0, 2]$, $\text{Need}_1 = [0, 2, 0]$. Hệ thống vẫn an toàn với chuỗi $\langle P_1, P_3, P_4, P_0, P_2 \rangle$ $\rightarrow$ **Chấp thuận**.
* **Yêu cầu 2 ($P_4$ xin $[3, 3, 0]$ từ trạng thái gốc):** Bị buộc **Chờ (Wait)** vì yêu cầu $3$ kết nối $B$, nhưng nếu xét sau khi $P_1$ đã lấy $[1, 0, 2]$ thì $\text{Available} = [2, 3, 0]$ không đủ $3$ khóa $A$.
* **Yêu cầu 3 ($P_0$ xin $[0, 2, 0]$ sau khi $P_1$ đã nhận $[1, 0, 2]$):** Khi giả lập cấp phát, $\text{Available}$ giảm từ $[2, 3, 0]$ xuống $[2, 1, 0]$. Lúc này không một tiến trình nào thỏa mãn $\text{Need}_i \le [2, 1, 0]$ (vì $P_1$ cần $2$ đơn vị $B$, $P_3$ cần $1$ đơn vị $C$). Hệ thống rơi vào **Unsafe State** $\rightarrow$ **Từ chối & Rollback**.

---

## Kịch bản 4: Trạng thái Không an toàn (Unsafe State Demo)

### 1. Bối cảnh thực tế
Một cụm vi dịch vụ (Microservices) bị cấu hình quá tải ngay từ thời điểm chụp trạng thái $T_0$. Số lượng tài nguyên rảnh ban đầu không đủ để giải phóng tiến trình có nhu cầu lớn nhất về tài nguyên loại $B$, dùng để minh họa cách thuật toán phát hiện sớm nguy cơ bế tắc ngay khi vừa nạp dữ liệu.

* **Số lượng tiến trình ($n$):** $4$ tiến trình ($P_0 \rightarrow P_3$).
* **Số lượng loại tài nguyên ($m$):** $3$ loại tài nguyên ($A$: Worker Threads, $B$: GPU Contexts, $C$: Message Queues).
* **Vector tổng tài nguyên:** $\text{Resource} = [9, 2, 5]$.
* **Vector tài nguyên rảnh ban đầu:** $\text{Available} = [2, 1, 1]$.

### 2. Bảng trạng thái tại thời điểm $T_0$

| Tiến trình | Tên dịch vụ | Allocation | Max | Need |
| :--- | :--- | :--- | :--- | :--- |
| $P_0$ | Image Service | $1, 0, 1$ | $2, 1, 1$ | $1, 1, 0$ |
| $P_1$ | Deep Learning | $2, 1, 2$ | $5, 4, 4$ | $3, 3, 2$ |
| $P_2$ | Search Indexer | $3, 0, 0$ | $3, 1, 1$ | $0, 1, 1$ |
| $P_3$ | Notification | $1, 0, 1$ | $1, 1, 1$ | $0, 1, 0$ |

Bảng trên thể hiện trạng thái khởi đầu của 4 tiến trình dịch vụ khi toàn hệ thống chỉ có tổng cộng $2$ đơn vị tài nguyên $B$ (trong đó $P_1$ đang giữ $1$ và ngoài kho còn rảnh $1$).

### 3. Diễn biến kiểm tra an toàn (Safety Algorithm)
Khởi tạo $\text{Work} = [2, 1, 1]$ và $\text{Finish} = [\text{false}, \text{false}, \text{false}, \text{false}]$:
1. **Xét $P_0$:** $\text{Need}_0 = [1, 1, 0] \le \text{Work} = [2, 1, 1]$ $\rightarrow$ Thỏa mãn. Sau khi $P_0$ hoàn thành và trả tài nguyên: $\text{Work} = [2, 1, 1] + [1, 0, 1] = [3, 1, 2]$. Đặt $\text{Finish}[0] = \text{true}$.
2. **Xét $P_1$:** $\text{Need}_1 = [3, 3, 2] \not\le \text{Work} = [3, 1, 2]$ (thiếu tài nguyên $B$: cần $3$ nhưng chỉ có $1$) $\rightarrow$ $P_1$ phải chờ.
3. **Xét $P_2$:** $\text{Need}_2 = [0, 1, 1] \le \text{Work} = [3, 1, 2]$ $\rightarrow$ Thỏa mãn. Sau khi $P_2$ hoàn thành và trả tài nguyên: $\text{Work} = [3, 1, 2] + [3, 0, 0] = [6, 1, 2]$. Đặt $\text{Finish}[2] = \text{true}$.
4. **Xét $P_3$:** $\text{Need}_3 = [0, 1, 0] \le \text{Work} = [6, 1, 2]$ $\rightarrow$ Thỏa mãn. Sau khi $P_3$ hoàn thành và trả tài nguyên: $\text{Work} = [6, 1, 2] + [1, 0, 1] = [7, 1, 3]$. Đặt $\text{Finish}[3] = \text{true}$.
5. **Quay lại vòng 2 xét tiến trình duy nhất còn lại là $P_1$:**
   * So sánh $\text{Need}_1 = [3, 3, 2]$ với $\text{Work} = [7, 1, 3]$.
   * Dù tài nguyên $A$ ($3 \le 7$) và $C$ ($2 \le 3$) đã đủ, nhưng tài nguyên $B$ vẫn không thể đáp ứng ($3 > 1$) vì các tiến trình $P_0, P_2, P_3$ hoàn toàn không nắm giữ bất kỳ đơn vị tài nguyên $B$ nào để hoàn trả thêm.
   * Vòng lặp kết thúc với $\text{Finish} = [\text{true}, \text{false}, \text{true}, \text{true}]$.

* **Kết luận:** Hệ thống đang ở **Trạng thái Không an toàn (Unsafe State)**. Không tồn tại chuỗi Safe Sequence nào vì tiến trình $P_1$ chắc chắn bị kẹt ở bước hoàn tất.

---

## Mã nguồn tích hợp trực tiếp cho tệp `js/scenarios.js`

Nhóm có thể sao chép khối dữ liệu chuẩn hóa dưới đây vào tệp `js/scenarios.js` để nạp thẳng 4 kịch bản lên giao diện Web:

```javascript
/**
 * Tệp: js/scenarios.js
 * Nhiệm vụ: Cung cấp dữ liệu 4 kịch bản chuẩn cho ứng dụng mô phỏng Banker's Algorithm.
 */

export const SCENARIOS_DATA = [
    {
        id: "scenario_1_banking",
        title: "Kịch bản 1: Nghiệp vụ Ngân hàng (Ý tưởng gốc của Dijkstra)",
        description: "Ngân hàng quản lý 3 nguồn vốn tín dụng giải ngân theo từng giai đoạn cho 4 dự án xây dựng, đảm bảo luôn thu hồi đủ dòng tiền để không vỡ nợ.",
        n: 4,
        m: 3,
        processNames: [
            "P0 (Khu đô thị A)",
            "P1 (Cầu vượt B)",
            "P2 (Nhà máy C)",
            "P3 (Kho vận D)"
        ],
        resourceNames: [
            "A (Tiền mặt)",
            "B (Ngoại tệ)",
            "C (Bảo lãnh)"
        ],
        Resource: [10, 6, 8],
        Available: [3, 2, 2],
        Allocation: [
            [2, 1, 2],
            [3, 2, 1],
            [1, 1, 2],
            [1, 0, 1]
        ],
        Max: [
            [6, 4, 5],
            [5, 3, 3],
            [4, 3, 4],
            [7, 5, 6]
        ],
        Need: [
            [4, 3, 3],
            [2, 1, 2],
            [3, 2, 2],
            [6, 5, 5]
        ],
        sampleRequests: [
            {
                label: "P2 xin giải ngân (1, 0, 1) -> An toàn (Duyệt)",
                processId: 2,
                requestVector: [1, 0, 1],
                expectedStatus: "GRANTED_SAFE"
            },
            {
                label: "P3 xin giải ngân (2, 1, 1) -> Nguy cơ vỡ nợ (Rollback)",
                processId: 3,
                requestVector: [2, 1, 1],
                expectedStatus: "DENIED_UNSAFE_ROLLBACK"
            }
        ]
    },
    {
        id: "scenario_2_os_hardware",
        title: "Kịch bản 2: Cấp phát Phần cứng Hệ điều hành (OS Hardware)",
        description: "Hệ điều hành phân bổ CPU cycles, khung trang bộ nhớ, máy in Laser và ổ đĩa băng từ cho 5 tiến trình đang chạy đồng thời.",
        n: 5,
        m: 4,
        processNames: [
            "P0 (System Daemon)",
            "P1 (Video Encoder)",
            "P2 (Backup Service)",
            "P3 (Print Spooler)",
            "P4 (Log Analyzer)"
        ],
        resourceNames: [
            "A (CPU Cycles)",
            "B (Memory Space)",
            "C (Laser Printers)",
            "D (Tape Drives)"
        ],
        Resource: [3, 17, 16, 12],
        Available: [1, 5, 2, 0],
        Allocation: [
            [0, 1, 1, 0],
            [1, 2, 3, 1],
            [1, 3, 6, 5],
            [0, 6, 3, 2],
            [0, 0, 1, 4]
        ],
        Max: [
            [0, 2, 1, 0],
            [1, 6, 5, 2],
            [2, 3, 6, 6],
            [0, 6, 5, 2],
            [0, 6, 5, 6]
        ],
        Need: [
            [0, 1, 0, 0],
            [0, 4, 2, 1],
            [1, 0, 0, 1],
            [0, 0, 2, 0],
            [0, 6, 4, 2]
        ],
        sampleRequests: [
            {
                label: "P1 yêu cầu (2, 1, 1, 0) -> Vượt giới hạn (Từ chối)",
                processId: 1,
                requestVector: [2, 1, 1, 0],
                expectedStatus: "ERROR_EXCEED_NEED"
            },
            {
                label: "P1 yêu cầu (0, 2, 1, 0) -> Hợp lệ & An toàn (Duyệt)",
                processId: 1,
                requestVector: [0, 2, 1, 0],
                expectedStatus: "GRANTED_SAFE"
            }
        ]
    },
    {
        id: "scenario_3_multithreaded_server",
        title: "Kịch bản 3: Hệ thống Đa luồng & Cơ sở dữ liệu (Server)",
        description: "Quản lý khóa đồng bộ Mutex/Semaphore, kết nối Database và luồng I/O giữa 5 tiến trình xử lý giao dịch.",
        n: 5,
        m: 3,
        processNames: [
            "P0 (Auth Worker)",
            "P1 (Payment Thread)",
            "P2 (Order Processor)",
            "P3 (Cache Sync)",
            "P4 (Audit Logger)"
        ],
        resourceNames: [
            "A (Mutex Locks)",
            "B (DB Connections)",
            "C (I/O Streams)"
        ],
        Resource: [10, 5, 7],
        Available: [3, 3, 2],
        Allocation: [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2]
        ],
        Max: [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3]
        ],
        Need: [
            [7, 4, 3],
            [1, 2, 2],
            [6, 0, 0],
            [0, 1, 1],
            [4, 3, 1]
        ],
        sampleRequests: [
            {
                label: "P1 yêu cầu (1, 0, 2) -> Hợp lệ & An toàn (Duyệt)",
                processId: 1,
                requestVector: [1, 0, 2],
                expectedStatus: "GRANTED_SAFE"
            },
            {
                label: "P0 yêu cầu (0, 2, 0) -> Gây Unsafe (Từ chối & Rollback)",
                processId: 0,
                requestVector: [0, 2, 0],
                expectedStatus: "DENIED_UNSAFE_ROLLBACK"
            },
            {
                label: "P4 yêu cầu (3, 3, 0) -> Vượt Available sau khi cấp P1 (Chờ)",
                processId: 4,
                requestVector: [3, 3, 0],
                expectedStatus: "WAIT_INSUFFICIENT_AVAILABLE"
            }
        ]
    },
    {
        id: "scenario_4_unsafe_demo",
        title: "Kịch bản 4: Trạng thái Không an toàn (Unsafe State Demo)",
        description: "Trạng thái khởi đầu không tồn tại chuỗi an toàn do thiếu hụt tài nguyên loại B cho tiến trình P1, chứng minh khả năng phát hiện nguy cơ Deadlock ngay từ đầu.",
        n: 4,
        m: 3,
        processNames: [
            "P0 (Image Service)",
            "P1 (Deep Learning)",
            "P2 (Search Indexer)",
            "P3 (Notification)"
        ],
        resourceNames: [
            "A (Worker Threads)",
            "B (GPU Contexts)",
            "C (Message Queues)"
        ],
        Resource: [9, 2, 5],
        Available: [2, 1, 1],
        Allocation: [
            [1, 0, 1],
            [2, 1, 2],
            [3, 0, 0],
            [1, 0, 1]
        ],
        Max: [
            [2, 1, 1],
            [5, 4, 4],
            [3, 1, 1],
            [1, 1, 1]
        ],
        Need: [
            [1, 1, 0],
            [3, 3, 2],
            [0, 1, 1],
            [0, 1, 0]
        ],
        sampleRequests: [
            {
                label: "P0 yêu cầu (1, 0, 0) -> Từ chối vì hệ thống vốn đang Unsafe",
                processId: 0,
                requestVector: [1, 0, 0],
                expectedStatus: "DENIED_UNSAFE_ROLLBACK"
            }
        ]
    }
];
```