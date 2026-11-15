# Mô phỏng Thuật toán Banker của Dijkstra (Deadlock Avoidance Simulator)

Dự án Web App tương tác mô phỏng cơ chế tránh tắc nghẽn (Deadlock Avoidance) trong Hệ điều hành bằng thuật toán Banker của Edsger Dijkstra, hỗ trợ sinh yêu cầu tài nguyên tự động, kiểm tra trạng thái an toàn (Safe State) và tìm chuỗi an toàn (Safe Sequence)[cite: 21, 22, 79].

## 1. Cơ sở lý thuyết và Nguyên lý thuật toán

### Khái niệm Deadlock và Tránh Deadlock
Deadlock là tình trạng một tập hợp các tiến trình bị chặn vĩnh viễn vì mỗi tiến trình đang giữ tài nguyên và chờ tài nguyên do tiến trình khác trong tập hợp nắm giữ[cite: 9, 32, 79]. Tình trạng này xảy ra khi thỏa mãn đồng thời 4 điều kiện Coffman: Loại trừ tương hỗ (Mutual Exclusion), Giữ và chờ (Hold and Wait), Không trưng dụng (No Preemption) và Chờ đợi vòng tròn (Circular Wait)[cite: 10, 37, 38, 79].

Thuật toán Banker thuộc nhóm giải pháp Tránh Deadlock (Deadlock Avoidance) dành cho hệ thống có nhiều thể hiện (multiple instances) trên mỗi loại tài nguyên[cite: 20, 53, 57]. Mỗi tiến trình khi khởi tạo phải khai báo trước số lượng tối đa của từng loại tài nguyên mà nó có thể yêu cầu[cite: 21, 57, 79]. Hệ thống chỉ chấp thuận cấp phát nếu sau khi cấp, hệ thống vẫn duy trì ở trạng thái an toàn (Safe State), tức tồn tại ít nhất một thứ tự thực thi giúp toàn bộ tiến trình hoàn thành công việc[cite: 18, 51, 52, 79].

### Cấu trúc dữ liệu cốt lõi
Với n tiến trình và m loại tài nguyên, trạng thái hệ thống được biểu diễn qua các cấu trúc sau[cite: 21, 58]:
* **Vector tổng tài nguyên** `Resource[m]`: Tổng số lượng thể hiện của từng loại tài nguyên trong hệ thống[cite: 58].
* **Vector tài nguyên rảnh** `Available[m]`: Số lượng tài nguyên chưa cấp phát, sẵn sàng sử dụng của mỗi loại[cite: 21, 58, 79].
* **Ma trận nhu cầu tối đa** `Max[n][m]`: Lượng tài nguyên tối đa mỗi tiến trình được phép yêu cầu[cite: 21, 59, 79].
* **Ma trận đang cấp phát** `Allocation[n][m]`: Lượng tài nguyên hiện đang giao cho từng tiến trình nắm giữ[cite: 21, 59, 79].
* **Ma trận nhu cầu còn thiếu** `Need[n][m]`: Lượng tài nguyên tiến trình còn cần thêm để hoàn thành, tính theo công thức `Need[i][j] = Max[i][j] - Allocation[i][j]`[cite: 21, 59].

### Hai thuật toán thành phần

**Thuật toán Kiểm tra An toàn (Safety Algorithm):**
1. Khởi tạo vector làm việc `Work = Available` và mảng đánh dấu `Finish[i] = false` với mọi i từ 0 đến n - 1[cite: 22, 63].
2. Tìm tiến trình Pi thỏa mãn đồng thời hai điều kiện: `Finish[i] == false` và `Need[i] <= Work`[cite: 22, 63].
3. Nếu tìm thấy, giả định Pi chạy xong và trả lại tài nguyên bằng cách cập nhật `Work = Work + Allocation[i]`, đặt `Finish[i] = true`, đưa Pi vào chuỗi an toàn rồi lặp lại bước 2[cite: 22, 63].
4. Khi không còn tiến trình nào thỏa mãn bước 2, nếu mọi `Finish[i] == true` thì hệ thống ở trạng thái Safe; ngược lại hệ thống ở trạng thái Unsafe[cite: 18, 22, 63].

