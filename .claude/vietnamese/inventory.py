#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Vietnamese has no published graded word list (see `vietnamese_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

Syllables of one word are joined by `_` (`cảm_ơn`).  A word may carry a part
of speech after a colon (`anh:pron`) where the level wants one reading to lead
the card.  Matching is through `vi.fold`, so a tone mark written in the older
place (`khoẻ`) or the newer (`khỏe`) resolves either way; the card prints
Wiktionary's own spelling.
"""

A1 = [
    ('pronouns and kinship terms', 'tôi:pron bạn:pron anh:pron chị:pron em:pron ông:pron bà:pron cô:pron '
     'chú:pron bác:pron cháu:pron con:pron nó họ:pron chúng_tôi chúng_ta mình:pron ta:pron'),
    ('family', 'gia_đình bố mẹ cha ba má vợ chồng con_trai con_gái anh_trai:noun chị_gái:noun em_trai:noun em_gái:noun '
     'bạn_bè người'),
    ('questions', 'gì ai đâu nào bao_nhiêu mấy sao tại_sao thế_nào khi_nào bao_giờ không:particle chưa à'),
    ('particles and adverbs', 'ạ nhé nhỉ ơi rồi cũng đã đang sẽ vẫn còn lắm rất quá hơn nhất cả chỉ thôi '
     'đều lại nữa ngay cùng'),
    ('conjunctions and prepositions', 'và với nhưng hay hoặc vì nên nếu thì mà khi để của ở trong ngoài '
     'trên dưới trước sau bên cạnh giữa từ đến tới cho về bằng'),
    ('greetings and politeness', 'xin_chào chào cảm_ơn xin_lỗi không_sao tạm_biệt vâng dạ xin mời'),
    ('numbers', 'một hai ba:num bốn năm:num sáu bảy tám chín mười mươi trăm nghìn triệu số nửa đầu_tiên'),
    ('time', 'giờ phút giây ngày đêm sáng trưa chiều tối hôm_nay ngày_mai hôm_qua bây_giờ tuần tháng năm:noun '
     'sớm muộn luôn_luôn thường lúc'),
    ('days', 'thứ_hai:noun thứ_ba:noun thứ_tư:noun thứ_năm:noun thứ_sáu:noun thứ_bảy:noun chủ_nhật'),
    ('food and drink', 'ăn uống cơm phở bánh_mì nước trà cà_phê sữa bia thịt gà cá rau trứng muối đường '
     'trái_cây hoa_quả chuối cam ngon đói khát no bún mì nấu'),
    ('shopping and money', 'mua bán tiền đồng giá đắt rẻ chợ cửa_hàng siêu_thị trả'),
    ('the home', 'nhà phòng cửa giường bàn ghế bếp nhà_vệ_sinh sống'),
    ('the town and getting about', 'thành_phố đường phố trường_học bệnh_viện ngân_hàng khách_sạn nhà_hàng '
     'sân_bay ga xe xe_máy ô_tô xe_buýt tàu máy_bay xe_đạp đi đến về chạy rẽ trái phải thẳng gần xa'),
    ('work and school', 'làm việc công_việc học sinh_viên học_sinh giáo_viên thầy bác_sĩ trường lớp sách bút '
     'tiếng_Việt tiếng_Anh'),
    ('the body and feeling ill', 'đầu mắt tai mũi miệng tay chân bụng răng tóc đau ốm mệt thuốc khoẻ'),
    ('the weather', 'trời nóng lạnh mưa nắng gió mát'),
    ('colours', 'màu đỏ xanh vàng trắng đen nâu hồng tím'),
    ('describing', 'to lớn nhỏ bé mới cũ tốt xấu dài ngắn cao thấp nhanh chậm vui buồn đẹp dễ khó nhiều ít '
     'đúng sai'),
    ('everyday verbs', 'là có muốn thích yêu biết hiểu nói nghe nhìn xem thấy đọc viết hỏi trả_lời gọi đợi '
     'chờ cần phải có_thể được mở đóng ngồi đứng ngủ dậy tắm mặc chơi giúp gặp nhớ quên bắt_đầu lấy đưa '
     'mang'),
    ('classifiers', 'cái:classifier con:classifier chiếc quyển cuốn'),
    ('about yourself', 'tên tuổi nước điện_thoại máy_tính sinh_nhật'),
]

A2 = [
    ('relatives and the people around you', 'ông_bà bố_mẹ cha_mẹ anh_em chị_em họ_hàng cô_dâu chú_rể '
     'hàng_xóm đồng_nghiệp người_yêu bạn_trai bạn_gái trẻ_em em_bé thanh_niên người_lớn khách đàn_ông '
     'phụ_nữ cụ'),
    ('jobs and the workplace', 'nghề công_ty văn_phòng giám_đốc nhân_viên công_nhân nông_dân kỹ_sư y_tá '
     'luật_sư cảnh_sát lái_xe đầu_bếp ca_sĩ nhà_báo lương họp nghỉ kiếm'),
    ('school and study', 'bài bài_tập thi điểm câu_hỏi từ chữ ngôn_ngữ lớp_học '
     'đại_học thư_viện giấy vở bảng ôn luyện dạy'),
    ('clothes', 'quần_áo áo quần váy giày dép mũ áo_dài kính túi đồng_hồ cởi đội đeo vừa rộng chật'),
    ('food, cooking and the market', 'tôm cua đậu gạo nước_mắm hành tỏi ớt chua cay '
     'mặn ngọt đắng chiên luộc nướng xào món bữa bát đũa thìa cốc dao chai hộp cân'),
    ('the home', 'tầng cầu_thang nhà_tắm phòng_ngủ phòng_khách sân vườn tủ tủ_lạnh đèn ti_vi máy_giặt '
     'quạt chìa_khoá cửa_sổ tường thuê dọn rửa'),
    ('the town and its places', 'quận làng phố_cổ công_viên bưu_điện nhà_thờ chùa đền bảo_tàng rạp '
     'bến_xe trạm cầu ngã_tư đèn_đỏ vỉa_hè quán'),
    ('the countryside and animals', 'nông_thôn núi sông biển hồ rừng đồng ruộng cây hoa lá đất đá '
     'động_vật chó mèo lợn bò trâu ngựa chim vịt chuột khỉ voi hổ rắn'),
    ('seasons and directions', 'mùa mùa_xuân mùa_hè mùa_thu mùa_đông bắc nam:noun đông:noun tây:noun '
     'miền thời_tiết nhiệt_độ độ:noun bão tuyết mây ẩm'),
    ('travel and directions', 'du_lịch chuyến vé hộ_chiếu hành_lý đặt bản_đồ địa_chỉ hướng '
     'qua dừng đỗ lên xuống:verb khởi_hành'),
    ('health and the body', 'cơ_thể mặt cổ vai lưng tim ngón_tay da sốt ho cảm bệnh khám đơn_thuốc '
     'nghỉ_ngơi'),
    ('feelings and character', 'cảm_thấy hạnh_phúc lo sợ giận ngạc_nhiên chán thú_vị hiền thông_minh '
     'chăm_chỉ lười vui_vẻ tức lo_lắng thất_vọng tự_hào hài_lòng'),
    ('free time, sport and festivals', 'thời_gian rảnh bóng_đá bơi thể_thao âm_nhạc bài_hát hát nhảy '
     'phim ảnh chụp vẽ trò_chơi ăn_tết lễ_hội quà cuối_tuần'),
    ('telling what happened and when', 'trước_đây sau_đó lần vừa mới sắp xong cuối thỉnh_thoảng '
     'hiếm_khi ngày_xưa tương_lai quá_khứ năm_ngoái'),
    ('giving an opinion', 'nghĩ cho_rằng ý_kiến đồng_ý chắc chắc_chắn có_lẽ hy_vọng quan_trọng '
     'tuyệt cần_thiết theo'),
    ('more classifiers', 'người:classifier quả tờ bức:classifier ngôi đôi bộ'),
    ('everyday verbs', 'đi_bộ mang gửi nhận bán thử chọn quyết_định giải_thích kể bỏ giữ tìm mất thắng '
     'thua bật tắt dùng sửa trả lại chuẩn_bị kết_hôn sinh chết đổi'),
]

B1 = [
    ('work and careers', 'sự_nghiệp kinh_nghiệm phỏng_vấn ứng_viên tuyển_dụng hợp_đồng nghỉ_hưu thất_nghiệp '
     'chuyên_môn đào_tạo năng_lực thăng_chức doanh_nghiệp khách_hàng sản_phẩm dịch_vụ dự_án đối_tác '
     'quản_lý lãnh_đạo nhiệm_vụ trách_nhiệm'),
    ('money and the economy', 'kinh_tế tài_chính thu_nhập chi_phí ngân_sách thuế giá_cả lạm_phát đầu_tư '
     'tiết_kiệm vay nợ lãi thị_trường xuất_khẩu nhập_khẩu thương_mại giàu nghèo nghèo_đói phát_triển '
     'tăng_trưởng tiền_mặt thẻ'),
    ('education', 'giáo_dục học_bổng bằng chứng_chỉ môn chương_trình học_kỳ luận_văn kiến_thức kỹ_năng '
     'trình_độ tốt_nghiệp du_học nghiên_cứu thí_nghiệm khoa_học toán văn_học lịch_sử địa_lý'),
    ('the news, media and technology', 'tin_tức báo_chí truyền_hình đài phóng_viên quảng_cáo mạng_xã_hội '
     'internet trang_web công_nghệ phần_mềm thiết_bị tải email mật_khẩu dữ_liệu kỹ_thuật_số điện_thoại_di_động'),
    ('government, law and society', 'chính_phủ nhà_nước chính_trị chính_sách bầu_cử quốc_hội luật pháp_luật '
     'toà_án công_dân quyền xã_hội cộng_đồng dân_số văn_hoá truyền_thống tôn_giáo tình_nguyện '
     'tham_nhũng biểu_tình hoà_bình'),
    ('the environment and nature', 'môi_trường ô_nhiễm rác tái_chế khí_hậu thiên_nhiên tài_nguyên '
     'năng_lượng lũ_lụt hạn_hán động_đất thảm_hoạ bảo_vệ bảo_tồn sa_mạc đại_dương'),
    ('health and medicine', 'sức_khoẻ chữa điều_trị phẫu_thuật triệu_chứng dị_ứng tiêm '
     'chế_độ_ăn béo gầy căng_thẳng trầm_cảm hút_thuốc phòng_khám cấp_cứu hồi_phục'),
    ('travel and transport', 'giao_thông tắc_đường phương_tiện hành_khách chuyến_bay đường_sắt cảng '
     'biên_giới visa khách_du_lịch điểm_đến lịch_trình đặt_phòng hải_quan'),
    ('the household and chores', 'việc_nhà giặt lau quét nấu_ăn đồ_đạc sửa_chữa hoá_đơn tiền_điện '
     'chủ_nhà người_thuê'),
    ('relationships and the stages of life', 'tình_bạn hôn_nhân ly_hôn đám_cưới đám_tang tuổi_thơ '
     'tuổi_trẻ tuổi_già thế_hệ nuôi_dạy hẹn_hò chia_tay tôn_trọng tin_cậy'),
    ('feelings and character', 'cảm_xúc tính_cách tự_tin xấu_hổ ghen ngại kiên_nhẫn ích_kỷ tốt_bụng '
     'trung_thực lịch_sự thô_lỗ nhút_nhát tò_mò biết_ơn cô_đơn hối_hận'),
    ('religion, customs and festivals', 'Phật_giáo đạo thờ cúng tổ_tiên phong_tục lễ tục_lệ '
     'Trung_thu lì_xì'),
    ('ideas, reasons and plans', 'vấn_đề nguyên_nhân kết_quả lý_do mục_đích ảnh_hưởng tác_động lợi_ích '
     'khả_năng điều_kiện kinh_nghiệm quan_điểm thái_độ giải_pháp kế_hoạch mục_tiêu sự_kiện '
     'tình_hình hiện_tượng'),
    ('connectors', 'tuy tuy_nhiên mặc_dù do_đó vì_vậy ngoài_ra bên_cạnh_đó thay_vì trong_khi '
     'cho_nên chẳng_hạn ví_dụ nói_chung nói_cách_khác cuối_cùng trước_hết thứ_nhất miễn_là '
     'trừ_khi kẻo'),
    ('thinking, deciding, arguing and changing', 'cân_nhắc so_sánh phân_tích đánh_giá thảo_luận '
     'tranh_luận thuyết_phục phản_đối ủng_hộ đồng_tình bày_tỏ đề_xuất từ_chối chấp_nhận '
     'cải_thiện giảm phát_triển ảnh_hưởng thích_nghi'),
]

B2 = [
    ('politics and public administration', 'chính_quyền nhà_lãnh_đạo đảng_viên thủ_tướng chủ_tịch '
     'đại_biểu bộ_trưởng hành_chính cơ_quan thủ_tục cải_cách dân_chủ độc_lập chủ_quyền ngoại_giao '
     'hiệp_định liên_minh bầu tranh_cử ứng_cử_viên nhiệm_kỳ'),
    ('the law and the courts', 'hiến_pháp quy_định vi_phạm xử_phạt bị_cáo nguyên_đơn thẩm_phán luật_sư '
     'bản_án kháng_cáo bằng_chứng điều_tra tố_cáo khởi_tố xét_xử hình_sự dân_sự tranh_chấp '
     'quyền_lợi nghĩa_vụ'),
    ('the economy and finance', 'cổ_phiếu chứng_khoán lợi_nhuận doanh_thu thua_lỗ khủng_hoảng suy_thoái '
     'cạnh_tranh độc_quyền tiêu_dùng nguồn_vốn tín_dụng tỷ_giá ngoại_tệ bất_động_sản nhà_đầu_tư '
     'sản_lượng công_nghiệp nông_nghiệp'),
    ('science and research', 'giả_thuyết lý_thuyết phương_pháp khảo_sát số_liệu thống_kê mẫu kết_luận '
     'phát_minh sáng_chế vật_lý hoá_học sinh_học di_truyền tế_bào phân_tử nhà_khoa_học'),
    ('technology', 'trí_tuệ_nhân_tạo thuật_toán lập_trình máy_chủ ứng_dụng nền_tảng an_ninh_mạng '
     'tự_động_hoá đổi_mới cập_nhật'),
    ('the environment and natural resources', 'biến_đổi_khí_hậu khí_thải hiệu_ứng_nhà_kính sinh_thái '
     'đa_dạng_sinh_học khoáng_sản rừng_nhiệt_đới nước_ngầm xói_mòn bền_vững năng_lượng_tái_tạo '
     'phá_rừng tuyệt_chủng'),
    ('health and the mind', 'tâm_lý sức_khoẻ_tâm_thần y_tế dịch_bệnh đại_dịch miễn_dịch truyền_nhiễm '
     'mãn_tính di_chứng phục_hồi_chức_năng lo_âu áp_lực'),
    ('the arts, literature and the media', 'tác_phẩm tác_giả nhà_văn nhà_thơ tiểu_thuyết thơ '
     'kịch_bản đạo_diễn điêu_khắc hội_hoạ triển_lãm biên_tập xuất_bản truyền_thông dư_luận '
     'kiểm_duyệt'),
    ('history and society', 'triều_đại phong_kiến thuộc_địa kháng_chiến cách_mạng di_sản di_tích '
     'dân_tộc thiểu_số bình_đẳng phân_biệt bất_bình_đẳng đô_thị_hoá di_cư phúc_lợi an_sinh'),
    ('argument and evaluation', 'luận_điểm lập_luận luận_cứ minh_chứng hệ_quả hậu_quả ưu_điểm nhược_điểm '
     'thuận_lợi bất_lợi khía_cạnh xu_hướng tiêu_chí giả_định mâu_thuẫn nhận_thức quan_niệm '
     'tầm_quan_trọng'),
    ('formal connectors', 'hơn_thế_nữa bên_cạnh mặt_khác trái_lại nhằm nhờ_vào dẫn_đến bởi_vì '
     'do vì_thế đồng_thời tóm_lại nhìn_chung xét_cho_cùng nhìn_chung tuỳ_theo dựa_trên '
     'căn_cứ_vào'),
    ('reporting, analysing and persuading', 'khẳng_định nhấn_mạnh phủ_nhận đánh_giá bình_luận lập_luận '
     'chỉ_trích phê_phán đề_cập trình_bày tổng_hợp lý_giải đối_chiếu kiến_nghị thúc_đẩy '
     'hạn_chế khuyến_khích ngăn_ngừa'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2}
