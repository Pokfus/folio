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

INVENTORY = {'a1': A1, 'a2': A2}