**Thuật toán Xử lý Yêu cầu Tài nguyên (Resource-Request Algorithm):**
1. Khi tiến trình Pi gửi yêu cầu `Request[i]`, kiểm tra `Request[i] <= Need[i]`; nếu vượt quá giới hạn đã đăng ký thì báo lỗi vi phạm[cite: 22, 64, 79].
2. Kiểm tra `Request[i] <= Available`; nếu không đủ tài nguyên rảnh thì buộc Pi phải chờ[cite: 22, 64, 79].
3. Giả lập cấp phát tạm thời bằng cách cập nhật: `Available = Available - Request[i]`, `Allocation[i] = Allocation[i] + Request[i]` và `Need[i] = Need[i] - Request[i]`[cite: 23, 64, 79].
4. Chạy Safety Algorithm trên trạng thái giả lập: nếu Safe thì cấp phát chính thức; nếu Unsafe thì khôi phục trạng thái ban đầu (Rollback) và bắt Pi chờ[cite: 23, 64, 79].

## 2. Ví dụ minh họa chuẩn

Xét hệ thống gồm 5 tiến trình (P0 đến P4) và 3 loại tài nguyên (A, B, C) với tổng tài nguyên (10, 5, 7) và tài nguyên rảnh ban đầu Available = (3, 3, 2)[cite: 23]:

| Tiến trình | Allocation | Max | Need | Available |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | 0, 1, 0 | 7, 5, 3 | 7, 4, 3 | 3, 3, 2 |
| **P1** | 2, 0, 0 | 3, 2, 2 | 1, 2, 2 | |
| **P2** | 3, 0, 2 | 9, 0, 2 | 6, 0, 0 | |
| **P3** | 2, 1, 1 | 2, 2, 2 | 0, 1, 1 | |
| **P4** | 0, 0, 2 | 4, 3, 3 | 4, 3, 1 | |

**Giải thích kết quả kiểm tra và cấp phát:**
* **Kiểm tra trạng thái ban đầu:** Khởi tạo `Work` bằng (3, 3, 2)[cite: 22, 23]. Lần lượt các tiến trình thỏa mãn điều kiện `Need[i] <= Work` và giải phóng tài nguyên theo thứ tự: P1 cập nhật `Work` lên (5, 3, 2), P3 lên (7, 4, 3), P4 lên (7, 4, 5), P0 lên (7, 5, 5) và P2 lên (10, 5, 7)[cite: 22, 23]. Hệ thống an toàn với chuỗi Safe Sequence là `<P1, P3, P4, P0, P2>`[cite: 18, 22, 23].
* **Xử lý yêu cầu hợp lệ:** Khi P1 yêu cầu (1, 0, 2), điều kiện `(1, 0, 2) <= Need[1] (1, 2, 2)` và `(1, 0, 2) <= Available (3, 3, 2)` đều thỏa mãn[cite: 22, 23]. Sau khi giả lập cấp phát, `Available` còn (2, 3, 0), `Allocation[1]` thành (3, 0, 2) và `Need[1]` còn (0, 2, 0)[cite: 23]. Chạy lại Safety Algorithm vẫn tìm được chuỗi an toàn `<P1, P3, P4, P0, P2>` nên yêu cầu được duyệt[cite: 22, 23, 64].
* **Xử lý yêu cầu từ chối:** Nếu sau đó P4 yêu cầu (3, 3, 0) thì bị buộc chờ vì vượt quá `Available` (2, 3, 0)[cite: 22, 23]. Nếu P0 yêu cầu (0, 2, 0), giả lập cấp phát khiến `Available` chỉ còn (2, 1, 0) (không tiến trình nào chạy được vì mọi `Need[i] > (2, 1, 0)`), hệ thống rơi vào Unsafe nên phải Rollback và từ chối[cite: 23, 64, 79].

## 3. Ứng dụng thực tế trong mô phỏng

Dự án tích hợp 3 kịch bản thực tế vào file **scenarios.js** để minh họa tính ứng dụng của thuật toán:
* **Quản lý phần cứng Hệ điều hành (OS Kernel Resource Manager):** Điều phối các tiến trình hệ thống cạnh tranh ổ băng từ (Tape Drives), máy in (Printers) và bộ nhớ đệm (Buffers)[cite: 17, 19, 35, 79].
* **Quản lý thanh khoản tín dụng ngân hàng (Core Banking Liquidity):** Ngân hàng quản lý quỹ tiền mặt dự trữ trước các đợt giải ngân từng phần của các dự án doanh nghiệp đã đăng ký hạn mức tín dụng tối đa, đảm bảo dòng vốn luôn thu hồi được để không vỡ nợ[cite: 21, 57, 79].
* **Điều phối cụm máy chủ đám mây (Cloud GPU Cluster Scheduler):** Phân bổ các tài nguyên phần cứng giới hạn gồm GPU, RAM và ổ cứng NVMe cho các tác vụ huấn luyện mô hình trí tuệ nhân tạo mà không gây treo cụm máy chủ.

## 4. Cấu trúc dự án và Phân chia công việc (12 Tuần - 4 Thành viên)

### Sơ đồ cây thư mục
```text
banker-algorithm-simulator/
├── index.html              # Khung giao diện chính (5 Tab điều hướng độc lập)
├── css/
│   └── style.css           # Định dạng bố cục Tab, bảng ma trận và hiệu ứng
├── js/
│   ├── scenarios.js        # Kho dữ liệu kịch bản thực tế & bộ Test Case mẫu
│   ├── banker_core.js      # Thuật toán lõi viết thuần theo phong cách C/C++
│   └── app.js              # Điều khiển sự kiện DOM, chuyển Tab và hiển thị từng bước
├── assets/
│   └── images/             # Lưu sơ đồ RAG và ảnh minh họa
└── README.md               # Tài liệu hướng dẫn chạy đồ án và phân công nhiệm vụ
```

### Lộ trình thực hiện 12 tuần

| Giai đoạn | Thời gian | Mục tiêu chính | Phụ trách | Sản phẩm bàn giao |
| :--- | :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | Tuần 1 - 2 | Nghiên cứu & Thiết kế | Cả nhóm | Đặc tả Schema, khung HTML |
| **Giai đoạn 2** | Tuần 3 - 5 | Xây dựng Core & Data | Thành viên 1, 2 | File core và file kịch bản |
| **Giai đoạn 3** | Tuần 6 - 8 | Xây dựng Giao diện | Thành viên 3, 4 | Giao diện 5 Tab hoàn chỉnh |
| **Giai đoạn 4** | Tuần 9 - 10 | Tích hợp & Mô phỏng | Thành viên 1, 4 | Chạy mượt Step-by-step |
| **Giai đoạn 5** | Tuần 11 - 12 | Kiểm thử & Báo cáo | Thành viên 2, 3 | Bộ Test tự động, hoàn thiện |

### Chi tiết phân công nhiệm vụ
* **Thành viên 1 (Phụ trách thuật toán - file banker_core.js):** Cài đặt toàn bộ các hàm tính toán ma trận, Safety Algorithm, Resource-Request Algorithm, cơ chế Rollback và bộ sinh yêu cầu tài nguyên ngẫu nhiên tuân thủ nghiêm ngặt cú pháp C/C++[cite: 22, 63, 64].
* **Thành viên 2 (Phụ trách dữ liệu & kiểm thử - file scenarios.js & Tab 4):** Thiết kế dữ liệu cho 3 kịch bản ứng dụng thực tế, xây dựng các bài toán mẫu từ giáo trình và viết bộ kiểm thử tự động đối chiếu kết quả đầu ra[cite: 1, 7, 23].
* **Thành viên 3 (Phụ trách giao diện & nội dung học thuật - file index.html, style.css & Tab 1, 3, 5):** Xây dựng khung giao diện 5 Tab, biên soạn nội dung cuộn dọc cho Tab Lý thuyết trực quan, Tab Phân tích ưu/nhược điểm (so sánh Prevention, Avoidance, Detection) và Tab Thông tin nhóm[cite: 16, 44, 65, 79].
* **Thành viên 4 (Phụ trách điều khiển tương tác - file app.js & Tab 2):** Kết nối dữ liệu từ **scenarios.js** và **banker_core.js** lên giao diện, lập trình bảng nhập liệu ma trận động, hiển thị nhật ký chạy từng bước (Step-by-step) và cảnh báo trực quan khi cấp phát hoặc Rollback[cite: 64, 79].

## 5. Tổng hợp các hàm cần phải viết

### Nhóm 1: Các hàm trong file banker_core.js (Thuật toán lõi phong cách C/C++)

| Tên hàm | Tham số đầu vào | Giá trị trả về | Nhiệm vụ cụ thể |
| :--- | :--- | :--- | :--- |
| `calculateNeedMatrix` | `n, m, Max, Allocation, Need` | Không (`void`) | Tính `Need[i][j] = Max[i][j] - Allocation[i][j]` bằng 2 vòng lặp `for`[cite: 21, 59]. |
| `isVectorLessOrEqual` | `m, vectorA, vectorB` | `Boolean` | Kiểm tra `vectorA[j] <= vectorB[j]` với mọi j từ 0 đến m - 1[cite: 21]. |
| `copyVector` | `m, source, destination` | Không (`void`) | Sao chép từng phần tử mảng 1 chiều để tạo bản sao độc lập[cite: 22]. |
| `copyMatrix` | `n, m, srcMatrix, destMatrix` | Không (`void`) | Sao chép mảng 2 chiều phục vụ lưu trạng thái trước khi giả lập. |
| `validateSystemState` | `n, m, Resource, Available, Max, Allocation` | `Object` | Kiểm tra tính hợp lệ: `Allocation <= Max` và tổng tài nguyên khớp `Resource`[cite: 21, 58, 59]. |
| `runSafetyAlgorithm` | `n, m, Available, Allocation, Need` | `Object` | Chạy Safety Algorithm, trả về cờ `isSafe`, mảng `safeSequence` và `stepsLog`[cite: 22, 63]. |
| `requestResources` | `n, m, Available, Max, Allocation, Need, processId, Request` | `Object` | Kiểm tra `Request`, giả lập cấp phát, gọi hàm an toàn và tự động Rollback nếu Unsafe[cite: 22, 23, 64, 79]. |
| `generateRandomRequest` | `n, m, Need, Available, mode` | `Object` | Sinh ngẫu nhiên tiến trình `processId` và vector `Request[m]` theo chế độ hợp lệ hoặc bất kỳ. |

### Nhóm 2: Các hàm trong file scenarios.js (Quản lý kịch bản & Kiểm thử)

| Tên hàm | Tham số đầu vào | Giá trị trả về | Nhiệm vụ cụ thể |
| :--- | :--- | :--- | :--- |
| `getScenarioById` | `scenarioId` | `Object` | Tìm và trả về bản sao dữ liệu của kịch bản theo mã định danh. |
| `getAllScenariosList` | Không có | `Array` | Trả về danh sách tóm tắt các kịch bản để hiển thị lên thẻ chọn. |
| `getAutomatedTestCases` | Không có | `Array` | Cung cấp danh sách các Test Case cố định kèm kết quả kỳ vọng (`expectedOutcome`)[cite: 1, 7, 23]. |

### Nhóm 3: Các hàm trong file app.js (Điều khiển Giao diện & Sự kiện)

| Tên hàm | Tham số đầu vào | Giá trị trả về | Nhiệm vụ cụ thể |
| :--- | :--- | :--- | :--- |
| `switchTab` | `tabId` | Không (`void`) | Ẩn tất cả các thẻ nội dung và chỉ hiển thị Tab được người dùng chọn. |
| `loadScenarioToUI` | `scenarioId` | Không (`void`) | Nạp dữ liệu kịch bản từ **scenarios.js** vào biến trạng thái hiện hành và vẽ lại bảng. |
| `renderMatricesTables` | `systemState` | Không (`void`) | Sinh mã HTML cho các bảng `Allocation`, `Max`, `Need` và `Available`[cite: 21, 59]. |
| `readStateFromInputs` | Không có | `Object` | Đọc giá trị người dùng chỉnh sửa trực tiếp trên các ô nhập liệu HTML vào mảng. |
| `handleCheckSafetyClick` | Không có | Không (`void`) | Bắt sự kiện bấm nút kiểm tra an toàn, gọi `runSafetyAlgorithm` và in chuỗi Safe Sequence[cite: 22, 63]. |
| `handleSendRequestClick` | Không có | Không (`void`) | Đọc vector `Request` từ giao diện, gọi `requestResources` và thông báo kết quả Duyệt/Từ chối[cite: 22, 64]. |
| `handleRandomRequestClick`| `mode` | Không (`void`) | Gọi `generateRandomRequest`, điền số liệu vừa sinh vào ô input và chạy kiểm tra. |
| `renderStepByStepTable` | `stepsLog` | Không (`void`) | Vẽ bảng giải thích từng bước biến đổi của vector `Work` và mảng `Finish`[cite: 2, 22, 63]. |
| `runAllTestsInTab` | Không có | Không (`void`) | Chạy toàn bộ Test Case trong Tab Kiểm thử và hiển thị trạng thái Pass/Fail. |

## 6. Hướng dẫn cài đặt và chạy dự án

1. Tải toàn bộ thư mục mã nguồn về máy tính (không cần cài đặt Node.js hay trình biên dịch phụ trợ).
2. Mở trực tiếp file **index.html** bằng trình duyệt web bất kỳ (Chrome, Edge, Firefox) hoặc sử dụng tiện ích Live Server trên VS Code.
3. Sử dụng thanh điều hướng phía trên để chuyển đổi giữa 5 phần: xem lý thuyết trực quan, thực hành mô phỏng kịch bản, xem bảng phân tích so sánh, chạy bộ kiểm thử tự động và xem thông tin nhóm thực hiện.